'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';
import Image from 'next/image';

/**
 * Página de gestión de categorías y subcategorías para administradores
 * Permite crear, editar y eliminar categorías con jerarquía padre-hijo
 */

interface CategoryForm {
  name: string;
  description: string;
  image_file: File | null;
  parent_id: string;
}

interface CategoriesPageState {
  categories: Category[];
  loading: boolean;
  showForm: boolean;
  editingCategory: Category | null;
  formData: CategoryForm;
}

export default function AdminCategoriesPage() {
  const [state, setState] = useState<CategoriesPageState>({
    categories: [],
    loading: true,
    showForm: false,
    editingCategory: null,
    formData: {
      name: '',
      description: '',
      image_file: null,
      parent_id: ''
    }
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          subcategories:categories!parent_id(*)
        `)
        .is('parent_id', null)
        .order('name');

      if (error) throw error;

      setState(prev => ({
        ...prev,
        categories: data || [],
        loading: false
      }));
    } catch (error) {
      console.error('Error loading categories:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .trim()
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-'); // Múltiples guiones a uno solo
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: value
      }
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        image_file: file
      }
    }));
  };

  const openCreateForm = (parentId: string = '') => {
    setState(prev => ({
      ...prev,
      showForm: true,
      editingCategory: null,
      formData: {
        name: '',
        description: '',
        image_file: null,
        parent_id: parentId
      }
    }));
  };

  const openEditForm = (category: Category) => {
    setState(prev => ({
      ...prev,
      showForm: true,
      editingCategory: category,
      formData: {
        name: category.name,
        description: category.description || '',
        image_file: null,
        parent_id: category.parent_id || ''
      }
    }));
  };

  const closeForm = () => {
    setState(prev => ({
      ...prev,
      showForm: false,
      editingCategory: null,
      formData: {
        name: '',
        description: '',
        image_file: null,
        parent_id: ''
      }
    }));
  };

  const validateForm = (): string | null => {
    if (!state.formData.name.trim()) return 'El nombre es requerido';
    return null;
  };

  const saveCategory = async () => {
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      // Generar slug automáticamente
      const slug = generateSlug(state.formData.name);

      // Verificar que el slug sea único
      const { data: existingSlug } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', state.editingCategory?.id || '');

      if (existingSlug && existingSlug.length > 0) {
        alert('Ya existe una categoría con un nombre similar. Por favor usa un nombre diferente.');
        return;
      }

      // Subir imagen si hay una
      let imageUrl = state.editingCategory?.image_url || null;
      
      if (state.formData.image_file) {
        const fileExt = state.formData.image_file.name.split('.').pop();
        const fileName = `${slug}-${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('category-images')
          .upload(fileName, state.formData.image_file);

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert('Error al subir la imagen');
          return;
        }

        // Obtener URL pública
        const { data: urlData } = supabase.storage
          .from('category-images')
          .getPublicUrl(fileName);
        
        imageUrl = urlData.publicUrl;
      }

      const categoryData = {
        name: state.formData.name,
        slug: slug,
        description: state.formData.description || null,
        image_url: imageUrl,
        parent_id: state.formData.parent_id || null
      };

      if (state.editingCategory) {
        // Actualizar categoría existente
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', state.editingCategory.id);

        if (error) throw error;
        alert('Categoría actualizada exitosamente');
      } else {
        // Crear nueva categoría
        const { error } = await supabase
          .from('categories')
          .insert([categoryData]);

        if (error) throw error;
        alert('Categoría creada exitosamente');
      }

      closeForm();
      loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error al guardar la categoría');
    }
  };

  const deleteCategory = async (category: Category) => {
    // Verificar si tiene subcategorías
    if (category.subcategories && category.subcategories.length > 0) {
      if (!confirm(`Esta categoría tiene ${category.subcategories.length} subcategoría(s). ¿Estás seguro de eliminarla? Esto también eliminará todas sus subcategorías.`)) {
        return;
      }
    } else {
      if (!confirm(`¿Estás seguro de que deseas eliminar la categoría "${category.name}"?`)) {
        return;
      }
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id);

      if (error) throw error;
      alert('Categoría eliminada exitosamente');
      loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error al eliminar la categoría');
    }
  };

  const mainCategories = state.categories.filter(cat => !cat.parent_id);

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl">
            Gestión de Categorías
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Administra las categorías y subcategorías del catálogo
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            onClick={() => openCreateForm()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800"
          >
            + Nueva Categoría
          </button>
        </div>
      </div>

      {/* Lista de categorías */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          {mainCategories.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay categorías
              </h3>
              <p className="text-gray-500 mb-4">
                Comienza creando tu primera categoría para organizar los productos.
              </p>
              <button
                onClick={() => openCreateForm()}
                className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
              >
                Crear Primera Categoría
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {mainCategories.map((category) => (
                <div key={category.id} className="border border-gray-200 rounded-lg">
                  {/* Categoría Principal */}
                  <div className="p-4 bg-gray-50 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {category.image_url && (
                          <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                            {category.image_url.includes('supabase.co') ? (
                              <Image
                                src={category.image_url}
                                alt={category.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <img
                                src={category.image_url}
                                alt={category.name}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                          <p className="text-sm text-gray-500">/{category.slug}</p>
                          {category.description && (
                            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {category.subcategories?.length || 0} subcategorías
                        </span>
                        <button
                          onClick={() => openCreateForm(category.id)}
                          className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
                        >
                          + Subcategoría
                        </button>
                        <button
                          onClick={() => openEditForm(category)}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => deleteCategory(category)}
                          className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Subcategorías */}
                  {category.subcategories && category.subcategories.length > 0 && (
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {category.subcategories.map((subcategory) => (
                          <div key={subcategory.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {subcategory.image_url && (
                                <div className="relative w-8 h-8 bg-gray-100 rounded overflow-hidden">
                                  {subcategory.image_url.includes('supabase.co') ? (
                                    <Image
                                      src={subcategory.image_url}
                                      alt={subcategory.name}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <img
                                      src={subcategory.image_url}
                                      alt={subcategory.name}
                                      className="w-full h-full object-cover"
                                    />
                                  )}
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900">{subcategory.name}</p>
                                <p className="text-xs text-gray-500">/{subcategory.slug}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => openEditForm(subcategory)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                                title="Editar"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => deleteCategory(subcategory)}
                                className="text-red-400 hover:text-red-600 p-1"
                                title="Eliminar"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de formulario */}
      {state.showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {state.editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                {state.formData.parent_id && (
                  <span className="text-sm text-gray-500 block">
                    (Subcategoría de: {mainCategories.find(c => c.id === state.formData.parent_id)?.name})
                  </span>
                )}
              </h3>
              
              <form onSubmit={(e) => { e.preventDefault(); saveCategory(); }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={state.formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full border-2 border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-600"
                    placeholder="Ej: Camisas"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    El slug se generará automáticamente: {generateSlug(state.formData.name)}
                  </p>
                </div>

                {!state.formData.parent_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría Padre
                    </label>
                    <select
                      name="parent_id"
                      value={state.formData.parent_id}
                      onChange={handleInputChange}
                      className="w-full border-2 border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    >
                      <option value="">Categoría principal</option>
                      {mainCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={state.formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border-2 border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder-gray-600"
                    placeholder="Descripción de la categoría..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagen de Categoría
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border-2 border-gray-400 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Sube una imagen para la categoría (formatos: JPG, PNG, WebP)
                  </p>
                  {state.editingCategory?.image_url && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-500 mb-1">Imagen actual:</p>
                      <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {state.editingCategory.image_url.includes('supabase.co') ? (
                          <Image
                            src={state.editingCategory.image_url}
                            alt="Imagen actual"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <img
                            src={state.editingCategory.image_url}
                            alt="Imagen actual"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                  >
                    {state.editingCategory ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
