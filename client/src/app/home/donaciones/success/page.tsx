import { Suspense } from 'react';
import SuccessClientContent from './SuccessClientContent';

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
      <SuccessClientContent />
    </Suspense>
  );
}
