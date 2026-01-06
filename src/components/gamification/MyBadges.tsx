import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface BadgeItem {
    badge: {
        _id: string;
        name: string;
        description: string;
        icon?: string;
        type: string;
        points: number;
        rarity: string;
    };
    earnedAt: string;
}

const MyBadges = () => {
    const [badges, setBadges] = useState<BadgeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    const fetchMyBadges = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/badges/me`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBadges(res.data?.data || []);
        } catch (error) {
            console.error("Error fetching badges:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyBadges();
    }, [token]);

    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'legendary': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'epic': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'rare': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <Card className="border-gray-200 shadow-sm h-full font-cairo">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5 text-yellow-500" />
                    جوائزي وأوسمتي
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                    </div>
                ) : badges.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Award className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">لم تحصل على أي أوسمة بعد. أكمل التحديات لتربح!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {badges.map((item, index) => (
                            <TooltipProvider key={item.badge._id || index}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className={`flex flex-col items-center p-4 rounded-xl border-2 transition-all hover:scale-105 cursor-pointer ${getRarityColor(item.badge.rarity)} bg-opacity-50`}>
                                            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-2 text-2xl">
                                                {/* Use icon if available, else emoji or generic icon */}
                                                {item.badge.icon ? (
                                                    <img src={item.badge.icon} alt={item.badge.name} className="w-8 h-8 object-contain" />
                                                ) : (
                                                    <span>🏆</span>
                                                )}
                                            </div>
                                            <h4 className="font-bold text-sm text-center line-clamp-1">{item.badge.name}</h4>
                                            <span className="text-[10px] opacity-70 mt-1">{new Date(item.earnedAt).toLocaleDateString()}</span>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <div className="text-center">
                                            <p className="font-bold">{item.badge.name}</p>
                                            <p className="text-xs">{item.badge.description}</p>
                                            <p className="text-xs mt-1 text-yellow-600">+{item.badge.points} Points</p>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default MyBadges;
