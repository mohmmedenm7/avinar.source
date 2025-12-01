import { BookOpen, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface QuizResult {
    _id: string;
    quizTitle: string;
    courseName: string;
    score: number;
    totalScore: number;
    percentage: number;
    passingScore: number;
    passed: boolean;
    completedAt: string;
    timeTaken?: number; // in minutes
}

interface QuizResultsProps {
    results: QuizResult[];
    loading?: boolean;
}

const QuizResults = ({ results, loading = false }: QuizResultsProps) => {
    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                <p>لم تكمل أي اختبار بعد</p>
                <p className="text-sm mt-2">ابدأ بحل الاختبارات لترى نتائجك هنا</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {results.map((result) => (
                <Card key={result._id} className="border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-lg mb-1">{result.quizTitle}</CardTitle>
                                <p className="text-sm text-gray-500">{result.courseName}</p>
                            </div>
                            <Badge
                                variant={result.passed ? "default" : "destructive"}
                                className={result.passed ? "bg-green-600" : ""}
                            >
                                {result.passed ? (
                                    <span className="flex items-center gap-1">
                                        <CheckCircle2 size={14} />
                                        ناجح
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <XCircle size={14} />
                                        راسب
                                    </span>
                                )}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Score */}
                            <div>
                                <p className="text-xs text-gray-500 mb-1">الدرجة</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {result.score}
                                    <span className="text-sm text-gray-500 font-normal">/{result.totalScore}</span>
                                </p>
                            </div>

                            {/* Percentage */}
                            <div>
                                <p className="text-xs text-gray-500 mb-1">النسبة المئوية</p>
                                <p className="text-2xl font-bold text-blue-600">{result.percentage}%</p>
                            </div>

                            {/* Passing Score */}
                            <div>
                                <p className="text-xs text-gray-500 mb-1">درجة النجاح</p>
                                <p className="text-lg font-semibold text-gray-700">{result.passingScore}%</p>
                            </div>

                            {/* Time Taken */}
                            {result.timeTaken && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                        <Clock size={12} />
                                        الوقت المستغرق
                                    </p>
                                    <p className="text-lg font-semibold text-gray-700">{result.timeTaken} دقيقة</p>
                                </div>
                            )}
                        </div>

                        {/* Date */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                                تم الإكمال: {new Date(result.completedAt).toLocaleDateString('ar-EG', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default QuizResults;
