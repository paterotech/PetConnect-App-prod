import api from "./api";

// Get all adoption requests (for admins)
export const getAllAdoptionRequests = async (token?: string) => {
  const res = await api.get("/adoption-requests", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// Get adoption requests for the currently logged-in user
export const getMyAdoptionRequests = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No token found");
  }
  const res = await api.get("/adoption-requests/my-requests", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

interface CreateAdoptionRequestData {
  pet: string; // This is the petId
  contactEmail: string;
  contactPhone: string;
  message: string;
}

// Create a new adoption request
export const createAdoptionRequest = async (data: CreateAdoptionRequestData, token: string) => {
    if (!token) {
        throw new Error("No token found");
    }
    const res = await api.post("/adoption-requests", data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Update an adoption request (for admins)
export const updateAdoptionRequest = async (id: string, status: string, token?: string) => {
  const res = await api.put(`/adoption-requests/${id}`, { status }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
