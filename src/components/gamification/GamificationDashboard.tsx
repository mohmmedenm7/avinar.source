import { Trophy, Flame, Star, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GamificationStats {
    level?: number;
    currentXP?: number;
    nextLevelXP?: number;
    streak?: number;
    totalPoints?: number;
    nextGoal?: {
        title: string;
        progress: number;
    };
}

interface GamificationDashboardProps {
    stats?: GamificationStats;
}

const GamificationDashboard = ({ stats }: GamificationDashboardProps) => {
    // Default values if no stats provided
    const defaultStats = {
        level: stats?.level ?? 1,
        currentXP: stats?.currentXP ?? 0,
        nextLevelXP: stats?.nextLevelXP ?? 100,
        streak: stats?.streak ?? 0,
        totalPoints: stats?.totalPoints ?? 0,
        nextGoal: stats?.nextGoal ?? { title: "ابدأ رحلتك التعليمية", progress: 0 },
    };

    const progressPercentage = (defaultStats.currentXP / defaultStats.nextLevelXP) * 100;

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Level Card */}
            <Card className="bg-gradient-to-br from-violet-500 to-purple-600 text-white border-none shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/90">المستوى الحالي</CardTitle>
                    <Trophy className="h-4 w-4 text-yellow-300" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold mb-2">Level {defaultStats.level}</div>
                    <Progress value={progressPercentage} className="h-2 bg-white/20" />
                    <p className="text-xs text-white/80 mt-2">
                        {defaultStats.currentXP} / {defaultStats.nextLevelXP} XP للمستوى التالي
                    </p>
                </CardContent>
            </Card>

            {/* Streak Card */}
            <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-none shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white/90">حماس متواصل (Streak)</CardTitle>
                    <Flame className="h-4 w-4 text-yellow-300" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{defaultStats.streak} يوم</div>
                    <p className="text-xs text-white/80 mt-1">
                        حافظ على حماسك يومياً! 🔥
                    </p>
                </CardContent>
            </Card>

            {/* Points Card */}
            <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">مجموع النقاط</CardTitle>
                    <Star className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{defaultStats.totalPoints}</div>
                    <p className="text-xs text-gray-500 mt-1">
                        نقطة ذهبية
                    </p>
                </CardContent>
            </Card>

            {/* Next Goal Card */}
            <Card className="bg-white border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">الهدف التالي</CardTitle>
                    <Target className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-sm font-semibold text-gray-900 mb-1">{defaultStats.nextGoal.title}</div>
                    <Progress value={defaultStats.nextGoal.progress} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                        {defaultStats.nextGoal.progress}% مكتمل
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default GamificationDashboard;
