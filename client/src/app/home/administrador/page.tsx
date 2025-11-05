import { Suspense } from 'react';
import AdminClientContent from './AdminClientContent';

export default function AdministradorPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="loader">Cargando...</div>
      </div>
    }>
      <AdminClientContent />
    </Suspense>
  );
}
