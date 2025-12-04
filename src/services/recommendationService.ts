import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { RecommendedProduct } from '@/types/campaign';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const recommendationService = {
    // Get recommended products based on category/instructor
    getRecommendations: async (productId: string): Promise<RecommendedProduct[]> => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/products/${productId}/recommendations`,
                {
                    headers: getAuthHeader(),
                }
            );
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching recommendations:', error);
            return [];
        }
    },

    // Get frequently bought together products
    getAlsoBought: async (productId: string): Promise<RecommendedProduct[]> => {
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/v1/products/${productId}/also-bought`,
                {
                    headers: getAuthHeader(),
                }
            );
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching also-bought products:', error);
            return [];
        }
    },
};
