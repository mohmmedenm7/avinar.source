import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/config/env';
import { StarRating } from './StarRating';
import { Edit2, Trash2, User } from 'lucide-react';

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

interface ReviewsSectionProps {
    productId: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ productId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingReview, setEditingReview] = useState<Review | null>(null);
    const [formData, setFormData] = useState({ title: '', ratings: 5 });
    const { toast } = useToast();

    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('email');
    const userId = localStorage.getItem('userId');

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast({ title: 'يرجى تسجيل الدخول أولاً', variant: 'destructive' });
            return;
        }

        if (!formData.title.trim()) {
            toast({ title: 'يرجى كتابة تعليق', variant: 'destructive' });
            return;
        }

        try {
            if (editingReview) {
                // Update existing review
                await axios.put(
                    `${API_BASE_URL}/api/v1/reviews/${editingReview._id}`,
                    { title: formData.title, ratings: formData.ratings },
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );
                toast({ title: '✓ تم تحديث التقييم بنجاح' });
            } else {
                // Create new review
                await axios.post(
                    `${API_BASE_URL}/api/v1/reviews`,
                    { title: formData.title, ratings: formData.ratings, product: productId },
                    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
                );
                toast({ title: '✓ تم إضافة التقييم بنجاح' });
            }

            setFormData({ title: '', ratings: 5 });
            setShowAddForm(false);
            setEditingReview(null);
            fetchReviews();
        } catch (error: any) {
            toast({
                title: error.response?.data?.message || 'فشل حفظ التقييم',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (review: Review) => {
        setEditingReview(review);
        setFormData({ title: review.title, ratings: review.ratings });
        setShowAddForm(true);
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا التقييم؟')) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/v1/reviews/${reviewId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast({ title: '✓ تم حذف التقييم بنجاح' });
            fetchReviews();
        } catch (error: any) {
            toast({
                title: error.response?.data?.message || 'فشل حذف التقييم',
                variant: 'destructive',
            });
        }
    };

    const handleCancelEdit = () => {
        setEditingReview(null);
        setFormData({ title: '', ratings: 5 });
        setShowAddForm(false);
    };

    // Calculate average rating
    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.ratings, 0) / reviews.length
        : 0;

    // Check if user already reviewed
    const userReview = reviews.find(review => review.user.email === userEmail);
    const canAddReview = token && !userReview;

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

                {canAddReview && !showAddForm && (
                    <Button
                        onClick={() => setShowAddForm(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        إضافة تقييم
                    </Button>
                )}
            </div>

            {/* Add/Edit Review Form */}
            {showAddForm && (
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {editingReview ? 'تعديل التقييم' : 'إضافة تقييم جديد'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    التقييم
                                </label>
                                <StarRating
                                    rating={formData.ratings}
                                    onRatingChange={(rating) => setFormData({ ...formData, ratings: rating })}
                                    size={28}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    التعليق
                                </label>
                                <Textarea
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="شارك تجربتك مع هذا الكورس..."
                                    className="text-right resize-none"
                                    rows={4}
                                    dir="rtl"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                    {editingReview ? 'حفظ التعديلات' : 'نشر التقييم'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancelEdit}
                                >
                                    إلغاء
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : reviews.length > 0 ? (
                <div className="space-y-4">
                    {reviews.map((review) => {
                        const isOwnReview = review.user.email === userEmail;
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

                                        {isOwnReview && (
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEdit(review)}
                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDelete(review._id)}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        )}
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
                        <p className="text-gray-500 text-lg mb-4">لا توجد تقييمات بعد</p>
                        {canAddReview && (
                            <Button
                                onClick={() => setShowAddForm(true)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                كن أول من يقيّم هذا الكورس
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
