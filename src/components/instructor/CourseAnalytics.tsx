import { useEffect, useState } from "react";
import { BarChart, Users, Brain, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { API_BASE_URL } from '@/config/env';
import axios from "axios";

interface CourseAnalyticsProps {
    courseId: string;
    token: string;
}

const CourseAnalytics = ({ courseId, token }: CourseAnalyticsProps) => {
    const [analytics, setAnalytics] = useState<any>(null);
    const [aiAnalytics, setAiAnalytics] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [analyticsRes, aiRes, studentsRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/v1/instructor/courses/${courseId}/analytics`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_BASE_URL}/api/v1/instructor/courses/${courseId}/ai-analytics`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get(`${API_BASE_URL}/api/v1/instructor/courses/${courseId}/students`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                setAnalytics(analyticsRes.data?.data || analyticsRes.data);
                setAiAnalytics(aiRes.data?.data || aiRes.data);
                setStudents(studentsRes.data?.data || studentsRes.data || []);
            } catch (error) {
                console.error("Error fetching course analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        if (courseId && token) {
            fetchData();
        }
    }, [courseId, token]);

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 mt-4 border-t pt-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <BarChart size={20} />
                تحليلات الكورس
            </h3>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">إجمالي الطلاب</p>
                            <p className="text-2xl font-bold text-blue-900">{analytics?.totalStudents || 0}</p>
                        </div>
                        <Users className="text-blue-400" size={24} />
                    </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-100">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">معدل الإكمال</p>
                            <p className="text-2xl font-bold text-purple-900">{analytics?.completionRate || 0}%</p>
                        </div>
                        <TrendingUp className="text-purple-400" size={24} />
                    </CardContent>
                </Card>

                <Card className="bg-emerald-50 border-emerald-100">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-emerald-600 font-medium">تحليل AI</p>
                            <p className="text-sm font-bold text-emerald-900 mt-1">
                                {aiAnalytics?.sentiment || "إيجابي جداً"}
                            </p>
                        </div>
                        <Brain className="text-emerald-400" size={24} />
                    </CardContent>
                </Card>
            </div>

            {/* AI Insights */}
            {aiAnalytics?.insights && (
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center gap-2">
                            <Brain size={16} className="text-purple-500" />
                            رؤى الذكاء الاصطناعي
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-gray-600">
                            {aiAnalytics.insights.map((insight: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                                    {insight}
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Students List */}
            <div>
                <h4 className="font-semibold text-gray-700 mb-3">أحدث الطلاب المسجلين</h4>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-4 py-2">الاسم</th>
                                <th className="px-4 py-2">التقدم</th>
                                <th className="px-4 py-2">تاريخ التسجيل</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.slice(0, 5).map((student: any) => (
                                <tr key={student._id}>
                                    <td className="px-4 py-2 font-medium">{student.name}</td>
                                    <td className="px-4 py-2 text-blue-600">{student.progress || 0}%</td>
                                    <td className="px-4 py-2 text-gray-500">
                                        {new Date(student.joinedAt).toLocaleDateString('ar-EG')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CourseAnalytics;
