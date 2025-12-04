import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { Campaign } from '@/types/campaign';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const campaignService = {
    // Get all active campaigns
    getActiveCampaigns: async (): Promise<Campaign[]> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/campaigns/active/now`, {
                headers: getAuthHeader(),
            });
            return response.data?.data || response.data || [];
        } catch (error) {
            console.error('Error fetching active campaigns:', error);
            throw error;
        }
    },

    // Get current banner campaign
    getCurrentBanner: async (): Promise<Campaign | null> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/v1/campaigns/banner/current`, {
                headers: getAuthHeader(),
            });
            return response.data?.data || response.data || null;
        } catch (error) {
            console.error('Error fetching current banner:', error);
            return null; // Return null instead of throwing to handle gracefully
        }
    },
};
