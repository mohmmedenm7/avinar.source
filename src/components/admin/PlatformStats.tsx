import { Users, BookOpen, TrendingUp, Activity, Trophy, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PlatformStatsProps {
    stats?: {
        totalStudents?: number;
        totalCourses?: number;
        totalInstructors?: number;
        activeStudents?: number;
        totalRevenue?: number;
        averageProgress?: number;
    };
    loading?: boolean;
}

const PlatformStats = ({ stats, loading = false }: PlatformStatsProps) => {
    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const defaultStats = {
        totalStudents: stats?.totalStudents ?? 0,
        totalCourses: stats?.totalCourses ?? 0,
        totalInstructors: stats?.totalInstructors ?? 0,
        activeStudents: stats?.activeStudents ?? 0,
        totalRevenue: stats?.totalRevenue ?? 0,
        averageProgress: stats?.averageProgress ?? 0,
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {/* Total Students */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">إجمالي الطلاب</CardTitle>
                    <Users className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{defaultStats.totalStudents}</div>
                    <p className="text-xs text-gray-500 mt-1">
                        طالب مسجل في المنصة
                    </p>
                </CardContent>
            </Card>

            {/* Active Students */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">الطلاب النشطين</CardTitle>
                    <Activity className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{defaultStats.activeStudents}</div>
                    <p className="text-xs text-gray-500 mt-1">
                        نشط هذا الأسبوع
                    </p>
                </CardContent>
            </Card>

            {/* Total Courses */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">عدد الكورسات</CardTitle>
                    <BookOpen className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{defaultStats.totalCourses}</div>
                    <p className="text-xs text-gray-500 mt-1">
                        كورس متاح
                    </p>
                </CardContent>
            </Card>

            {/* Total Instructors */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">عدد المدرسين</CardTitle>
                    <Trophy className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{defaultStats.totalInstructors}</div>
                    <p className="text-xs text-gray-500 mt-1">
                        مدرس نشط
                    </p>
                </CardContent>
            </Card>

            {/* Total Revenue */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">إجمالي الإيرادات</CardTitle>
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">${defaultStats.totalRevenue}</div>
                    <p className="text-xs text-gray-500 mt-1">
                        إيرادات المنصة
                    </p>
                </CardContent>
            </Card>

            {/* Average Progress */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">متوسط التقدم</CardTitle>
                    <TrendingUp className="h-4 w-4 text-cyan-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{defaultStats.averageProgress}%</div>
                    <p className="text-xs text-gray-500 mt-1">
                        عبر جميع الطلاب
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default PlatformStats;
