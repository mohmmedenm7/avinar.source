import { BookOpen, Users, TrendingUp, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface Course {
    _id: string;
    title: string;
    instructor?: {
        name: string;
    };
    studentsCount?: number;
    completionRate?: number;
    lastUpdated?: string;
    price?: number;
}

interface AllCoursesTableProps {
    courses: Course[];
    loading?: boolean;
}

const AllCoursesTable = ({ courses, loading = false }: AllCoursesTableProps) => {
    const navigate = useNavigate();
    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                <p>لا توجد كورسات متاحة</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-right">
                <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                    <tr>
                        <th className="px-6 py-3 rounded-r-lg">اسم الكورس</th>
                        <th className="px-6 py-3">المدرس</th>
                        <th className="px-6 py-3">عدد الطلاب</th>
                        <th className="px-6 py-3">معدل الإنجاز</th>
                        <th className="px-6 py-3">السعر</th>
                        <th className="px-6 py-3">آخر تحديث</th>
                        <th className="px-6 py-3 rounded-l-lg text-center">معاينة</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {courses.map((course) => (
                        <tr key={course._id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{course.title}</td>
                            <td className="px-6 py-4 text-gray-600">
                                {course.instructor?.name || 'غير محدد'}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Users size={16} />
                                    <span>{course.studentsCount || 0}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                    <TrendingUp size={16} className="text-green-600" />
                                    <span className="text-gray-700">{course.completionRate || 0}%</span>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <Badge className="bg-emerald-600">
                                    ${course.price || 0}
                                </Badge>
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-sm">
                                {course.lastUpdated
                                    ? new Date(course.lastUpdated).toLocaleDateString('ar-EG', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric'
                                    })
                                    : 'غير متاح'
                                }
                            </td>
                            <td className="px-6 py-4 text-center">
                                <button
                                    onClick={() => navigate(`/course/${course._id}`)}
                                    className="p-2 hover:bg-blue-50 text-blue-600 rounded-full transition-colors"
                                    title="معاينة الكورس"
                                >
                                    <Eye size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AllCoursesTable;
