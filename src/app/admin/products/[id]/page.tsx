'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product, Category } from '@/types';
import ImageUpload from '@/components/admin/ImageUpload';
import Image from 'next/image';

/**
 * Página para editar un producto existente
 * Incluye formulario completo con gestión de imágenes
 */

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadProduct(params.id as string);
      loadCategories();
    }
  }, [params.id]);

  const loadProduct = async (productId: string) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!products_category_id_fkey (
            id,
            name,
            slug
          )
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Producto no encontrado');

      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
      alert('Error al cargar el producto');
      router.push('/admin/products');
    } finally {
      setLoading(false);
    }
  };

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
    if (!product) return;

    const { name, value, type } = e.target;
    
    setProduct(prev => ({
      ...prev!,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              type === 'number' ? (value === '' ? null : parseFloat(value)) :
              value
    }));
  };

  const handleImagesUploaded = (urls: string[]) => {
    if (!product) return;

    setProduct(prev => ({
      ...prev!,
      images: [...prev!.images, ...urls]
    }));
  };

  const removeImage = (index: number) => {
    if (!product) return;

    setProduct(prev => ({
      ...prev!,
      images: prev!.images.filter((_, i) => i !== index)
    }));
  };

  const reorderImages = (fromIndex: number, toIndex: number) => {
    if (!product) return;

    const newImages = [...product.images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);

    setProduct(prev => ({
      ...prev!,
      images: newImages
    }));
  };

  const addTag = (tag: string) => {
    if (!product || !tag.trim() || product.tags.includes(tag.trim())) return;

    setProduct(prev => ({
      ...prev!,
      tags: [...prev!.tags, tag.trim()]
    }));
  };

  const removeTag = (index: number) => {
    if (!product) return;

    setProduct(prev => ({
      ...prev!,
      tags: prev!.tags.filter((_, i) => i !== index)
    }));
  };

  const saveProduct = async () => {
    if (!product) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          description: product.description,
          price: product.price,
          discount_price: product.discount_price,
          category_id: product.category_id,
          subcategory_id: product.subcategory_id || null,
          stock: product.stock,
          featured: product.featured,
          brand: product.brand,
          material: product.material,
          care_instructions: product.care_instructions,
          sku: product.sku,
          weight: product.weight,
          tags: product.tags,
          images: product.images,
          active: product.active,
          updated_at: new Date().toISOString()
        })
        .eq('id', product.id);

      if (error) throw error;

      alert('Producto actualizado exitosamente');
      router.push('/admin/products');

    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error al guardar el producto: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white shadow rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Producto no encontrado</h1>
        <button
          onClick={() => router.push('/admin/products')}
          className="bg-black text-white px-4 py-2 rounded-md"
        >
          Volver a Productos
        </button>
      </div>
    );
  }

  const selectedCategory = categories.find(cat => cat.id === product.category_id);
  const subcategories = selectedCategory?.subcategories || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Editar Producto
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {product.name}
          </p>
        </div>
        <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
          <button
            onClick={() => setProduct(prev => ({ ...prev!, active: !prev!.active }))}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
              product.active
                ? 'text-red-700 bg-red-100 hover:bg-red-200'
                : 'text-green-700 bg-green-100 hover:bg-green-200'
            }`}
          >
            {product.active ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); saveProduct(); }} className="space-y-8">
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
                value={product.name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                name="description"
                value={product.description || ''}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio Regular *
              </label>
              <input
                type="number"
                name="price"
                value={product.price || ''}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio con Descuento
              </label>
              <input
                type="number"
                name="discount_price"
                value={product.discount_price || ''}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                name="category_id"
                value={product.category_id || ''}
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
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={product.stock || ''}
                onChange={handleInputChange}
                required
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                checked={product.featured}
                onChange={handleInputChange}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <span className="ml-2 text-sm text-gray-700">Producto destacado</span>
            </label>
          </div>
        </div>

        {/* Gestión de imágenes */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">
            Imágenes del Producto ({product.images.length})
          </h2>
          
          {/* Imágenes existentes */}
          {product.images.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Imágenes actuales
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.images.map((url, index) => (
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
                    
                    {/* Controles de imagen */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 flex space-x-2">
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => reorderImages(index, index - 1)}
                            className="bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                            title="Mover a la izquierda"
                          >
                            ←
                          </button>
                        )}
                        {index < product.images.length - 1 && (
                          <button
                            type="button"
                            onClick={() => reorderImages(index, index + 1)}
                            className="bg-white text-gray-700 rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                            title="Mover a la derecha"
                          >
                            →
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                          title="Eliminar imagen"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Badge de imagen principal */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2">
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Principal
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <ImageUpload
            onImagesUploaded={handleImagesUploaded}
            maxFiles={10}
            existingImages={product.images}
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
                value={product.brand || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={product.sku || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <input
                type="text"
                name="material"
                value={product.material || ''}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso (gramos)
              </label>
              <input
                type="number"
                name="weight"
                value={product.weight || ''}
                onChange={handleInputChange}
                min="0"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instrucciones de Cuidado
              </label>
              <textarea
                name="care_instructions"
                value={product.care_instructions || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Etiquetas</h2>
          
          {product.tags.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
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
              placeholder="Agregar etiqueta"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag((e.target as HTMLInputElement).value);
                  (e.target as HTMLInputElement).value = '';
                }
              }}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
            />
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
            disabled={saving}
            className="bg-black text-white px-6 py-2 rounded-md font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}
