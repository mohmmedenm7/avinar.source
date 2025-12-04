import { useState, useEffect } from "react";
import { Trophy, Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";

interface LeaderboardUser {
    _id: string;
    name: string;
    email?: string;
    xp: number;
    rank: number;
    avatar?: string;
    isCurrentUser?: boolean;
}

const Leaderboard = () => {
    const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
    const [myRanking, setMyRanking] = useState<LeaderboardUser | null>(null);
    const [loading, setLoading] = useState(true);
    const token = localStorage.getItem("token");

    const fetchLeaderboard = async () => {
        setLoading(true);
        try {
            // Fetch global leaderboard
            const leaderboardRes = await axios.get(`${API_BASE_URL}/api/v1/leaderboard/global`);
            const leaderboardData = leaderboardRes.data?.data || leaderboardRes.data || [];

            // Fetch my ranking if authenticated
            let myRank = null;
            if (token) {
                try {
                    const myRankRes = await axios.get(`${API_BASE_URL}/api/v1/leaderboard/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    myRank = myRankRes.data?.data || myRankRes.data;
                    setMyRanking(myRank);
                } catch (error) {
                    console.error("Error fetching my ranking:", error);
                }
            }

            // Mark current user in leaderboard
            const processedLeaders = leaderboardData.map((user: any) => ({
                ...user,
                isCurrentUser: myRank && user._id === myRank._id,
            }));

            // If current user is not in top leaders, add them
            if (myRank && !processedLeaders.some((u: any) => u._id === myRank._id)) {
                processedLeaders.push({ ...myRank, isCurrentUser: true });
            }

            setLeaders(processedLeaders.slice(0, 10)); // Show top 10
        } catch (error: any) {
            console.error("Error fetching leaderboard:", error);
            setLeaders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
    }, [token]);

    return (
        <Card className="border-gray-200 shadow-sm h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    لوحة المتصدرين
                </CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                    </div>
                ) : leaders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <Trophy className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">لا توجد بيانات متاحة</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {leaders.map((user) => (
                            <div
                                key={user._id}
                                className={`flex items-center justify-between p-3 rounded-lg ${user.isCurrentUser ? "bg-blue-50 border border-blue-100 ring-1 ring-blue-200" : "hover:bg-gray-50"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${user.rank === 1
                                            ? "bg-yellow-100 text-yellow-700"
                                            : user.rank === 2
                                                ? "bg-gray-100 text-gray-700"
                                                : user.rank === 3
                                                    ? "bg-orange-100 text-orange-700"
                                                    : "text-gray-500"
                                            }`}
                                    >
                                        {user.rank <= 3 ? <Medal size={16} /> : user.rank}
                                    </div>

                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user.avatar} />
                                        <AvatarFallback>{user.name?.slice(0, 2) || "?"}</AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <p className={`text-sm font-medium ${user.isCurrentUser ? "text-blue-700" : "text-gray-900"}`}>
                                            {user.name || "مستخدم"} {user.isCurrentUser && "(أنت)"}
                                        </p>
                                    </div>
                                </div>

                                <div className="text-sm font-bold text-gray-600">
                                    {user.xp?.toLocaleString() || 0} XP
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default Leaderboard;

