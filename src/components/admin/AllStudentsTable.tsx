import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Student {
    _id: string;
    name: string;
    email: string;
    coursesCount?: number;
    lastActive?: string;
    level?: number;
}

interface AllStudentsTableProps {
    students: Student[];
    loading?: boolean;
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
}

const AllStudentsTable = ({
    students,
    loading = false,
    currentPage = 1,
    totalPages = 1,
    onPageChange
}: AllStudentsTableProps) => {
    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (students.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <Users size={48} className="mx-auto mb-4 opacity-20" />
                <p>لا يوجد طلاب مسجلين</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="overflow-x-auto">
                <table className="w-full text-right">
                    <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-3 rounded-r-lg">الاسم</th>
                            <th className="px-6 py-3">البريد الإلكتروني</th>
                            <th className="px-6 py-3">عدد الكورسات</th>
                            <th className="px-6 py-3">المستوى</th>
                            <th className="px-6 py-3 rounded-l-lg">آخر نشاط</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {students.map((student) => (
                            <tr key={student._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900">{student.name}</td>
                                <td className="px-6 py-4 text-gray-600">{student.email}</td>
                                <td className="px-6 py-4">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                        {student.coursesCount || 0} كورس
                                    </Badge>
                                </td>
                                <td className="px-6 py-4">
                                    <Badge className="bg-purple-600">
                                        المستوى {student.level || 1}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-gray-500 text-sm">
                                    {student.lastActive
                                        ? new Date(student.lastActive).toLocaleDateString('ar-EG', {
                                            month: 'short',
                                            day: 'numeric'
                                        })
                                        : 'غير متاح'
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange?.(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        السابق
                    </Button>
                    <span className="text-sm text-gray-600">
                        صفحة {currentPage} من {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPageChange?.(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        التالي
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AllStudentsTable;
