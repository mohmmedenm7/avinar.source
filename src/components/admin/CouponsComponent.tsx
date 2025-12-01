import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { API_BASE_URL } from '@/config/env';
import { Ticket, Plus, Edit2, Trash2, X } from 'lucide-react';

interface Coupon {
    _id: string;
    name: string;
    expire: string;
    discount: number;
}

interface CouponsComponentProps {
    token: string;
    searchQuery: string;
}

export const CouponsComponent: React.FC<CouponsComponentProps> = ({ token, searchQuery }) => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        expire: '',
        discount: 0,
    });
    const { toast } = useToast();

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/coupons`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCoupons(res.data?.data || []);
        } catch (error: any) {
            console.error('Error fetching coupons:', error);
            toast({
                title: error.response?.data?.message || 'فشل تحميل الكوبونات',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.expire || formData.discount <= 0) {
            toast({ title: 'يرجى ملء جميع الحقول بشكل صحيح', variant: 'destructive' });
            return;
        }

        try {
            if (editingCoupon) {
                // Update
                await axios.put(
                    `${API_BASE_URL}/api/v1/coupons/${editingCoupon._id}`,
                    { discount: formData.discount },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                toast({ title: '✓ تم تحديث الكوبون بنجاح' });
            } else {
                // Create
                await axios.post(
                    `${API_BASE_URL}/api/v1/coupons`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );
                toast({ title: '✓ تم إضافة الكوبون بنجاح' });
            }

            setFormData({ name: '', expire: '', discount: 0 });
            setShowAddForm(false);
            setEditingCoupon(null);
            fetchCoupons();
        } catch (error: any) {
            toast({
                title: error.response?.data?.message || 'فشل حفظ الكوبون',
                variant: 'destructive',
            });
        }
    };

    const handleEdit = (coupon: Coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            name: coupon.name,
            expire: coupon.expire.split('T')[0],
            discount: coupon.discount,
        });
        setShowAddForm(true);
    };

    const handleDelete = async (couponId: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا الكوبون؟')) return;

        try {
            await axios.delete(`${API_BASE_URL}/api/v1/coupons/${couponId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast({ title: '✓ تم حذف الكوبون بنجاح' });
            fetchCoupons();
        } catch (error: any) {
            toast({
                title: error.response?.data?.message || 'فشل حذف الكوبون',
                variant: 'destructive',
            });
        }
    };

    const handleCancel = () => {
        setShowAddForm(false);
        setEditingCoupon(null);
        setFormData({ name: '', expire: '', discount: 0 });
    };

    // Filter coupons based on search
    const filteredCoupons = coupons.filter((coupon) =>
        coupon.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">إدارة الكوبونات</h2>
                {!showAddForm && (
                    <Button
                        onClick={() => setShowAddForm(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        <Plus size={20} className="ml-2" />
                        إضافة كوبون جديد
                    </Button>
                )}
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {editingCoupon ? 'تعديل الكوبون' : 'إضافة كوبون جديد'}
                            </h3>
                            <button
                                onClick={handleCancel}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        اسم الكوبون <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                                        placeholder="SAVE20"
                                        className="text-right"
                                        dir="ltr"
                                        disabled={!!editingCoupon}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        تاريخ الانتهاء <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="date"
                                        value={formData.expire}
                                        onChange={(e) => setFormData({ ...formData, expire: e.target.value })}
                                        className="text-right"
                                        dir="ltr"
                                        disabled={!!editingCoupon}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        نسبة الخصم (%) <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="number"
                                        value={formData.discount}
                                        onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
                                        placeholder="20"
                                        min="1"
                                        max="100"
                                        className="text-right"
                                        dir="rtl"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                                    {editingCoupon ? 'تحديث الكوبون' : 'إضافة الكوبون'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                >
                                    إلغاء
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Coupons List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                </div>
            ) : filteredCoupons.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredCoupons.map((coupon) => {
                        const expireDate = new Date(coupon.expire);
                        const isExpired = expireDate < new Date();

                        return (
                            <Card key={coupon._id} className={`hover:shadow-md transition-shadow ${isExpired ? 'opacity-60' : ''}`}>
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Ticket size={24} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-900">{coupon.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {isExpired ? 'منتهي' : 'نشط'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-1">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleEdit(coupon)}
                                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                            >
                                                <Edit2 size={16} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleDelete(coupon._id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">الخصم:</span>
                                            <span className="text-2xl font-bold text-green-600">{coupon.discount}%</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">ينتهي في:</span>
                                            <span className="text-sm text-gray-900">
                                                {expireDate.toLocaleDateString('ar-EG')}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Ticket size={64} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500 text-lg mb-4">
                            {searchQuery ? 'لا توجد كوبونات مطابقة للبحث' : 'لا توجد كوبونات'}
                        </p>
                        {!searchQuery && (
                            <Button
                                onClick={() => setShowAddForm(true)}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                إضافة كوبون جديد
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
};
