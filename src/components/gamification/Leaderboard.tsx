import { useState, useEffect } from "react";
import { Trophy, Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import { Link } from "react-router-dom";

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
                        {leaders.map((item: any, index) => {
                            // Handle both flat and nested structure (for robustness)
                            const user = item.user ? item.user : item;
                            const xp = item.xp !== undefined ? item.xp : (user.xp || 0);
                            const name = item.name || user.name || "مستخدم";
                            const avatar = item.avatar || user.profileImg || user.avatar;
                            const rank = item.rank || index + 1;
                            const isMe = item.isCurrentUser;
                            const userId = user._id;

                            return (
                                <div
                                    key={userId || index}
                                    className={`flex items-center justify-between p-3 rounded-lg ${isMe ? "bg-blue-50 border border-blue-100 ring-1 ring-blue-200" : "hover:bg-gray-50 transition-colors"
                                        }`}
                                >
                                    <Link to={`/profile/student/${userId}`} className="flex items-center gap-3 flex-1 group">
                                        <div
                                            className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${rank === 1
                                                ? "bg-yellow-100 text-yellow-700"
                                                : rank === 2
                                                    ? "bg-gray-100 text-gray-700"
                                                    : rank === 3
                                                        ? "bg-orange-100 text-orange-700"
                                                        : "text-gray-500"
                                                }`}
                                        >
                                            {rank <= 3 ? <Medal size={16} /> : rank}
                                        </div>

                                        <Avatar className="h-8 w-8 border border-white/50 group-hover:scale-110 transition-transform">
                                            <AvatarImage src={avatar ? `${API_BASE_URL}/uploads/users/${avatar}` : ''} />
                                            <AvatarFallback>{name?.slice(0, 2) || "?"}</AvatarFallback>
                                        </Avatar>

                                        <div>
                                            <p className={`text-sm font-medium group-hover:text-primary transition-colors ${isMe ? "text-blue-700" : "text-gray-900"}`}>
                                                {name} {isMe && "(أنت)"}
                                            </p>
                                        </div>
                                    </Link>

                                    <div className="text-sm font-bold text-gray-600">
                                        {xp.toLocaleString()} XP
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default Leaderboard;


