import axios from 'axios';
import { API_BASE_URL } from '@/config/env';

// Course interface matching backend data
export interface Course {
    _id: string;
    title: string;
    description: string;
    price: number;
    priceAfterDiscount?: number;
    isFree?: boolean;
    imageCover?: string;
    previewVideo?: string;
    previewVideoUrl?: string;
    category?: { _id: string; name: string };
    instructor?: {
        _id: string;
        name: string;
        profileImg?: string;
    };
    ratingsAverage?: number;
    ratingsQuantity?: number;
    sold?: number;
    trendingScore?: number;
    recentSales?: number;
}

export interface SEOData {
    course: Course;
    structuredData: object;
    metaTags: {
        title: string;
        description: string;
        keywords: string;
        ogTitle: string;
        ogDescription: string;
        ogImage: string;
        ogType: string;
        twitterCard: string;
        canonicalUrl: string;
    };
}

export interface HomePageData {
    trending: Course[];
    featured: Course[];
    newCourses: Course[];
    bestsellers: Course[];
    freeCourses: Course[];
}

export interface SearchParams {
    q?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
    sort?: 'relevance' | 'rating' | 'newest' | 'price-low' | 'price-high' | 'popular';
    limit?: number;
    page?: number;
}

export interface SearchResult {
    courses: Course[];
    totalResults: number;
    currentPage: number;
    totalPages: number;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const discoveryService = {
    // Get all home page discovery data in one call
    getHomePageData: async (): Promise<HomePageData> => {
        const response = await axios.get(`${API_BASE_URL}/api/v1/discovery/home`);
        return response.data?.data;
    },

    // Get trending courses
    getTrendingCourses: async (limit = 10): Promise<Course[]> => {
        const response = await axios.get(`${API_BASE_URL}/api/v1/discovery/trending?limit=${limit}`);
        return response.data?.data || [];
    },

    // Get featured courses
    getFeaturedCourses: async (limit = 8): Promise<Course[]> => {
        const response = await axios.get(`${API_BASE_URL}/api/v1/discovery/featured?limit=${limit}`);
        return response.data?.data || [];
    },

    // Get newest courses
    getNewCourses: async (limit = 10): Promise<Course[]> => {
        const response = await axios.get(`${API_BASE_URL}/api/v1/discovery/new?limit=${limit}`);
        return response.data?.data || [];
    },

    // Get bestseller courses
    getBestsellerCourses: async (limit = 10): Promise<Course[]> => {
        const response = await axios.get(`${API_BASE_URL}/api/v1/discovery/bestsellers?limit=${limit}`);
        return response.data?.data || [];
    },

    // Get free courses
    getFreeCourses: async (limit = 10): Promise<Course[]> => {
        const response = await axios.get(`${API_BASE_URL}/api/v1/discovery/free?limit=${limit}`);
        return response.data?.data || [];
    },

    // Get courses by category
    getCoursesByCategory: async (categoryId: string, sort = 'popular', limit = 20): Promise<Course[]> => {
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/discovery/category/${categoryId}?sort=${sort}&limit=${limit}`
        );
        return response.data?.data || [];
    },

    // Get personalized recommendations (requires auth)
    getRecommendedCourses: async (limit = 10): Promise<Course[]> => {
        const response = await axios.get(
            `${API_BASE_URL}/api/v1/discovery/recommended?limit=${limit}`,
            { headers: getAuthHeaders() }
        );
        return response.data?.data || [];
    },

    // Search courses with filters
    searchCourses: async (params: SearchParams): Promise<SearchResult> => {
        const queryParams = new URLSearchParams();
        if (params.q) queryParams.append('q', params.q);
        if (params.category) queryParams.append('category', params.category);
        if (params.minPrice !== undefined) queryParams.append('minPrice', String(params.minPrice));
        if (params.maxPrice !== undefined) queryParams.append('maxPrice', String(params.maxPrice));
        if (params.minRating !== undefined) queryParams.append('minRating', String(params.minRating));
        if (params.sort) queryParams.append('sort', params.sort);
        if (params.limit) queryParams.append('limit', String(params.limit));
        if (params.page) queryParams.append('page', String(params.page));

        const response = await axios.get(`${API_BASE_URL}/api/v1/discovery/search?${queryParams.toString()}`);
        return {
            courses: response.data?.data || [],
            totalResults: response.data?.totalResults || 0,
            currentPage: response.data?.currentPage || 1,
            totalPages: response.data?.totalPages || 1
        };
    },

    // Get SEO data for a course
    getCourseSEOData: async (courseId: string): Promise<SEOData> => {
        const response = await axios.get(`${API_BASE_URL}/api/v1/discovery/seo/${courseId}`);
        return response.data?.data;
    }
};
