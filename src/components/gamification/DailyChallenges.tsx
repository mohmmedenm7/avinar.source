import { useState, useEffect } from "react";
import { CheckCircle2, Circle, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";

interface Challenge {
    _id: string;
    title: string;
    description?: string;
    xp: number;
    completed: boolean;
    claimed?: boolean;
}

const DailyChallenges = () => {
    const [challenges, setChallenges] = useState<Challenge[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const token = localStorage.getItem("token");

    const fetchChallenges = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/challenges/daily`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setChallenges(res.data?.data || res.data || []);
        } catch (error: any) {
            console.error("Error fetching challenges:", error);
            // Fallback to empty array on error
            setChallenges([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimReward = async (challengeId: string) => {
        if (!token) return;
        try {
            await axios.post(
                `${API_BASE_URL}/api/v1/challenges/${challengeId}/claim`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast({
                title: "تم استلام المكافأة بنجاح! 🎉",
            });
            fetchChallenges(); // Refresh challenges
        } catch (error: any) {
            console.error("Error claiming reward:", error);
            toast({
                title: "خطأ في استلام المكافأة",
                description: error.response?.data?.message || "حدث خطأ ما",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        fetchChallenges();
    }, [token]);

    return (
        <Card className="border-gray-200 shadow-sm h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Gift className="h-5 w-5 text-purple-600" />
                    التحديات اليومية
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    </div>
                ) : challenges.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Gift className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">لا توجد تحديات متاحة حالياً</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {challenges.map((challenge) => (
                            <div
                                key={challenge._id}
                                className={`flex items-center justify-between p-3 rounded-lg border ${challenge.completed ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {challenge.completed ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                    ) : (
                                        <Circle className="h-5 w-5 text-gray-400" />
                                    )}
                                    <div>
                                        <p className={`font-medium ${challenge.completed ? "text-gray-900" : "text-gray-600"}`}>
                                            {challenge.title}
                                        </p>
                                        {challenge.description && (
                                            <p className="text-xs text-gray-500">{challenge.description}</p>
                                        )}
                                        <p className="text-xs text-gray-500">+{challenge.xp} XP</p>
                                    </div>
                                </div>

                                {challenge.completed && !challenge.claimed && (
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
                                        onClick={() => handleClaimReward(challenge._id)}
                                    >
                                        استلم المكافأة
                                    </Button>
                                )}

                                {challenge.claimed && (
                                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded">
                                        تم الاستلام
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default DailyChallenges;

