'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Clock } from 'lucide-react';
import { followUpService, FollowUpPopulated } from '../../../../../services/followUp.service'; // Corrected path

const DetalleSeguimientoPage = () => {
  const { petId } = useParams();
  const router = useRouter();
  const [visits, setVisits] = useState<FollowUpPopulated[]>([]);
  const [petName, setPetName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!petId) return;

    const fetchFollowUps = async () => {
      try {
        const data = await followUpService.getFollowUpsByPet(petId as string);
        setVisits(data);
        if (data.length > 0 && data[0].adoptionRequest && data[0].adoptionRequest.pet) {
          setPetName(data[0].adoptionRequest.pet.name);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchFollowUps();
  }, [petId]);

  if (loading) {
    return <div className="text-center p-8">Cargando detalles del seguimiento...</div>;
  }

  const renderVisitCard = (visitType: '1-month' | '3-month' | '6-month') => {
    const visit = visits.find((v) => v.visitType === visitType);
    if (!visit) {
      return (
        <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-500">Visita no programada</h3>
        </div>
      );
    }

    const isCompleted = visit.status === 'Completada';

    return (
      <div className={`bg-white p-6 rounded-lg shadow-md border-l-4 ${isCompleted ? 'border-green-500' : 'border-yellow-500'}`}>
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-800 capitalize">{visit.visitType.replace('-', ' ')}</h3>
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {isCompleted ? <CheckCircle className="mr-1 h-5 w-5" /> : <Clock className="mr-1 h-5 w-5" />}
            {visit.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-1">Fecha programada: {new Date(visit.visitDate).toLocaleDateString()}</p>

        {isCompleted ? (
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p><strong>Estado de Ánimo:</strong> {visit.mood}</p>
            <p><strong>Estado de Salud:</strong> {visit.health}</p>
            <p><strong>Peso:</strong> {visit.weight} kg</p>
            <p><strong>Notas:</strong> {visit.notes}</p>
          </div>
        ) : (
          <div className="mt-4 text-sm text-gray-600">
            <p>Esta visita aún no ha sido completada.</p>
          </div>
        )}

        <div className="text-right mt-4">
          <Link
            href={`/admin/seguimiento/${visit._id}`}
            className="text-indigo-600 hover:text-indigo-900 font-semibold"
          >
            {isCompleted ? 'Ver/Editar' : 'Registrar Visita'}
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 pt-32">
        <Link
          href="/home/administrador?tab=seguimientos" // Corrected to navigate to admin dashboard with 'seguimientos' tab pre-selected
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Volver a la lista de Seguimientos
        </Link>
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Resumen de Seguimiento para <span className="text-indigo-600">{petName}</span>
      </h1>

      <div className="space-y-6">
        {renderVisitCard('1-month')}
        {renderVisitCard('3-month')}
        {renderVisitCard('6-month')}
      </div>
    </div>
  );
};

export default DetalleSeguimientoPage;
