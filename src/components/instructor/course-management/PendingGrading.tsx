import { Clock, User, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PendingItem {
    _id: string;
    studentName: string;
    studentEmail: string;
    courseName: string;
    title: string;
    type: "assignment" | "quiz";
    submittedAt: string;
}

interface PendingGradingProps {
    items: PendingItem[];
    loading?: boolean;
    onGrade?: (itemId: string) => void;
}

const PendingGrading = ({ items, loading = false, onGrade }: PendingGradingProps) => {
    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p>لا توجد مهام معلقة للتصحيح</p>
                <p className="text-sm mt-2">جميع المهام تم تصحيحها 🎉</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item) => (
                <Card key={item._id} className="border-gray-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge variant={item.type === "assignment" ? "default" : "secondary"}>
                                        {item.type === "assignment" ? "مهمة" : "اختبار"}
                                    </Badge>
                                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                                </div>

                                <div className="space-y-1 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <User size={14} />
                                        <span>{item.studentName}</span>
                                        <span className="text-gray-400">({item.studentEmail})</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <FileText size={14} />
                                        <span>{item.courseName}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Clock size={14} />
                                        <span>
                                            تم التسليم: {new Date(item.submittedAt).toLocaleDateString('ar-EG', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => onGrade?.(item._id)}
                            >
                                ابدأ التصحيح
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default PendingGrading;
