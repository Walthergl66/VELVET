"use client"

import { Popover, PopoverPanel, Transition } from "@headlessui/react"
import { XMark, User } from "@medusajs/icons"
import { Text } from "@medusajs/ui"
import { Fragment } from "react"

import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SideMenuItems = {
  Inicio: "/",
  Tienda: "/store",
  Carrito: "/cart",
}

const SideMenu = () => {
  return (
    <div className="h-full">
      <div className="flex items-center h-full">
        <Popover className="h-full flex">
          {({ open, close }) => (
            <>
              <div className="relative flex h-full">
                <Popover.Button
                  data-testid="nav-menu-button"
                  className="relative h-full px-4 py-2 rounded-md text-white bg-black hover:bg-gray-900 transition-all duration-200 focus:outline-none"
                >
                  ☰ Menú
                </Popover.Button>
              </div>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="-translate-x-full opacity-0"
                enterTo="translate-x-0 opacity-100"
                leave="transition ease-in duration-200"
                leaveFrom="translate-x-0 opacity-100"
                leaveTo="-translate-x-full opacity-0"
              >
                <PopoverPanel className="fixed top-0 left-0 z-50 w-full sm:w-80 h-full bg-white/90 backdrop-blur-lg shadow-2xl text-ui-fg-on-color">
                  <div className="flex flex-col justify-between h-full px-6 py-6">
                    {/* Header con icono de cuenta y botón cerrar */}
                    <div className="flex justify-between items-center">
                      <LocalizedClientLink
                        href="/account"
                        onClick={close}
                        className="p-2 text-gray-600 hover:text-pink-500 hover:bg-pink-50 rounded-full transition-all"
                        data-testid="account-icon-link"
                      >
                        <User className="w-6 h-6" />
                      </LocalizedClientLink>

                      <button
                        data-testid="close-menu-button"
                        onClick={close}
                        className="text-gray-500 hover:text-gray-900 transition"
                      >
                        <XMark className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Enlaces del menú principal */}
                    <ul className="flex flex-col gap-4 mt-6">
                      {Object.entries(SideMenuItems).map(([name, href]) => (
                        <li key={name}>
                          <LocalizedClientLink
                            href={href}
                            className="block w-full px-4 py-3 text-left text-lg font-medium text-gray-800 hover:bg-pink-50 hover:text-pink-500 rounded-md transition-all cursor-pointer"
                            onClick={close}
                            data-testid={${name.toLowerCase()}-link}
                          >
                            {name}
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>

                    {/* Pie de página */}
                    <div className="mt-auto">
                      <Text className="text-sm text-gray-500 text-center">
                        © {new Date().getFullYear()} Velvet
                      </Text>
                    </div>
                  </div>
                </PopoverPanel>
              </Transition>
            </>
          )}
        </Popover>
      </div>
    </div>
  )
}

export default SideMenu