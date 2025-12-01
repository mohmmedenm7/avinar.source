import { BookOpen, CheckCircle2, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CourseProgressProps {
    courseId: string;
    courseTitle: string;
    courseImage?: string;
    completedLessons: number;
    totalLessons: number;
    lastWatchedLesson?: string;
    totalMinutes?: number;
    completedMinutes?: number;
}

const CourseProgress = ({
    courseId,
    courseTitle,
    courseImage,
    completedLessons,
    totalLessons,
    lastWatchedLesson,
    totalMinutes = 0,
    completedMinutes = 0,
}: CourseProgressProps) => {
    const navigate = useNavigate();
    const progressPercentage = (completedLessons / totalLessons) * 100;
    const timeProgressPercentage = totalMinutes > 0 ? (completedMinutes / totalMinutes) * 100 : 0;

    return (
        <Card className="hover:shadow-md transition-shadow border-gray-200">
            <CardContent className="p-6">
                <div className="flex gap-4">
                    {/* Course Image */}
                    <div className="flex-shrink-0">
                        <img
                            src={courseImage || "/placeholder-course.jpg"}
                            alt={courseTitle}
                            className="w-24 h-24 object-cover rounded-lg"
                        />
                    </div>

                    {/* Course Info */}
                    <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900 mb-2">{courseTitle}</h3>

                        {/* Lessons Progress */}
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <BookOpen size={14} />
                                    الدروس
                                </span>
                                <span className="text-sm font-medium text-gray-900">
                                    {completedLessons} / {totalLessons}
                                </span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                            <p className="text-xs text-gray-500 mt-1">
                                {progressPercentage.toFixed(0)}% مكتمل
                            </p>
                        </div>

                        {/* Time Progress */}
                        {totalMinutes > 0 && (
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-gray-600 flex items-center gap-1">
                                        <Clock size={14} />
                                        الوقت
                                    </span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {completedMinutes} / {totalMinutes} دقيقة
                                    </span>
                                </div>
                                <Progress value={timeProgressPercentage} className="h-2" />
                            </div>
                        )}

                        {/* Last Watched */}
                        {lastWatchedLesson && (
                            <div className="flex items-start gap-2 mb-3 p-2 bg-blue-50 rounded-lg">
                                <CheckCircle2 size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-xs text-gray-600">آخر درس مشاهد:</p>
                                    <p className="text-sm font-medium text-gray-900">{lastWatchedLesson}</p>
                                </div>
                            </div>
                        )}

                        {/* Continue Button */}
                        <Button
                            onClick={() => navigate(`/course/${courseId}`)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                            size="sm"
                        >
                            {progressPercentage === 100 ? "مراجعة الكورس" : "متابعة التعلم"}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default CourseProgress;
