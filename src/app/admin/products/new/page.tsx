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

interface ProductVariant {
  sku: string;
  price: number;
  stock: number;
  weight?: number;
  image_url?: string;
  options: { [optionName: string]: string };
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

  const [productOptions, setProductOptions] = useState<ProductOption[]>([
    {
      name: 'Talla',
      type: 'size',
      values: []
    },
    {
      name: 'Color',
      type: 'color',
      values: []
    }
  ]);

  const [productVariants, setProductVariants] = useState<ProductVariant[]>([]);
  const [showVariantsSection, setShowVariantsSection] = useState(false);

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
      const newOption: ProductOption = {
        name: newOptionTitle.trim(),
        type: 'select',
        values: []
      };
      setProductOptions(prev => [...prev, newOption]);
      setNewOptionTitle('');
    }
  };

  const addOptionValue = (optionIndex: number, value: string, colorHex?: string) => {
    if (value.trim()) {
      const newValue: ProductOptionValue = {
        value: value.trim(),
        color_hex: colorHex
      };
      
      setProductOptions(prev => 
        prev.map((option, index) => 
          index === optionIndex 
            ? { ...option, values: [...option.values, newValue] }
            : option
        )
      );
      setNewOptionValue('');
    }
  };

  const removeOptionValue = (optionIndex: number, valueIndex: number) => {
    setProductOptions(prev => 
      prev.map((option, index) => 
        index === optionIndex 
          ? { ...option, values: option.values.filter((_, i) => i !== valueIndex) }
          : option
      )
    );
  };

  const removeOption = (optionIndex: number) => {
    setProductOptions(prev => prev.filter((_, index) => index !== optionIndex));
  };

  const updateOptionType = (optionIndex: number, type: ProductOption['type']) => {
    setProductOptions(prev => 
      prev.map((option, index) => 
        index === optionIndex 
          ? { ...option, type }
          : option
      )
    );
  };

  const generateVariants = () => {
    const optionsWithValues = productOptions.filter(option => option.values.length > 0);
    
    if (optionsWithValues.length === 0) {
      setProductVariants([{
        sku: formData.sku || `${formData.name.slice(0, 3).toUpperCase()}-001`,
        price: formData.price,
        stock: formData.stock,
        weight: formData.weight || undefined,
        options: {}
      }]);
      return;
    }

    const combinations: ProductVariant[] = [];
    
    function generateCombinations(optionIndex: number, currentCombination: { [key: string]: string }) {
      if (optionIndex === optionsWithValues.length) {
        const sku = `${formData.sku || formData.name.slice(0, 3).toUpperCase()}-${combinations.length + 1}`;
        combinations.push({
          sku,
          price: formData.price,
          stock: Math.floor(formData.stock / (combinations.length + 1)) || 0,
          weight: formData.weight || undefined,
          options: { ...currentCombination }
        });
        return;
      }

      const option = optionsWithValues[optionIndex];
      option.values.forEach(value => {
        generateCombinations(optionIndex + 1, {
          ...currentCombination,
          [option.name]: value.value
        });
      });
    }

    generateCombinations(0, {});
    setProductVariants(combinations);
    setShowVariantsSection(true);
  };

  const updateVariant = (variantIndex: number, field: keyof ProductVariant, value: any) => {
    setProductVariants(prev => 
      prev.map((variant, index) => 
        index === variantIndex 
          ? { ...variant, [field]: value }
          : variant
      )
    );
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

      // Crear las variantes del producto
      if (productVariants.length > 0) {
        for (const variant of productVariants) {
          const { data: createdVariant, error: variantError } = await supabase
            .from('product_variants')
            .insert([{
              product_id: product.id,
              sku: variant.sku,
              price: variant.price,
              stock: variant.stock,
              weight: variant.weight || null,
              image_url: variant.image_url || null,
              active: true
            }])
            .select()
            .single();

          if (variantError) throw variantError;

          // Asociar los valores de opciones con la variante
          for (const [optionName, optionValue] of Object.entries(variant.options)) {
            // Buscar el option_value_id correspondiente
            const { data: optionValueData, error: optionValueError } = await supabase
              .from('product_option_values')
              .select('id')
              .eq('value', optionValue)
              .single();

            if (!optionValueError && optionValueData) {
              await supabase
                .from('variant_option_values')
                .insert([{
                  variant_id: createdVariant.id,
                  option_value_id: optionValueData.id
                }]);
            }
          }
        }
      } else {
        // Crear una variante básica si no hay opciones
        await supabase
          .from('product_variants')
          .insert([{
            product_id: product.id,
            sku: sku,
            price: formData.price,
            stock: formData.stock,
            weight: formData.weight,
            active: true
          }]);
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
          
          {productOptions.map((option, optionIndex) => (
            <div key={optionIndex} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={option.name}
                    onChange={(e) => setProductOptions(prev => 
                      prev.map((opt, idx) => 
                        idx === optionIndex ? { ...opt, name: e.target.value } : opt
                      )
                    )}
                    className="text-sm font-medium text-gray-900 border border-gray-300 rounded px-2 py-1"
                    placeholder="Nombre de la opción"
                  />
                  <select
                    value={option.type}
                    onChange={(e) => updateOptionType(optionIndex, e.target.value as ProductOption['type'])}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="select">Selección</option>
                    <option value="color">Color</option>
                    <option value="size">Talla</option>
                    <option value="text">Texto</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => removeOption(optionIndex)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Eliminar opción
                </button>
              </div>
              
              {option.values.length > 0 && (
                <div className="mb-3">
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value, valueIndex) => (
                      <span
                        key={valueIndex}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {option.type === 'color' && value.color_hex && (
                          <span 
                            className="w-3 h-3 rounded-full mr-2 border border-gray-300"
                            style={{ backgroundColor: value.color_hex }}
                          />
                        )}
                        {value.value}
                        <button
                          type="button"
                          onClick={() => removeOptionValue(optionIndex, valueIndex)}
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
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOptionValue(optionIndex, newOptionValue))}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  placeholder="Agregar valor"
                />
                {option.type === 'color' && (
                  <input
                    type="color"
                    value="#000000"
                    onChange={(e) => {
                      // Temporal storage for color
                      const colorInput = e.target;
                      colorInput.dataset.colorValue = e.target.value;
                    }}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                    title="Seleccionar color"
                  />
                )}
                <button
                  type="button"
                  onClick={() => {
                    const colorInput = document.querySelector('input[type="color"]') as HTMLInputElement;
                    const colorHex = option.type === 'color' && colorInput ? colorInput.dataset.colorValue : undefined;
                    addOptionValue(optionIndex, newOptionValue, colorHex);
                  }}
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

          {productOptions.some(option => option.values.length > 0) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={generateVariants}
                className="bg-green-100 text-green-700 px-4 py-2 rounded-md hover:bg-green-200 transition-colors"
              >
                Generar Variantes ({productOptions.reduce((acc, opt) => acc * Math.max(opt.values.length, 1), 1)} combinaciones)
              </button>
            </div>
          )}
        </div>

        {/* Variantes del producto */}
        {showVariantsSection && productVariants.length > 0 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Variantes del Producto</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SKU
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Opciones
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Peso (g)
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productVariants.map((variant, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(variant.options).map(([optionName, optionValue]) => (
                            <span key={optionName} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              {optionName}: {optionValue}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', Number(e.target.value))}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', Number(e.target.value))}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          min="0"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={variant.weight || ''}
                          onChange={(e) => updateVariant(index, 'weight', e.target.value ? Number(e.target.value) : undefined)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          min="0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

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
