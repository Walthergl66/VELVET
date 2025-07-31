'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';
import ImageUpload from '@/components/admin/ImageUpload';
import Image from 'next/image';

/**
 * Página para crear un nuevo producto
 * Incluye formulario completo con subida de imágenes
 */

interface ProductForm {
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  category_id: string;
  subcategory_id: string;
  stock: number;
  featured: boolean;
  brand: string;
  material: string;
  care_instructions: string;
  sku: string;
  weight: number | null;
  tags: string[];
  images: string[];
}

interface ProductOptions {
  [optionTitle: string]: string[];
}

export default function NewProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    price: 0,
    discount_price: null,
    category_id: '',
    subcategory_id: '',
    stock: 0,
    featured: false,
    brand: '',
    material: '',
    care_instructions: '',
    sku: '',
    weight: null,
    tags: [],
    images: []
  });

  const [productOptions, setProductOptions] = useState<ProductOptions>({
    'Talla': [],
    'Color': []
  });

  const [newTag, setNewTag] = useState('');
  const [newOptionTitle, setNewOptionTitle] = useState('');
  const [newOptionValue, setNewOptionValue] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              type === 'number' ? (value === '' ? null : parseFloat(value)) :
              value
    }));
  };

  const handleImagesUploaded = (urls: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...urls]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addOption = () => {
    if (newOptionTitle.trim()) {
      setProductOptions(prev => ({
        ...prev,
        [newOptionTitle.trim()]: []
      }));
      setNewOptionTitle('');
    }
  };

  const addOptionValue = (optionTitle: string) => {
    if (newOptionValue.trim() && !productOptions[optionTitle].includes(newOptionValue.trim())) {
      setProductOptions(prev => ({
        ...prev,
        [optionTitle]: [...prev[optionTitle], newOptionValue.trim()]
      }));
      setNewOptionValue('');
    }
  };

  const removeOptionValue = (optionTitle: string, valueIndex: number) => {
    setProductOptions(prev => ({
      ...prev,
      [optionTitle]: prev[optionTitle].filter((_, i) => i !== valueIndex)
    }));
  };

  const removeOption = (optionTitle: string) => {
    setProductOptions(prev => {
      const newOptions = { ...prev };
      delete newOptions[optionTitle];
      return newOptions;
    });
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'El nombre es requerido';
    if (!formData.description.trim()) return 'La descripción es requerida';
    if (formData.price <= 0) return 'El precio debe ser mayor a 0';
    if (!formData.category_id) return 'La categoría es requerida';
    if (formData.stock < 0) return 'El stock no puede ser negativo';
    if (formData.images.length === 0) return 'Al menos una imagen es requerida';
    
    return null;
  };

  const createProduct = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    setLoading(true);

    try {
      // Crear el producto
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([{
          ...formData,
          subcategory_id: formData.subcategory_id || null,
          discount_price: formData.discount_price || null,
          weight: formData.weight || null
        }])
        .select()
        .single();

      if (productError) throw productError;

      // Crear las opciones del producto
      for (const [optionTitle, values] of Object.entries(productOptions)) {
        if (values.length > 0) {
          // Crear la opción
          const { data: option, error: optionError } = await supabase
            .from('product_options')
            .insert([{
              product_id: product.id,
              title: optionTitle
            }])
            .select()
            .single();

          if (optionError) throw optionError;

          // Crear los valores de la opción
          const optionValues = values.map(value => ({
            option_id: option.id,
            value
          }));

          const { error: valuesError } = await supabase
            .from('product_option_values')
            .insert(optionValues);

          if (valuesError) throw valuesError;
        }
      }

      // Crear variantes básicas (una por cada combinación de opciones)
      await createProductVariants(product.id);

      alert('Producto creado exitosamente');
      router.push('/admin/products');

    } catch (error) {
      console.error('Error creating product:', error);
      alert('Error al crear el producto: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const createProductVariants = async (productId: string) => {
    // Crear al menos una variante base
    const { error } = await supabase
      .from('product_variants')
      .insert([{
        product_id: productId,
        price: formData.price,
        stock: formData.stock,
        weight: formData.weight
      }]);

    if (error) throw error;
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category_id);
  const subcategories = selectedCategory?.subcategories || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Nuevo Producto
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Completa la información para crear un nuevo producto
          </p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); createProduct(); }} className="space-y-8">
        {/* Información básica */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Información Básica</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Producto *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Ej: Camisa de algodón premium"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Describe las características, materiales y beneficios del producto..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Regular *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price || ''}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio con Descuento
              </label>
              <input
                type="number"
                name="discount_price"
                value={formData.discount_price || ''}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subcategoría
              </label>
              <select
                name="subcategory_id"
                value={formData.subcategory_id}
                onChange={handleInputChange}
                disabled={!formData.category_id}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-50"
              >
                <option value="">Seleccionar subcategoría</option>
                {subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock Inicial *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock || ''}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Ej: CAM-001"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="ml-2 text-sm text-gray-700">Producto destacado</span>
            </label>
          </div>
        </div>

        {/* Imágenes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Imágenes del Producto</h2>
          
          {/* Imágenes existentes */}
          {formData.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Imágenes agregadas ({formData.images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={url}
                        alt={`Producto ${index + 1}`}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ImageUpload
            onImagesUploaded={handleImagesUploaded}
            maxFiles={10}
            existingImages={formData.images}
            folder="products"
          />
        </div>

        {/* Detalles adicionales */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Detalles Adicionales</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Ej: Nike, Adidas, VELVET"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <input
                type="text"
                name="material"
                value={formData.material}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Ej: 100% Algodón, Poliéster"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso (gramos)
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight || ''}
                onChange={handleInputChange}
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instrucciones de Cuidado
              </label>
              <textarea
                name="care_instructions"
                value={formData.care_instructions}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Ej: Lavar a máquina en agua fría, no usar cloro..."
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Etiquetas</h2>
          
          {formData.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(index)}
                      className="ml-2 text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Agregar etiqueta"
            />
            <button
              type="button"
              onClick={addTag}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Opciones del producto */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Opciones del Producto</h2>
          
          {Object.entries(productOptions).map(([optionTitle, values]) => (
            <div key={optionTitle} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">{optionTitle}</h3>
                <button
                  type="button"
                  onClick={() => removeOption(optionTitle)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Eliminar opción
                </button>
              </div>
              
              {values.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {values.map((value, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {value}
                        <button
                          type="button"
                          onClick={() => removeOptionValue(optionTitle, index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newOptionValue}
                  onChange={(e) => setNewOptionValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOptionValue(optionTitle))}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Agregar valor"
                />
                <button
                  type="button"
                  onClick={() => addOptionValue(optionTitle)}
                  className="bg-blue-100 text-blue-700 px-3 py-2 rounded-md text-sm hover:bg-blue-200 transition-colors"
                >
                  Agregar
                </button>
              </div>
            </div>
          ))}

          <div className="flex space-x-2">
            <input
              type="text"
              value={newOptionTitle}
              onChange={(e) => setNewOptionTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              placeholder="Nombre de nueva opción (ej: Estilo, Acabado)"
            />
            <button
              type="button"
              onClick={addOption}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
            >
              Nueva Opción
            </button>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creando...' : 'Crear Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}
