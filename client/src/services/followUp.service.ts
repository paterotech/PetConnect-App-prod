import api from './api';
import { FollowUp, IFollowUp as FollowUpModelInterface } from '../lib/models/FollowUp';

export type IFollowUp = FollowUpModelInterface;


// Define interfaces for the data expected from the API
// These should ideally be shared types, but for now, we'll define them here or import from backend
export interface Pet {
  _id: string;
  name: string;
  image: string;
}

export interface Adopter {
  _id: string;
  name: string;
  email: string;
}

export interface AdoptionRequestPopulated {
  _id: string;
  pet: Pet;
  user: Adopter;
  status: string;
  updatedAt: string;
}

export interface FollowUpPopulated extends IFollowUp {
  adoptionRequest: AdoptionRequestPopulated;
}

export interface GroupedFollowUp {
  pet: Pet;
  adopter: Adopter;
  visits: {
    '1-month'?: FollowUpPopulated;
    '3-month'?: FollowUpPopulated;
    '6-month'?: FollowUpPopulated;
  };
}

const BASE_URL = '/follow-ups';

export const followUpService = {
  getGroupedFollowUps: async (): Promise<GroupedFollowUp[]> => {
    const response = await api.get<GroupedFollowUp[]>(BASE_URL);
    return response.data;
  },

  getFollowUpsByPet: async (petId: string): Promise<FollowUpPopulated[]> => {
    const response = await api.get<FollowUpPopulated[]>(`${BASE_URL}/by-pet/${petId}`);
    return response.data;
  },

  getFollowUpById: async (id: string): Promise<FollowUpPopulated> => {
    const response = await api.get<FollowUpPopulated>(`${BASE_URL}/${id}`);
    return response.data;
  },

  updateFollowUp: async (id: string, data: Partial<IFollowUp>): Promise<FollowUpPopulated> => {
    const response = await api.put<FollowUpPopulated>(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  startFollowUpProcess: async (petId: string): Promise<FollowUpPopulated[]> => {
    const response = await api.post<FollowUpPopulated[]>(`${BASE_URL}/start`, { petId });
    return response.data;
  },

  deleteFollowUp: async (id: string): Promise<{ msg: string }> => {
    const response = await api.delete<{ msg: string }>(`${BASE_URL}/${id}`);
    return response.data;
  },
};
