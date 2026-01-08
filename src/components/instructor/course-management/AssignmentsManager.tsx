import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, FileText, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";

interface Assignment {
    _id: string;
    title: string;
    description: string;
    dueDate: string;
    product: {
        _id: string;
        title: string;
    };
    submissions?: Submission[];
}

interface Submission {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
    };
    content: string;
    attachments?: string[];
    score?: number;
    feedback?: string;
    submittedAt: string;
    gradedAt?: string;
}

interface AssignmentsManagerProps {
    courses: Array<{ _id: string; title: string }>;
    token: string;
}

const AssignmentsManager = ({ courses, token }: AssignmentsManagerProps) => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

    const { toast } = useToast();

    // Form states
    const [newAssignment, setNewAssignment] = useState({
        title: "",
        description: "",
        dueDate: "",
        productId: "",
    });

    const [gradingForm, setGradingForm] = useState({
        score: "",
        feedback: "",
    });

    // Fetch assignments for a course
    const fetchAssignments = async (productId: string) => {
        if (!productId || !token) return;
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/products/${productId}/assignments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAssignments(res.data?.data || res.data || []);
        } catch (error: any) {
            console.error("Error fetching assignments:", error);
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    // Create new assignment
    const handleCreateAssignment = async () => {
        if (!newAssignment.productId || !newAssignment.title || !token) {
            toast({
                title: "خطأ",
                description: "يرجى ملء جميع الحقول المطلوبة",
                variant: "destructive",
            });
            return;
        }

        try {
            await axios.post(
                `${API_BASE_URL}/api/v1/products/${newAssignment.productId}/assignments`,
                {
                    title: newAssignment.title,
                    description: newAssignment.description,
                    dueDate: newAssignment.dueDate,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast({
                title: "تم إنشاء المهمة بنجاح",
            });

            setIsCreateDialogOpen(false);
            setNewAssignment({ title: "", description: "", dueDate: "", productId: "" });
            fetchAssignments(selectedCourse);
        } catch (error: any) {
            console.error("Error creating assignment:", error);
            toast({
                title: "خطأ في إنشاء المهمة",
                description: error.response?.data?.message || "حدث خطأ ما",
                variant: "destructive",
            });
        }
    };

    // Grade submission
    const handleGradeSubmission = async () => {
        if (!selectedSubmission || !token) return;

        try {
            await axios.put(
                `${API_BASE_URL}/api/v1/submissions/${selectedSubmission._id}/grade`,
                {
                    score: parseInt(gradingForm.score),
                    feedback: gradingForm.feedback,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            toast({
                title: "تم تقييم المهمة بنجاح",
            });

            setIsGradingDialogOpen(false);
            setGradingForm({ score: "", feedback: "" });
            fetchAssignments(selectedCourse);
        } catch (error: any) {
            console.error("Error grading submission:", error);
            toast({
                title: "خطأ في التقييم",
                description: error.response?.data?.message || "حدث خطأ ما",
                variant: "destructive",
            });
        }
    };

    useEffect(() => {
        if (selectedCourse) {
            fetchAssignments(selectedCourse);
        }
    }, [selectedCourse]);

    return (
        <div className="space-y-6">
            {/* Header with Course Selector and Create Button */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex-1 max-w-md">
                    <Label htmlFor="course-select">اختر الكورس</Label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                        <SelectTrigger id="course-select">
                            <SelectValue placeholder="اختر كورس" />
                        </SelectTrigger>
                        <SelectContent>
                            {courses.map((course) => (
                                <SelectItem key={course._id} value={course._id}>
                                    {course.title}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
                            <Plus size={18} />
                            إنشاء مهمة جديدة
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>إنشاء مهمة جديدة</DialogTitle>
                            <DialogDescription>
                                أضف مهمة جديدة للطلاب في الكورس المحدد
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="assignment-course">الكورس</Label>
                                <Select
                                    value={newAssignment.productId}
                                    onValueChange={(value) =>
                                        setNewAssignment({ ...newAssignment, productId: value })
                                    }
                                >
                                    <SelectTrigger id="assignment-course">
                                        <SelectValue placeholder="اختر كورس" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {courses.map((course) => (
                                            <SelectItem key={course._id} value={course._id}>
                                                {course.title}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="assignment-title">عنوان المهمة</Label>
                                <Input
                                    id="assignment-title"
                                    value={newAssignment.title}
                                    onChange={(e) =>
                                        setNewAssignment({ ...newAssignment, title: e.target.value })
                                    }
                                    placeholder="مثال: مهمة عملية 1"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="assignment-description">الوصف</Label>
                                <Textarea
                                    id="assignment-description"
                                    value={newAssignment.description}
                                    onChange={(e) =>
                                        setNewAssignment({ ...newAssignment, description: e.target.value })
                                    }
                                    placeholder="قم ببناء API..."
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="assignment-dueDate">تاريخ التسليم</Label>
                                <Input
                                    id="assignment-dueDate"
                                    type="date"
                                    value={newAssignment.dueDate}
                                    onChange={(e) =>
                                        setNewAssignment({ ...newAssignment, dueDate: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                                إلغاء
                            </Button>
                            <Button onClick={handleCreateAssignment} className="bg-blue-600 hover:bg-blue-700">
                                إنشاء المهمة
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Assignments List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : !selectedCourse ? (
                <div className="text-center py-12 text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>اختر كورس لعرض المهام</p>
                </div>
            ) : assignments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p>لا توجد مهام لهذا الكورس</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {assignments.map((assignment) => (
                        <Card key={assignment._id} className="border-gray-200">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        {assignment.title}
                                    </span>
                                    <span className="text-sm font-normal text-gray-500 flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(assignment.dueDate).toLocaleDateString("ar-EG")}
                                    </span>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 mb-4">{assignment.description}</p>

                                {/* Submissions */}
                                {assignment.submissions && assignment.submissions.length > 0 && (
                                    <div className="space-y-2">
                                        <h4 className="font-semibold text-gray-900 mb-2">
                                            التسليمات ({assignment.submissions.length})
                                        </h4>
                                        <div className="space-y-2">
                                            {assignment.submissions.map((submission) => (
                                                <div
                                                    key={submission._id}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{submission.user.name}</p>
                                                        <p className="text-sm text-gray-500">{submission.user.email}</p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            تم التسليم: {new Date(submission.submittedAt).toLocaleDateString("ar-EG")}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {submission.score !== undefined ? (
                                                            <div className="flex items-center gap-2 text-green-600">
                                                                <CheckCircle className="h-5 w-5" />
                                                                <span className="font-bold">{submission.score}/100</span>
                                                            </div>
                                                        ) : (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    setSelectedSubmission(submission);
                                                                    setIsGradingDialogOpen(true);
                                                                }}
                                                                className="bg-orange-600 hover:bg-orange-700"
                                                            >
                                                                تقييم
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Grading Dialog */}
            <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>تقييم المهمة</DialogTitle>
                        <DialogDescription>
                            قيّم عمل الطالب: {selectedSubmission?.user.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {selectedSubmission && (
                            <>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-semibold mb-2">محتوى التسليم:</h4>
                                    <p className="text-gray-700">{selectedSubmission.content}</p>
                                    {selectedSubmission.attachments && selectedSubmission.attachments.length > 0 && (
                                        <div className="mt-2">
                                            <h5 className="text-sm font-medium text-gray-600">المرفقات:</h5>
                                            <ul className="list-disc list-inside text-sm text-blue-600">
                                                {selectedSubmission.attachments.map((url, idx) => (
                                                    <li key={idx}>
                                                        <a href={url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                            مرفق {idx + 1}
                                                        </a>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="score">الدرجة (من 100)</Label>
                                    <Input
                                        id="score"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={gradingForm.score}
                                        onChange={(e) => setGradingForm({ ...gradingForm, score: e.target.value })}
                                        placeholder="95"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="feedback">الملاحظات</Label>
                                    <Textarea
                                        id="feedback"
                                        value={gradingForm.feedback}
                                        onChange={(e) => setGradingForm({ ...gradingForm, feedback: e.target.value })}
                                        placeholder="عمل ممتاز!"
                                        rows={3}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsGradingDialogOpen(false)}>
                            إلغاء
                        </Button>
                        <Button onClick={handleGradeSubmission} className="bg-green-600 hover:bg-green-700">
                            حفظ التقييم
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AssignmentsManager;
