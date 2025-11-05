'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const baseItems = [
    { id: 0, name: 'Inicio', href: '/home' },
    { id: 1, name: 'Catálogo', href: '/home/catalogo' },
    { id: 2, name: 'Donaciones', href: '/home/donaciones' },
    { id: 3, name: 'Cómo adoptar', href: '/home/como-adoptar' },
    { id: 4, name: 'Blogs', href: '/home/blogs' },
  ];

  const itemsNav = useMemo(() => {
    const navItems = [...baseItems];
    if (isAuthenticated && user?.role !== 'admin') {
      navItems.push({ id: 7, name: 'Mi Perfil', href: '/profile' });
    }
    if (isAuthenticated && user?.role === 'admin') {
      navItems.push({ id: 6, name: 'Admin', href: '/home/administrador' });
    }
    return navItems;
  }, [isAuthenticated, user]);

  const handleLogout = () => {
    logout();
    setOpen(false);
  };

  const handleLogin = () => {
    window.location.href = '/auth/login';
    setOpen(false);
  };

  return (
    <nav className="w-full bg-white/80 backdrop-blur-md shadow-md fixed top-0 left-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
        {/* Logo */}
        <Link href="/home" prefetch className="flex items-center gap-2">
          <Image
            src="/Logo.png"
            alt="PetConnect logo"
            width={56}
            height={56}
            className="md:w-[80px] md:h-[80px] w-[56px] h-[56px] transition-all"
          />
          <div className="flex flex-col leading-4">
            <span className="text-lg md:text-xl font-semibold text-[#3DD9D6]">
              {/* PetConnect */}
            </span>
            <span className="text-xs font-bold tracking-wide px-3 py-1 bg-green-100/50 text-green-800 rounded-full">
              COLOMBIA
            </span>
          </div>
        </Link>

        {/* Hamburguesa mobile */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded hover:bg-[#e0f7fa] transition"
          aria-label="Abrir menú"
          onClick={() => setOpen(!open)}
        >
          <span className={`block h-0.5 w-6 bg-[#3DD9D6] mb-1 transition-all ${open ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`block h-0.5 w-6 bg-[#3DD9D6] mb-1 transition-all ${open ? 'opacity-0' : ''}`}></span>
          <span className={`block h-0.5 w-6 bg-[#3DD9D6] transition-all ${open ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>

        {/* Menu desktop */}
        <div className="hidden md:flex items-center gap-4 text-[#2D2D2D] font-medium">
          {itemsNav.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`px-2 py-1 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3DD9D6] ${
                item.name === 'Admin'
                  ? 'bg-[#BDF9FF] text-[#00ADAC] hover:bg-[#b2ebf2]'
                  : 'hover:text-[#3DD9D6]'
              }`}
              prefetch
            >
              <span className="text-sm md:text-base">{item.name}</span>
            </Link>
          ))}
          <div className="flex items-center gap-4">
            {isAuthenticated && user ? (
              <span className="text-gray-700">Hola, {user.name}</span>
            ) : null}
            {isAuthenticated ? (
              <button className='text-center py-1 px-2 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 hover:cursor-pointer rounded-xl transition-colors duration-200'
                onClick={handleLogout}>
                Cerrar sesión
              </button>
            ) : (
              <button className='text-center py-1 px-2 text-white bg-[#3DD9D6] hover:bg-[#35c3c0] hover:cursor-pointer rounded-xl transition-colors duration-200'
                onClick={handleLogin}>
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {open && (
        <div className="md:hidden bg-white/95 backdrop-blur-md shadow-lg absolute top-full left-0 w-full flex flex-col items-center gap-2 py-4 animate-fade-in">
          {itemsNav.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full text-center py-2 rounded transition-colors duration-200 ${
                item.name === 'Admin'
                  ? 'bg-[#e0f7fa] text-[#2D2D2D] hover:bg-[#b2ebf2]'
                  : 'text-[#2D2D2D] hover:bg-[#e0f7fa] hover:text-[#3DD9D6]'
              }`}
              onClick={() => setOpen(false)}
              prefetch
            >
              {item.name}
            </Link>
          ))}
           <div className="flex flex-col items-center w-full gap-2 px-4">
            {isAuthenticated && user ? (
                <span className="text-gray-700 py-2">Hola, {user.name}</span>
            ) : null}
            {isAuthenticated ? (
              <button className='w-full text-center py-2 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 hover:cursor-pointer rounded transition-colors duration-200'
                onClick={handleLogout}>
                Cerrar sesión
              </button>
            ) : (
              <button className='w-full text-center py-2 text-white bg-[#3DD9D6] hover:bg-[#35c3c0] hover:cursor-pointer rounded transition-colors duration-200'
                onClick={handleLogin}>
                Iniciar Sesión
              </button>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </nav>
  );
}
