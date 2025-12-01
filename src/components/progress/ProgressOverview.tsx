import { Award, BookOpen, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgressOverviewProps {
    totalCourses: number;
    completedCourses: number;
    totalLessons: number;
    completedLessons: number;
    totalMinutes: number;
    averageProgress: number;
}

const ProgressOverview = ({
    totalCourses,
    completedCourses,
    totalLessons,
    completedLessons,
    totalMinutes,
    averageProgress,
}: ProgressOverviewProps) => {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
            {/* Total Courses */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">كورساتي</CardTitle>
                    <BookOpen className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{totalCourses}</div>
                    <p className="text-xs text-gray-500 mt-1">
                        {completedCourses} كورس مكتمل
                    </p>
                </CardContent>
            </Card>

            {/* Total Lessons */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">الدروس المكتملة</CardTitle>
                    <Award className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{completedLessons}</div>
                    <p className="text-xs text-gray-500 mt-1">
                        من أصل {totalLessons} درس
                    </p>
                </CardContent>
            </Card>

            {/* Total Time */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">الوقت المستثمر</CardTitle>
                    <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                        {Math.floor(totalMinutes / 60)}:{(totalMinutes % 60).toString().padStart(2, '0')}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        ساعات من التعلم
                    </p>
                </CardContent>
            </Card>

            {/* Average Progress */}
            <Card className="border-gray-200 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">متوسط التقدم</CardTitle>
                    <TrendingUp className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{averageProgress}%</div>
                    <p className="text-xs text-gray-500 mt-1">
                        عبر جميع الكورسات
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default ProgressOverview;
