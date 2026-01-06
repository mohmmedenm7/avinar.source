import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { TrainingCenter, CreateTrainingCenterData, UpdateTrainingCenterData } from '@/types/trainingCenter';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

export const trainingCenterService = {
    // Get all training centers
    getAllTrainingCenters: async (): Promise<TrainingCenter[]> => {
        const response = await axios.get(`${API_BASE_URL}/api/v1/training-centers`);
        // Handle both pagination wrapper and direct array
        return response.data?.data || response.data?.results || [];
    },

    // Get single training center by ID
    getTrainingCenterById: async (id: string): Promise<TrainingCenter> => {
        const response = await axios.get(`${API_BASE_URL}/api/v1/training-centers/${id}`);
        return response.data?.data || response.data;
    },

    // Create new training center
    createTrainingCenter: async (data: CreateTrainingCenterData): Promise<TrainingCenter> => {
        const response = await axios.post(
            `${API_BASE_URL}/api/v1/training-centers`,
            data,
            { headers: getAuthHeaders() }
        );
        return response.data?.data || response.data;
    },

    // Update existing training center
    updateTrainingCenter: async (id: string, data: UpdateTrainingCenterData): Promise<TrainingCenter> => {
        const response = await axios.put(
            `${API_BASE_URL}/api/v1/training-centers/${id}`,
            data,
            { headers: getAuthHeaders() }
        );
        return response.data?.data || response.data;
    },

    // Delete training center
    deleteTrainingCenter: async (id: string): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/api/v1/training-centers/${id}`, {
            headers: getAuthHeaders(),
        });
    },
};
