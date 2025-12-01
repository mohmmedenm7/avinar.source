import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { Post, CreatePostData, UpdatePostData, CreateReplyData } from '@/types/community';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
};

export const communityService = {
    // Get all community posts
    getAllPosts: async (): Promise<Post[]> => {
        const response = await axios.get(`${API_BASE_URL}/api/v1/community`);
        return response.data?.data || response.data || [];
    },

    // Get single post by ID
    getPostById: async (postId: string): Promise<Post> => {
        const response = await axios.get(`${API_BASE_URL}/api/v1/community/${postId}`);
        return response.data?.data || response.data;
    },

    // Create new post
    createPost: async (data: CreatePostData): Promise<Post> => {
        const response = await axios.post(
            `${API_BASE_URL}/api/v1/community`,
            data,
            { headers: getAuthHeaders() }
        );
        return response.data?.data || response.data;
    },

    // Update existing post
    updatePost: async (postId: string, data: UpdatePostData): Promise<Post> => {
        const response = await axios.put(
            `${API_BASE_URL}/api/v1/community/${postId}`,
            data,
            { headers: getAuthHeaders() }
        );
        return response.data?.data || response.data;
    },

    // Delete post
    deletePost: async (postId: string): Promise<void> => {
        await axios.delete(`${API_BASE_URL}/api/v1/community/${postId}`, {
            headers: getAuthHeaders(),
        });
    },

    // Add reply to post
    addReply: async (postId: string, data: CreateReplyData): Promise<Post> => {
        const response = await axios.post(
            `${API_BASE_URL}/api/v1/community/${postId}/replies`,
            data,
            { headers: getAuthHeaders() }
        );
        return response.data?.data || response.data;
    },

    // Toggle like on post
    toggleLike: async (postId: string): Promise<Post> => {
        const response = await axios.put(
            `${API_BASE_URL}/api/v1/community/${postId}/like`,
            {},
            { headers: getAuthHeaders() }
        );
        return response.data?.data || response.data;
    },
};
