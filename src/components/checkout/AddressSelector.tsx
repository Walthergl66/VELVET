'use client';

import React from 'react';
import { Address } from '@/types';

interface AddressSelectorProps {
  title: string;
  addresses: Address[];
  selectedAddress: Address | null;
  onSelectAddress: (address: Address | null) => void;
  onAddNewAddress: () => void;
  loading?: boolean;
}

/**
 * Componente para seleccionar direcciones guardadas en el checkout
 * Permite elegir entre direcciones existentes o agregar una nueva
 */
export default function AddressSelector({
  title,
  addresses,
  selectedAddress,
  onSelectAddress,
  onAddNewAddress,
  loading = false
}: AddressSelectorProps) {

  const formatAddress = (address: Address) => {
    return `${address.street}, ${address.city}, ${address.state} ${address.zip_code}, ${address.country}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      
      {addresses.length === 0 ? (
        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg">
          <svg className="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-sm text-gray-500 mb-3">No tienes direcciones guardadas</p>
          <button
            onClick={onAddNewAddress}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Agregar Nueva Dirección
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Opción para ingresar nueva dirección */}
          <label className="relative flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
            <div className="flex items-center h-5">
              <input
                type="radio"
                name={`address-${title}`}
                checked={selectedAddress === null}
                onChange={() => onSelectAddress(null)}
                className="h-4 w-4 text-black focus:ring-black border-gray-300"
              />
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                Ingresar nueva dirección
              </div>
              <div className="text-sm text-gray-500">
                Agregar una dirección diferente para este pedido
              </div>
            </div>
          </label>

          {/* Direcciones guardadas */}
          {addresses.map((address) => (
            <label
              key={address.id}
              className="relative flex items-start p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center h-5">
                <input
                  type="radio"
                  name={`address-${title}`}
                  checked={selectedAddress?.id === address.id}
                  onChange={() => onSelectAddress(address)}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300"
                />
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">
                    {formatAddress(address)}
                  </div>
                  {address.is_default && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Predeterminada
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {address.type === 'shipping' && 'Dirección de envío'}
                  {address.type === 'billing' && 'Dirección de facturación'}
                  {!address.type && 'Dirección general'}
                </div>
              </div>
            </label>
          ))}

          {/* Botón para agregar nueva dirección */}
          <button
            onClick={onAddNewAddress}
            className="w-full flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar Nueva Dirección
          </button>
        </div>
      )}
    </div>
  );
}
