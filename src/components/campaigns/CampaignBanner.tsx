import { useState, useEffect } from 'react';
import { X, Tag, Clock } from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { Campaign } from '@/types/campaign';
import CountdownTimer from './CountdownTimer';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const CampaignBanner = () => {
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [isVisible, setIsVisible] = useState(true);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const data = await campaignService.getCurrentBanner();
                setCampaign(data);
            } catch (error) {
                console.error('Failed to fetch campaign:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaign();
    }, []);

    const handleExpire = () => {
        setIsVisible(false);
        setCampaign(null);
    };

    const handleClose = () => {
        setIsVisible(false);
        // Store in localStorage to remember user closed it
        if (campaign) {
            localStorage.setItem(`campaign_closed_${campaign._id}`, 'true');
        }
    };

    const handleCTA = () => {
        navigate('/courses');
        handleClose();
    };

    // Don't render if loading, no campaign, or user closed it
    if (loading || !campaign || !isVisible) {
        return null;
    }

    // Check if user previously closed this campaign
    const wasClosed = localStorage.getItem(`campaign_closed_${campaign._id}`);
    if (wasClosed) {
        return null;
    }

    const discountText = campaign.discountType === 'percentage'
        ? `${campaign.discountValue}% خصم`
        : `خصم ${campaign.discountValue} جنيه`;

    const bgColor = campaign.bannerColor || 'bg-gradient-to-r from-orange-500 to-red-500';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`relative ${bgColor} text-white py-4 px-6 shadow-lg z-50`}
                dir="rtl"
            >
                <div className="container mx-auto max-w-7xl">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Campaign Info */}
                        <div className="flex items-center gap-4 flex-1">
                            <div className="hidden md:flex items-center justify-center w-12 h-12 bg-white/20 rounded-full">
                                <Tag size={24} />
                            </div>
                            <div className="text-center md:text-right">
                                <h3 className="text-lg md:text-xl font-bold mb-1">
                                    {campaign.bannerText || campaign.name}
                                </h3>
                                <p className="text-sm opacity-90">
                                    {campaign.description}
                                </p>
                            </div>
                        </div>

                        {/* Discount Badge */}
                        <div className="flex items-center gap-4">
                            <div className="bg-white text-orange-600 px-6 py-3 rounded-full font-bold text-lg shadow-lg">
                                {discountText}
                            </div>
                        </div>

                        {/* Countdown Timer */}
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Clock size={20} />
                                <span className="text-sm font-medium">ينتهي خلال:</span>
                            </div>
                            <CountdownTimer
                                endDate={campaign.endDate}
                                onExpire={handleExpire}
                                compact={false}
                            />
                        </div>

                        {/* CTA Button */}
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleCTA}
                                className="bg-white text-orange-600 hover:bg-gray-100 font-bold px-6 py-2 rounded-full shadow-lg"
                            >
                                تسوق الآن
                            </Button>

                            {/* Close Button */}
                            <button
                                onClick={handleClose}
                                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                                aria-label="إغلاق"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default CampaignBanner;
