import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { API_BASE_URL } from '@/config/env';
import { StarRating } from './StarRating';
import { User } from 'lucide-react';

interface Review {
    _id: string;
    title: string;
    ratings: number;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    product: string;
    createdAt: string;
    updatedAt: string;
}

interface ReviewsDisplayProps {
    productId: string;
}

export const ReviewsDisplay: React.FC<ReviewsDisplayProps> = ({ productId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/products/${productId}/reviews`);
            setReviews(res.data?.data || []);
        } catch (error: any) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate average rating
    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.ratings, 0) / reviews.length
        : 0;

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header with average rating */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">التقييمات والمراجعات</h2>
                    <div className="flex items-center gap-3">
                        <StarRating rating={averageRating} readonly size={24} />
                        <span className="text-lg font-semibold text-gray-700">
                            {averageRating.toFixed(1)} من 5
                        </span>
                        <span className="text-sm text-gray-500">({reviews.length} تقييم)</span>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((review) => {
                        const reviewDate = new Date(review.createdAt).toLocaleDateString('ar-EG', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        });

                        return (
                            <Card key={review._id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <User size={20} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{review.user.name}</p>
                                                <p className="text-xs text-gray-500">{reviewDate}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <StarRating rating={review.ratings} readonly size={18} />
                                    </div>

                                    <p className="text-gray-700 leading-relaxed">{review.title}</p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-gray-500 text-lg">لا توجد تقييمات بعد</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
