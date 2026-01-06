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
    const [challenges, setChallenges] = useState<any[]>([]); // Using any[] to handle the nested structure flexibly
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    const token = localStorage.getItem("token");

    const fetchChallenges = async () => {
        if (!token) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/daily-challenges/daily`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            // Backend returns: [{ challenge: {...}, progress: 0, completed: false, claimed: false }]
            setChallenges(res.data?.data || []);
        } catch (error: any) {
            console.error("Error fetching challenges:", error);
            setChallenges([]);
        } finally {
            setLoading(false);
        }
    };

    const [selectedTrivia, setSelectedTrivia] = useState<any>(null);

    const handleClaimReward = async (challengeId: string) => {
        if (!token) return;
        try {
            await axios.post(
                `${API_BASE_URL}/api/v1/daily-challenges/daily/${challengeId}/claim`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast({
                title: "تم استلام المكافأة بنجاح! 🎉",
                className: "bg-green-500 text-white",
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

    const openTriviaModal = (challenge: any) => {
        setSelectedTrivia(challenge);
    };

    const handleSolveTrivia = async (challengeId: string, answerIndex: number) => {
        if (!token) return;
        try {
            const res = await axios.post(
                `${API_BASE_URL}/api/v1/daily-challenges/daily/${challengeId}/solve`,
                { answerIndex },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.correct) {
                toast({
                    title: "إجابة صحيحة! 🎉",
                    className: "bg-green-500 text-white",
                });
                setSelectedTrivia(null);
                fetchChallenges();
            } else {
                toast({
                    title: "إجابة خاطئة ❌",
                    description: "حاول مرة أخرى لاحقاً",
                    variant: "destructive",
                });
                setSelectedTrivia(null);
            }
        } catch (error: any) {
            console.error("Error solving trivia:", error);
            toast({
                title: "خطأ",
                description: error.response?.data?.message || "حدث خطأ ما",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        fetchChallenges();
    }, [token]);

    return (
        <Card className="border-gray-200 shadow-sm h-full font-cairo">
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
                        {challenges.map((item, index) => {
                            const challenge = item.challenge;
                            // Check if challenge object is valid
                            if (!challenge) return null;

                            return (
                                <div
                                    key={challenge._id || index}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${item.completed ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.completed ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <Circle className="h-5 w-5 text-gray-400" />
                                        )}
                                        <div>
                                            <p className={`font-medium ${item.completed ? "text-gray-900" : "text-gray-600"}`}>
                                                {challenge.title}
                                            </p>
                                            {challenge.description && (
                                                <p className="text-xs text-gray-500 mb-1">{challenge.description}</p>
                                            )}
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                                                    +{challenge.xpReward || challenge.xp || 50} XP
                                                </span>
                                                {challenge.badgeReward && (
                                                    <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                                                        🏆 وسام
                                                    </span>
                                                )}
                                                {!item.completed && (
                                                    <span className="text-gray-400">
                                                        ({item.progress || 0}/{challenge.target || 1})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {item.completed && !item.claimed && (
                                        <Button
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs shrink-0"
                                            onClick={() => handleClaimReward(challenge._id)}
                                        >
                                            استلم المكافأة
                                        </Button>
                                    )}

                                    {item.claimed && (
                                        <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded shrink-0">
                                            تم الاستلام
                                        </span>
                                    )}

                                    {!item.completed && challenge.type === 'trivia' && (
                                        <Button
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs shrink-0"
                                            onClick={() => openTriviaModal(challenge)}
                                        >
                                            حل السؤال
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>

            {/* Trivia Modal */}
            {selectedTrivia && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                            <h3 className="font-bold text-lg">{selectedTrivia.title}</h3>
                            <button onClick={() => setSelectedTrivia(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div className="p-6">
                            <p className="mb-4 text-lg font-medium text-center">{selectedTrivia.triviaData?.question}</p>
                            <div className="space-y-3">
                                {selectedTrivia.triviaData?.options?.map((option: string, idx: number) => (
                                    <button
                                        key={idx}
                                        className="w-full text-right p-3 rounded-lg border hover:bg-purple-50 hover:border-purple-200 transition-colors"
                                        onClick={() => handleSolveTrivia(selectedTrivia._id, idx)}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default DailyChallenges;

