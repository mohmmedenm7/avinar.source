export interface Campaign {
    _id: string;
    name: string;
    description: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
    bannerText?: string;
    bannerColor?: string;
}

export interface CampaignBanner {
    campaign: Campaign;
    timeRemaining: number; // milliseconds
}

export interface RecommendedProduct {
    _id: string;
    title: string;
    description: string;
    price: number;
    imageCover?: string;
    category?: {
        _id: string;
        name: string;
    };
    instructor?: {
        _id: string;
        name: string;
    };
    score?: number; // Recommendation score from algorithm
}
