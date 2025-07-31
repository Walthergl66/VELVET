'use client';

import React, { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

/**
 * Componente para subir imágenes a Supabase Storage
 * Soporta múltiples archivos, preview y gestión de errores
 */

interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  maxFiles?: number;
  existingImages?: string[];
  folder?: string;
}

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
}

export default function ImageUpload({ 
  onImagesUploaded, 
  maxFiles = 5, 
  existingImages = [],
  folder = 'products'
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadState, setUploadState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null
  });

  // Validar archivo
  const validateFile = (file: File): string | null => {
    // Verificar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten archivos JPG, PNG y WebP';
    }

    // Verificar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'El archivo debe ser menor a 5MB';
    }

    return null;
  };

  // Manejar selección de archivos
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Verificar límite de archivos
    const totalFiles = existingImages.length + selectedFiles.length + files.length;
    if (totalFiles > maxFiles) {
      setUploadState(prev => ({
        ...prev,
        error: `Máximo ${maxFiles} imágenes permitidas`
      }));
      return;
    }

    // Validar cada archivo
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      setUploadState(prev => ({
        ...prev,
        error: errors.join(', ')
      }));
      return;
    }

    // Crear URLs de preview
    const newPreviewUrls = validFiles.map(file => URL.createObjectURL(file));
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setUploadState(prev => ({ ...prev, error: null }));
  }, [selectedFiles, existingImages.length, maxFiles]);

  // Subir archivos a Supabase Storage
  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    setUploadState({
      uploading: true,
      progress: 0,
      error: null
    });

    try {
      const uploadPromises = selectedFiles.map(async (file, index) => {
        // Generar nombre único para el archivo
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        // Subir archivo
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          throw new Error(`Error subiendo ${file.name}: ${error.message}`);
        }

        // Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath);

        // Actualizar progreso
        const progress = ((index + 1) / selectedFiles.length) * 100;
        setUploadState(prev => ({ ...prev, progress }));

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Notificar urls subidas
      onImagesUploaded(uploadedUrls);
      
      // Limpiar estado
      setSelectedFiles([]);
      setPreviewUrls([]);
      setUploadState({
        uploading: false,
        progress: 0,
        error: null
      });

    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadState({
        uploading: false,
        progress: 0,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // Remover archivo seleccionado
  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    // Liberar URL de preview
    URL.revokeObjectURL(previewUrls[index]);
    
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  // Limpiar URLs de preview al desmontar
  React.useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  return (
    <div className="space-y-4">
      {/* Área de drop/upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          disabled={uploadState.uploading}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <svg
            className="w-12 h-12 text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 48 48"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            />
          </svg>
          <p className="text-lg font-medium text-gray-900 mb-1">
            Seleccionar imágenes
          </p>
          <p className="text-sm text-gray-500">
            o arrastra y suelta aquí
          </p>
          <p className="text-xs text-gray-400 mt-2">
            PNG, JPG, WebP hasta 5MB cada una
          </p>
        </label>
      </div>

      {/* Error message */}
      {uploadState.error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{uploadState.error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {uploadState.uploading && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-blue-900">
              Subiendo imágenes...
            </p>
            <p className="text-sm text-blue-600">
              {Math.round(uploadState.progress)}%
            </p>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadState.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Preview de archivos seleccionados */}
      {selectedFiles.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Archivos seleccionados ({selectedFiles.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {previewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeFile(index)}
                  disabled={uploadState.uploading}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  ✕
                </button>
                <p className="text-xs text-gray-500 mt-1 truncate">
                  {selectedFiles[index].name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Botón de subir */}
      {selectedFiles.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={uploadFiles}
            disabled={uploadState.uploading}
            className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploadState.uploading ? 'Subiendo...' : `Subir ${selectedFiles.length} imagen${selectedFiles.length > 1 ? 'es' : ''}`}
          </button>
        </div>
      )}

      {/* Info sobre límites */}
      <div className="text-xs text-gray-500">
        {existingImages.length + selectedFiles.length} de {maxFiles} imágenes máximas
      </div>
    </div>
  );
}
