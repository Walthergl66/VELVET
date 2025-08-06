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
  sizes: string[];
  colors: string[];
}

interface ProductOption {
  name: string;
  type: 'select' | 'color' | 'size' | 'text';
  values: ProductOptionValue[];
}

interface ProductOptionValue {
  value: string;
  color_hex?: string;
  image_url?: string;
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
    images: [],
    sizes: [],
    colors: []
  });

  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);

  const [newTag, setNewTag] = useState('');
  const [selectedOptionType, setSelectedOptionType] = useState('');

  // Opciones predefinidas con sus valores
  const predefinedOptions = {
    'Talla': {
      type: 'size' as const,
      values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
    },
    'Color': {
      type: 'color' as const,
      values: [
        { name: 'Negro', hex: '#000000' },
        { name: 'Blanco', hex: '#FFFFFF' },
        { name: 'Rojo', hex: '#FF0000' },
        { name: 'Azul', hex: '#0000FF' },
        { name: 'Verde', hex: '#008000' },
        { name: 'Amarillo', hex: '#FFFF00' },
        { name: 'Rosa', hex: '#FFC0CB' },
        { name: 'Morado', hex: '#800080' },
        { name: 'Naranja', hex: '#FFA500' },
        { name: 'Gris', hex: '#808080' },
        { name: 'Marrón', hex: '#A52A2A' },
        { name: 'Beige', hex: '#F5F5DC' }
      ]
    },
    'Material': {
      type: 'select' as const,
      values: ['Algodón', 'Poliéster', 'Seda', 'Lana', 'Lino', 'Denim', 'Cuero', 'Sintético', 'Mezcla']
    },
    'Estilo': {
      type: 'select' as const,
      values: ['Casual', 'Formal', 'Deportivo', 'Elegante', 'Vintage', 'Moderno', 'Clásico', 'Bohemio']
    },
    'Talla de Calzado': {
      type: 'size' as const,
      values: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46']
    },
    'Género': {
      type: 'select' as const,
      values: ['Hombre', 'Mujer', 'Unisex', 'Niño', 'Niña']
    },
    'Temporada': {
      type: 'select' as const,
      values: ['Primavera', 'Verano', 'Otoño', 'Invierno', 'Todo el año']
    },
    'Acabado': {
      type: 'select' as const,
      values: ['Mate', 'Brillante', 'Satinado', 'Texturizado', 'Liso', 'Rugoso']
    }
  };

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
    if (!selectedOptionType) return;

    // Verificar si la opción ya existe
    const existingOption = productOptions.find(opt => opt.name === selectedOptionType);
    if (existingOption) {
      alert('Esta opción ya ha sido agregada');
      return;
    }

    const predefinedOption = predefinedOptions[selectedOptionType as keyof typeof predefinedOptions];
    
    if (predefinedOption) {
      // Agregar la opción sin valores inicialmente
      const newOption: ProductOption = {
        name: selectedOptionType,
        type: predefinedOption.type,
        values: []
      };
      setProductOptions(prev => [...prev, newOption]);
    }
    
    setSelectedOptionType('');
  };

  const addValueToOption = (optionIndex: number, value: string, colorHex?: string) => {
    setProductOptions(prev => prev.map((option, index) => {
      if (index === optionIndex) {
        // Verificar si el valor ya existe
        const valueExists = option.values.some(v => v.value === value);
        if (valueExists) {
          return option;
        }
        
        const newValue: ProductOptionValue = {
          value: value,
          ...(colorHex && { color_hex: colorHex })
        };
        return { ...option, values: [...option.values, newValue] };
      }
      return option;
    }));
  };

  const removeValueFromOption = (optionIndex: number, valueIndex: number) => {
    setProductOptions(prev => prev.map((option, index) => {
      if (index === optionIndex) {
        return {
          ...option,
          values: option.values.filter((_, i) => i !== valueIndex)
        };
      }
      return option;
    }));
  };

  const removeOption = (optionIndex: number) => {
    setProductOptions(prev => prev.filter((_, index) => index !== optionIndex));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'El nombre es requerido';
    if (!formData.description.trim()) return 'La descripción es requerida';
    if (formData.price <= 0) return 'El precio debe ser mayor a 0';
    if (!formData.category_id) return 'La categoría es requerida';
    if (formData.stock < 0) return 'El stock no puede ser negativo';
    if (formData.images.length === 0) return 'Debes subir al menos una imagen del producto';
    
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
      // Generar SKU único si no se proporciona
      let sku = formData.sku?.trim();
      if (!sku) {
        sku = `VEL-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      }

      // Verificar si el SKU ya existe
      const { data: existingSku } = await supabase
        .from('products')
        .select('id')
        .eq('sku', sku)
        .single();

      if (existingSku) {
        alert(`El SKU "${sku}" ya existe. Por favor usa un SKU diferente o déjalo vacío para generar uno automáticamente.`);
        setLoading(false);
        return;
      }

      // Preparar los datos del producto
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        discount_price: formData.discount_price ? Number(formData.discount_price) : null,
        category_id: formData.category_id || null,
        subcategory_id: formData.subcategory_id || null,
        stock: Number(formData.stock),
        featured: Boolean(formData.featured),
        brand: formData.brand || null,
        material: formData.material || null,
        care_instructions: formData.care_instructions || null,
        sku: sku,
        weight: formData.weight ? Number(formData.weight) : null,
        tags: formData.tags || [],
        images: formData.images || [],
        sizes: formData.sizes || [],
        colors: formData.colors || [],
        active: true
      };

      console.log('Datos del producto a crear:', JSON.stringify(productData, null, 2));

      // Crear el producto
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      console.log('Respuesta de Supabase:', { product, error: productError });

      if (productError) {
        console.error('Error detallado de Supabase:', JSON.stringify(productError, null, 2));
        throw productError;
      }

      // Crear las opciones del producto con sus valores
      for (const [optionIndex, option] of productOptions.entries()) {
        if (option.values.length > 0) {
          // Crear la opción
          const { data: createdOption, error: optionError } = await supabase
            .from('product_options')
            .insert([{
              product_id: product.id,
              name: option.name,
              type: option.type,
              position: optionIndex
            }])
            .select()
            .single();

          if (optionError) throw optionError;

          // Crear los valores de la opción
          const optionValues = option.values.map((value, valueIndex) => ({
            option_id: createdOption.id,
            value: value.value,
            color_hex: value.color_hex || null,
            image_url: value.image_url || null,
            position: valueIndex
          }));

          const { error: valuesError } = await supabase
            .from('product_option_values')
            .insert(optionValues);

          if (valuesError) throw valuesError;
        }
      }

      alert('Producto creado exitosamente');
      router.push('/admin/products');

    } catch (error: unknown) {
      console.error('Error creating product:', error);
      console.error('Error detallado:', JSON.stringify(error, null, 2));
      
      let errorMessage = 'Error desconocido';
      
      // Manejar errores específicos de base de datos
      if (error && typeof error === 'object' && error !== null) {
        const dbError = error as { code?: string; message?: string };
        
        if (dbError.code === '23505') {
          if (dbError.message?.includes('products_sku_key')) {
            errorMessage = 'El SKU ya existe. Por favor usa un SKU diferente o déjalo vacío para generar uno automáticamente.';
          } else {
            errorMessage = 'Ya existe un registro con esos datos. Verifica que todos los campos únicos sean diferentes.';
          }
        } else if (dbError.code === '23502') {
          errorMessage = 'Faltan campos obligatorios. Verifica que hayas completado todos los campos requeridos.';
        } else if (dbError.code === '23503') {
          errorMessage = 'Referencia inválida. Verifica que la categoría seleccionada sea válida.';
        } else if (dbError.message) {
          errorMessage = dbError.message;
        } else {
          errorMessage = JSON.stringify(error);
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert('Error al crear el producto: ' + errorMessage);
    } finally {
      setLoading(false);
    }
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
                SKU <span className="text-gray-500 text-sm">(Opcional - se generará automáticamente si se deja vacío)</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="Ej: CAM-001 (opcional)"
              />
              <p className="text-xs text-gray-500 mt-1">
                El SKU debe ser único. Si no proporcionas uno, se generará automáticamente.
              </p>
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">Imágenes del Producto</h2>
            <span className="text-sm text-gray-500">
              {formData.images.length === 0 ? (
                <span className="text-red-600 font-medium">* Al menos 1 imagen requerida</span>
              ) : (
                <span className="text-green-600 font-medium">✓ {formData.images.length} imagen{formData.images.length > 1 ? 'es' : ''} agregada{formData.images.length > 1 ? 's' : ''}</span>
              )}
            </span>
          </div>
          
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
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Instrucciones para agregar imágenes:
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Selecciona las imágenes desde tu computadora</li>
                    <li>Verifica que se muestren en la vista previa</li>
                    <li><strong>Haz clic en "Subir" para confirmar las imágenes</strong></li>
                    <li>Las imágenes aparecerán en la sección "Imágenes agregadas"</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles adicionales */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Detalles Adicionales <span className="text-sm text-gray-500 font-normal">(Opcional)</span></h2>
          
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
              <p className="text-xs text-gray-500 mt-1">
                Útil para cálculos de envío
              </p>
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
                placeholder="Ej: Lavar a máquina en agua fría, no usar cloro, secar a la sombra..."
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
          
          {/* Selector para agregar nuevas opciones */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex space-x-3 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Agregar Opción
                </label>
                <select
                  value={selectedOptionType}
                  onChange={(e) => setSelectedOptionType(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="">Seleccionar tipo de opción...</option>
                  {Object.keys(predefinedOptions).map(optionName => (
                    <option key={optionName} value={optionName}>
                      {optionName}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={addOption}
                disabled={!selectedOptionType}
                className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Opciones agregadas */}
          {productOptions.length > 0 && (
            <div className="space-y-4">
              {productOptions.map((option, optionIndex) => (
                <div key={optionIndex} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">{option.name}</h3>
                    <button
                      type="button"
                      onClick={() => removeOption(optionIndex)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Eliminar
                    </button>
                  </div>

                  {/* Selector para agregar valores a esta opción */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex space-x-3 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Agregar valor para {option.name}
                        </label>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              const predefinedOption = predefinedOptions[option.name as keyof typeof predefinedOptions];
                              if (predefinedOption?.type === 'color') {
                                const colorOption = (predefinedOption.values as any[]).find((c: any) => c.name === e.target.value);
                                if (colorOption) {
                                  addValueToOption(optionIndex, colorOption.name, colorOption.hex);
                                }
                              } else {
                                addValueToOption(optionIndex, e.target.value);
                              }
                              e.target.value = ''; // Reset selector
                            }
                          }}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        >
                          <option value="">Seleccionar valor...</option>
                          {predefinedOptions[option.name as keyof typeof predefinedOptions]?.type === 'color' 
                            ? (predefinedOptions[option.name as keyof typeof predefinedOptions]?.values as any[])?.map((color: any) => (
                                <option key={color.name} value={color.name}>
                                  {color.name}
                                </option>
                              ))
                            : (predefinedOptions[option.name as keyof typeof predefinedOptions]?.values as string[])?.map((value: string) => (
                                <option key={value} value={value}>
                                  {value}
                                </option>
                              ))
                          }
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Valores seleccionados para esta opción */}
                  {option.values.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Valores seleccionados:</h4>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value, valueIndex) => (
                          <span
                            key={valueIndex}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {option.type === 'color' && value.color_hex && (
                              <span 
                                className="w-3 h-3 rounded-full mr-2 border border-gray-300 inline-block"
                                style={{ backgroundColor: value.color_hex }}
                              />
                            )}
                            {value.value}
                            <button
                              type="button"
                              onClick={() => removeValueFromOption(optionIndex, valueIndex)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {option.values.length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No has seleccionado valores para esta opción
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {productOptions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No has agregado opciones para este producto.</p>
              <p className="text-sm">Selecciona una opción arriba para comenzar.</p>
            </div>
          )}
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
            onClick={(e) => {
              const validationError = validateForm();
              if (validationError) {
                e.preventDefault();
                alert(`Error de validación: ${validationError}`);
                return;
              }
            }}
          >
            {loading ? 'Creando...' : 'Crear Producto'}
          </button>
        </div>
      </form>
    </div>
  );
}
