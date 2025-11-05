import { Suspense } from 'react';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/app/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import { confirmPayment } from '@/services/donations.service';
import { useEffect, useState } from 'react';

// This is the new client component that contains the original logic
const SuccessPageContent = () => {
  'use client'; // This directive now applies only to this component

  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [confirmationStatus, setConfirmationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (sessionId) {
      const confirmDonation = async () => {
        try {
          await confirmPayment(sessionId);
          setConfirmationStatus('success');
        } catch (err: any) {
          console.error('Error confirming payment:', err);
          setConfirmationStatus('error');
          setErrorMessage(err.message || 'Error al confirmar la donación.');
        }
      };
      confirmDonation();
    } else {
      setConfirmationStatus('error');
      setErrorMessage('No se encontró el ID de sesión de Stripe.');
    }
  }, [searchParams]);

  if (confirmationStatus === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full animate-fade-in">
          <h1 className="text-3xl font-bold text-gray-700 mb-3">Confirmando Donación...</h1>
          <p className="text-lg text-gray-500 mb-6">Por favor, espera un momento.</p>
        </div>
      </div>
    );
  }

  if (confirmationStatus === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gradient-to-br from-red-50 to-red-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full animate-fade-in">
          <XCircle size={64} className="text-red-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-red-700 mb-3">Error en la Donación</h1>
          <p className="text-lg text-gray-700 mb-6">
            {errorMessage || 'Hubo un problema al procesar tu donación.'}
          </p>
          <Link
            href="/home/donaciones"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200"
          >
            Volver a Intentar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gradient-to-br from-green-50 to-green-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full animate-fade-in">
        <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-green-700 mb-3">¡Donación Exitosa!</h1>
        <p className="text-lg text-gray-700 mb-6">
          ¡Muchas gracias por tu generosidad{user?.name ? `, ${user.name}` : ''}! Tu apoyo es vital para nuestros peluditos.
        </p>
        <Link
          href="/home"
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
        >
          Volver al Inicio
        </Link>
      </div>
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

// This is the main page component, which is now a Server Component
export default function DonationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen py-12 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full">
          <h1 className="text-3xl font-bold text-gray-700 mb-3">Cargando...</h1>
          <p className="text-lg text-gray-500 mb-6">Por favor, espera un momento.</p>
        </div>
      </div>
    }>
      <SuccessPageContent />
    </Suspense>
  );
}