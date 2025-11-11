'use client';
import { useAuth } from '@/app/context/AuthContext';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState("" as string | null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try{
      const res = await login(email, password);
      if (res.token) {
        router.push('/home');
        setLoading(false);
      }
      else
      {
        setLoading(false);
      }
    }catch(err: any){
      setError("El correo o la contraseña son incorrectos");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e0f7fa] to-[#f8fafc]">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 p-8 bg-white/90 rounded-2xl shadow-2xl max-w-md w-full animate-fade-in mx-auto px-4 py-8 pt-32"
        aria-label="Formulario de inicio de sesión"
      >
        <div className="flex justify-center mb-2">
          <Image
            src="/Logo.png"
            alt="PetConnect logo"
            width={80}
            height={80}
            className="rounded-full shadow"
          />
        </div>
        <div className="flex flex-col gap-1 mb-4">
          <h2 className="text-2xl font-bold text-center text-[#2BB2B0]">Bienvenido 👋</h2>
          <h4 className="text-base text-center text-gray-500">Ingresa a tu cuenta</h4>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-md px-3 py-2 text-sm text-center mb-2 animate-fade-in">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label htmlFor="email" className="block text-sm text-gray-600 mb-1">
            Correo electrónico
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2BB2B0]">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M4 4h16v16H4V4zm0 0l8 8 8-8"/></svg>
            </span>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ejemplo@correo.com"
              className="pl-10 pr-3 py-3 w-full bg-white border border-gray-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2BB2B0] focus:border-[#2BB2B0] transition"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="mb-3">
          <label htmlFor="password" className="block text-sm text-gray-600 mb-1">
            Contraseña
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2BB2B0]">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-6V9a6 6 0 10-12 0v2a2 2 0 00-2 2v5a2 2 0 002 2h12a2 2 0 002-2v-5a2 2 0 00-2-2zm-8-2a4 4 0 118 0v2H8V9z"/></svg>
            </span>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Tu contraseña"
              className="pl-10 pr-3 py-3 w-full bg-white border border-gray-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2BB2B0] focus:border-[#2BB2B0] transition"
              autoComplete="current-password"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mb-4">
          <label className="flex items-center text-sm text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              name="rememberMe"
              id="rememberMe"
              className="w-4 h-4 text-[#2BB2B0] focus:ring-[#2BB2B0] rounded mr-2"
            />
            Recordarme
          </label>
          <a href="/auth/forgot-password" className="text-sm text-[#2BB2B0] hover:underline transition">
            ¿Olvidaste tu contraseña?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 text-white py-2 px-4 mb-3 rounded-lg font-semibold transition duration-200 ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#3DD9D6] hover:bg-[#2BB2B0]'
          }`}
        >
          {loading && (
            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          )}
          {loading ? 'Cargando...' : 'Ingresar'}
        </button>
        <div>
          <p className="text-base text-center text-gray-500">
            ¿Nuevo en la plataforma?{' '}
            <a href="/auth/register" className="text-[#2BB2B0] hover:underline transition">
              Crear una cuenta
            </a>
          </p>
        </div>
      </form>
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}