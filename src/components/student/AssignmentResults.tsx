import { FileText, CheckCircle2, Clock, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AssignmentResult {
    _id: string;
    assignmentTitle: string;
    courseName: string;
    score?: number;
    totalScore: number;
    grade?: string;
    status: "pending" | "graded" | "submitted";
    submittedAt: string;
    gradedAt?: string;
    feedback?: string;
}

interface AssignmentResultsProps {
    results: AssignmentResult[];
    loading?: boolean;
}

const AssignmentResults = ({ results, loading = false }: AssignmentResultsProps) => {
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
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>لم تقدم أي مهمة بعد</p>
                <p className="text-sm mt-2">ابدأ بتقديم المهام لترى نتائجك هنا</p>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "graded":
                return <Badge className="bg-green-600">تم التصحيح</Badge>;
            case "submitted":
                return <Badge variant="secondary">قيد المراجعة</Badge>;
            case "pending":
                return <Badge variant="outline">قيد الإنجاز</Badge>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            {results.map((assignment) => (
                <Card key={assignment._id} className="border-gray-200 hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-lg mb-1">{assignment.assignmentTitle}</CardTitle>
                                <p className="text-sm text-gray-500">{assignment.courseName}</p>
                            </div>
                            {getStatusBadge(assignment.status)}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Score and Dates */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {/* Score (if graded) */}
                                {assignment.status === "graded" && assignment.score !== undefined && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">الدرجة</p>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {assignment.score}
                                            <span className="text-sm text-gray-500 font-normal">/{assignment.totalScore}</span>
                                        </p>
                                    </div>
                                )}

                                {/* Grade (if available) */}
                                {assignment.grade && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">التقدير</p>
                                        <p className="text-2xl font-bold text-blue-600">{assignment.grade}</p>
                                    </div>
                                )}

                                {/* Submitted Date */}
                                <div>
                                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                        <Clock size={12} />
                                        تاريخ التسليم
                                    </p>
                                    <p className="text-sm font-medium text-gray-700">
                                        {new Date(assignment.submittedAt).toLocaleDateString('ar-EG', {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                {/* Graded Date (if graded) */}
                                {assignment.gradedAt && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                            <CheckCircle2 size={12} />
                                            تاريخ التصحيح
                                        </p>
                                        <p className="text-sm font-medium text-gray-700">
                                            {new Date(assignment.gradedAt).toLocaleDateString('ar-EG', {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Feedback */}
                            {assignment.feedback && (
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                                        <MessageSquare size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-xs font-semibold text-blue-900 mb-1">تعليق المدرس:</p>
                                            <p className="text-sm text-gray-700">{assignment.feedback}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default AssignmentResults;
