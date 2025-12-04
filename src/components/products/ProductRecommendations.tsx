import { useState, useEffect } from 'react';
import { recommendationService } from '@/services/recommendationService';
import { RecommendedProduct } from '@/types/campaign';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Users } from 'lucide-react';
import { getImageUrl } from '@/utils/imageUtils';
import { motion } from 'framer-motion';

interface ProductRecommendationsProps {
    productId: string;
    type: 'recommendations' | 'also-bought';
    title?: string;
}

const ProductRecommendations = ({
    productId,
    type,
    title,
}: ProductRecommendationsProps) => {
    const [products, setProducts] = useState<RecommendedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecommendations = async () => {
            setLoading(true);
            try {
                const data =
                    type === 'recommendations'
                        ? await recommendationService.getRecommendations(productId)
                        : await recommendationService.getAlsoBought(productId);
                setProducts(data);
            } catch (error) {
                console.error('Failed to fetch recommendations:', error);
            } finally {
                setLoading(false);
            }
        };

        if (productId) {
            fetchRecommendations();
        }
    }, [productId, type]);

    if (loading) {
        return (
            <div className="py-12">
                <div className="flex items-center gap-2 mb-6">
                    <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-gray-100 rounded-xl h-80 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return null;
    }

    const defaultTitle =
        type === 'recommendations' ? 'موصى به لك' : 'الطلاب اشتروا أيضاً';

    return (
        <section className="py-12 px-6 bg-gray-50" dir="rtl">
            <div className="container mx-auto max-w-7xl">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">{title || defaultTitle}</h2>
                    <button
                        onClick={() => navigate('/courses')}
                        className="flex items-center gap-2 text-sky-600 hover:text-sky-700 font-medium group"
                    >
                        عرض المزيد
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product, index) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            onClick={() => navigate(`/course/${product._id}`)}
                            className="group bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-sky-300 hover:shadow-xl transition-all duration-300 cursor-pointer"
                        >
                            {/* Product Image */}
                            <div className="aspect-video bg-gray-100 relative overflow-hidden">
                                {product.imageCover ? (
                                    <img
                                        src={getImageUrl(product.imageCover)}
                                        alt={product.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-sky-100 to-blue-50">
                                        <span className="text-4xl">📚</span>
                                    </div>
                                )}

                                {/* Score Badge (if available) */}
                                {product.score && (
                                    <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <Star size={12} className="fill-white" />
                                        {Math.round(product.score)}%
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                {/* Category */}
                                {product.category && (
                                    <span className="text-xs font-bold text-sky-600 uppercase tracking-wide bg-sky-50 px-2 py-1 rounded">
                                        {product.category.name}
                                    </span>
                                )}

                                {/* Title */}
                                <h3 className="text-lg font-bold mt-3 mb-2 line-clamp-2 group-hover:text-sky-600 transition-colors">
                                    {product.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                    {product.description}
                                </p>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <Users size={14} />
                                        <span>1.2k طالب</span>
                                    </div>
                                    <div className="text-lg font-bold text-gray-900">
                                        ${product.price}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ProductRecommendations;
