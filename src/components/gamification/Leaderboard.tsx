import { Trophy, Medal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Leaderboard = () => {
    // Mock Data
    const leaders = [
        { id: 1, name: "أحمد محمد", xp: 12500, avatar: "", rank: 1 },
        { id: 2, name: "سارة علي", xp: 11200, avatar: "", rank: 2 },
        { id: 3, name: "خالد عمر", xp: 10800, avatar: "", rank: 3 },
        { id: 4, name: "مستخدم حالي", xp: 4500, avatar: "", rank: 15, isCurrentUser: true }, // المستخدم الحالي
        { id: 5, name: "نورة حسن", xp: 9500, avatar: "", rank: 4 },
    ];

    // Sort by rank
    const sortedLeaders = leaders.sort((a, b) => a.rank - b.rank).slice(0, 5);

    return (
        <Card className="border-gray-200 shadow-sm h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    لوحة المتصدرين
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {sortedLeaders.map((user) => (
                        <div
                            key={user.id}
                            className={`flex items-center justify-between p-3 rounded-lg ${user.isCurrentUser ? "bg-blue-50 border border-blue-100 ring-1 ring-blue-200" : "hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${user.rank === 1 ? "bg-yellow-100 text-yellow-700" :
                                        user.rank === 2 ? "bg-gray-100 text-gray-700" :
                                            user.rank === 3 ? "bg-orange-100 text-orange-700" :
                                                "text-gray-500"
                                    }`}>
                                    {user.rank <= 3 ? <Medal size={16} /> : user.rank}
                                </div>

                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={user.avatar} />
                                    <AvatarFallback>{user.name.slice(0, 2)}</AvatarFallback>
                                </Avatar>

                                <div>
                                    <p className={`text-sm font-medium ${user.isCurrentUser ? "text-blue-700" : "text-gray-900"}`}>
                                        {user.name} {user.isCurrentUser && "(أنت)"}
                                    </p>
                                </div>
                            </div>

                            <div className="text-sm font-bold text-gray-600">
                                {user.xp.toLocaleString()} XP
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};

export default Leaderboard;
