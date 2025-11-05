'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { submitAdopterForm } from '@/services/forms.service';
import { createAdoptionRequest } from '@/services/adoption-requests.service';

export default function OnboardingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const petId = searchParams.get('petId');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    housingType: 'casa',
    hasOtherPets: false,
    hasChildren: false,
    livesWithAdults: false,
    ageRange: '25-35',
    department: '',
    city: '',
    petPreference: petId || 'sin-preferencia',
    reasonForAdoption: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formSubmissionResponse = await submitAdopterForm(formData);
      const formSubmissionId = formSubmissionResponse.item._id;

      if (petId) {
        await createAdoptionRequest({
          pet: petId,
          formSubmission: formSubmissionId,
          contactEmail: formData.email,
          contactPhone: formData.phone,
        });
      }

      alert('Formulario enviado con éxito!');
      router.push('/home'); // Redirect to home after submission
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error al enviar el formulario. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e0f7fa] to-[#f8fafc] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8 p-10 bg-white rounded-2xl shadow-lg relative">
        <div className="absolute top-4 left-4">
            <Link href="/home/catalogo">
                <span className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-[#3DD9D6] cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Volver al Catálogo
                </span>
            </Link>
        </div>
        <div className="text-center pt-10">
            <h1 className="text-4xl font-extrabold text-[#3DD9D6] drop-shadow-lg mb-2">
                Formulario de Adopción
            </h1>
            <p className="text-lg text-gray-600">
                Estas a un paso de encontrar a tu amigo fiel 🐾
            </p>
        </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Nombre Completo</label>
          <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900" />
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Teléfono</label>
          <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900" />
        </div>
        <div>
          <label htmlFor="housingType" className="block text-sm font-medium text-gray-700">Tipo de Vivienda</label>
          <select name="housingType" id="housingType" value={formData.housingType} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900">
            <option value="casa">Casa</option>
            <option value="apartamento">Apartamento</option>
            <option value="finca">Finca</option>
          </select>
        </div>
        <div className="flex items-center">
          <input type="checkbox" name="hasOtherPets" id="hasOtherPets" checked={formData.hasOtherPets} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
          <label htmlFor="hasOtherPets" className="ml-2 block text-sm text-gray-900">¿Tienes otras mascotas?</label>
        </div>
        <div className="flex items-center">
          <input type="checkbox" name="hasChildren" id="hasChildren" checked={formData.hasChildren} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
          <label htmlFor="hasChildren" className="ml-2 block text-sm text-gray-900">¿Tienes niños?</label>
        </div>
        <div className="flex items-center">
          <input type="checkbox" name="livesWithAdults" id="livesWithAdults" checked={formData.livesWithAdults} onChange={handleChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
          <label htmlFor="livesWithAdults" className="ml-2 block text-sm text-gray-900">¿Vives con otros adultos?</label>
        </div>
        <div>
          <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700">Rango de Edad</label>
          <select name="ageRange" id="ageRange" value={formData.ageRange} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900">
            <option value="18-24">18-24</option>
            <option value="25-35">25-35</option>
            <option value="36-45">36-45</option>
            <option value="46+">46+</option>
          </select>
        </div>
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">Departamento</label>
          <input type="text" name="department" id="department" value={formData.department} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900" />
        </div>
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">Ciudad</label>
          <input type="text" name="city" id="city" value={formData.city} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900" />
        </div>
        <div>
          <label htmlFor="petPreference" className="block text-sm font-medium text-gray-700">Preferencia de Mascota</label>
          <select name="petPreference" id="petPreference" value={formData.petPreference} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900">
            <option value="sin-preferencia">Sin Preferencia</option>
            <option value="perro">Perro</option>
            <option value="gato">Gato</option>
          </select>
        </div>
        <div>
          <label htmlFor="reasonForAdoption" className="block text-sm font-medium text-gray-700">Razón para la Adopción</label>
          <textarea name="reasonForAdoption" id="reasonForAdoption" value={formData.reasonForAdoption} onChange={handleChange} required rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900"></textarea>
        </div>
        <div>
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-white bg-[#FFD93D] hover:bg-[#ffe066] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFD93D]">
            Enviar Solicitud
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
