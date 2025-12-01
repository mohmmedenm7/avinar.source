import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/config/env';
import { getImageUrl } from '@/utils/imageUtils';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

interface Course {
    _id: string;
    title: string;
    description: string;
    price: number;
    imageCover?: string;
}

const WishlistPage = () => {
    const [wishlist, setWishlist] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (!token) {
            toast({ title: 'يرجى تسجيل الدخول أولاً', variant: 'destructive' });
            navigate('/login');
            return;
        }
        fetchWishlist();
    }, [token]);

    const fetchWishlist = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/wishlist`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setWishlist(res.data?.data || []);
        } catch (error: any) {
            console.error('Error fetching wishlist:', error);
            toast({
                title: error.response?.data?.message || 'فشل تحميل قائمة الأمنيات',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (productId: string) => {
        try {
            await axios.delete(`${API_BASE_URL}/api/v1/wishlist/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast({ title: '✓ تم الحذف من قائمة الأمنيات' });
            fetchWishlist();
        } catch (error: any) {
            toast({
                title: error.response?.data?.message || 'فشل الحذف',
                variant: 'destructive',
            });
        }
    };

    const addToCart = async (productId: string) => {
        try {
            await axios.post(
                `${API_BASE_URL}/api/v1/cart`,
                { productId, quantity: 1 },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast({ title: '✓ تمت الإضافة للسلة' });
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error: any) {
            toast({
                title: error.response?.data?.message || 'فشل الإضافة للسلة',
                variant: 'destructive',
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4" dir="rtl">
            <div className="container mx-auto max-w-6xl">
                <div className="flex items-center gap-3 mb-8">
                    <Heart size={32} className="text-red-500 fill-red-500" />
                    <h1 className="text-3xl font-bold text-gray-900">قائمة الأمنيات</h1>
                </div>

                {wishlist.length === 0 ? (
                    <Card>
                        <CardContent className="p-12 text-center">
                            <Heart size={64} className="mx-auto text-gray-300 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-700 mb-2">
                                قائمة الأمنيات فارغة
                            </h2>
                            <p className="text-gray-500 mb-6">
                                لم تقم بإضافة أي كورسات إلى قائمة الأمنيات بعد
                            </p>
                            <Button
                                onClick={() => navigate('/courses')}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                تصفح الكورسات
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map((course) => (
                            <Card
                                key={course._id}
                                className="overflow-hidden hover:shadow-lg transition-shadow"
                            >
                                <CardHeader className="p-0 relative">
                                    <img
                                        src={getImageUrl(course.imageCover)}
                                        alt={course.title}
                                        className="w-full h-48 object-cover"
                                    />
                                    <button
                                        onClick={() => removeFromWishlist(course._id)}
                                        className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-lg hover:bg-red-50 transition"
                                    >
                                        <Heart size={20} className="text-red-500 fill-red-500" />
                                    </button>
                                </CardHeader>

                                <CardContent className="p-6">
                                    <CardTitle className="text-lg mb-2 line-clamp-1">
                                        {course.title}
                                    </CardTitle>
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                        {course.description}
                                    </p>

                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-2xl font-bold text-blue-600">
                                            ${course.price}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => addToCart(course._id)}
                                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                                        >
                                            <ShoppingCart size={18} className="ml-2" />
                                            أضف للسلة
                                        </Button>
                                        <Button
                                            onClick={() => navigate(`/course-details/${course._id}`)}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            التفاصيل
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
