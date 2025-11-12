'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { followUpService, FollowUpPopulated, IFollowUp } from '../../../../services/followUp.service'; // Corrected path

const SeguimientoFormPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [mood, setMood] = useState('');
  const [health, setHealth] = useState('');
  const [weight, setWeight] = useState<number | string>('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'Programada' | 'Completada'>('Programada');
  const [visitDate, setVisitDate] = useState('');

  const [petId, setPetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchFollowUp = async () => {
      try {
        const followUpData = await followUpService.getFollowUpById(id as string);
        setMood(followUpData.mood || '');
        setHealth(followUpData.health || '');
        setWeight(followUpData.weight || '');
        setNotes(followUpData.notes || '');
        setStatus(followUpData.status || 'Programada');
        setVisitDate(new Date(followUpData.visitDate).toISOString().split('T')[0]);
        console.log('FollowUp Status on load:', followUpData.status); // Added console.log

        if (followUpData.adoptionRequest && followUpData.adoptionRequest.pet) {
          setPetId(followUpData.adoptionRequest.pet._id);
        }

        setIsCompleted(followUpData.status === 'Completada');
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchFollowUp();
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData: Partial<IFollowUp> = {
        mood,
        health,
        weight: typeof weight === 'string' && weight === '' ? undefined : Number(weight),
        notes,
        status: 'Completada', // Automatically set to 'Completada' on submission
        visitDate: new Date(visitDate),
      };
      await followUpService.updateFollowUp(id as string, formData);
      if (petId) {
        router.push(`/admin/seguimiento/mascota/${petId}`);
      } else {
        router.push('/admin/seguimientos');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="text-center p-8">Cargando formulario...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 pt-32">
        <button
          onClick={() => router.push(petId ? `/admin/seguimiento/mascota/${petId}` : '/home/administrador')}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold"
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Volver a Seguimientos
        </button>
      </div>

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Registrar Visita de Seguimiento</h1>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700">
                Fecha de Visita
              </label>
              <input
                type="date"
                name="visitDate"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Estado de la Visita
              </label>
              <select
                name="status"
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'Programada' | 'Completada')}
                disabled={isCompleted}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
              >
                <option value="Programada">Programada</option>
                <option value="Completada">Completada</option>
              </select>
            </div>
            <div>
              <label htmlFor="mood" className="block text-sm font-medium text-gray-700">
                Estado de Ánimo
              </label>
              <input
                type="text"
                name="mood"
                id="mood"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                disabled={isCompleted}
                placeholder="Ej: Feliz, juguetón"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="health" className="block text-sm font-medium text-gray-700">
                Estado de Salud
              </label>
              <input
                type="text"
                name="health"
                id="health"
                value={health}
                onChange={(e) => setHealth(e.target.value)}
                disabled={isCompleted}
                placeholder="Ej: Excelente, sin problemas"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
              />
            </div>
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">
                Peso (kg)
              </label>
              <input
                type="number"
                name="weight"
                id="weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                disabled={isCompleted}
                placeholder="Ej: 12.5"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
              />
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
              Notas Adicionales
            </label>
            <textarea
              name="notes"
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isCompleted}
              placeholder="Añade cualquier observación relevante sobre la mascota o el entorno."
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"
            ></textarea>
          </div>

          <div className="text-right">
            <button
              type="submit"
              disabled={isCompleted}
              className={`inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${isCompleted ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SeguimientoFormPage;
