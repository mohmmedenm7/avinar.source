import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Props {
  users: User[];
  token: string | null;
  fetchUsers: () => void;
  searchQuery: string;
}

export const UsersComponent = ({
  users,
  token,
  fetchUsers,
  searchQuery,
}: Props) => {
  const { toast } = useToast();

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("هل تريد حذف هذا المستخدم؟")) return;

    try {
      await axios.delete(`http://localhost:8000/api/v1/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: "✓ تم حذف المستخدم" });
      fetchUsers();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "فشل حذف المستخدم";
      toast({ title: errMsg, variant: "destructive" });
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">👤 لا توجد مستخدمين</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user, idx) => (
        <Card
          key={user._id}
          className="p-5 border border-gray-200 hover:shadow-md transition-all"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Index */}
            <div>
              <p className="text-xs text-gray-600 font-medium mb-1">#</p>
              <p className="text-sm font-semibold text-gray-900">{idx + 1}</p>
            </div>

            {/* User Name */}
            <div>
              <p className="text-xs text-gray-600 font-medium mb-1">الاسم</p>
              <p className="text-sm font-semibold text-gray-900">{user.name}</p>
            </div>

            {/* User Email */}
            <div>
              <p className="text-xs text-gray-600 font-medium mb-1">البريد الإلكتروني</p>
              <p className="text-sm text-gray-700 truncate">{user.email}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end">
              <Button
                className="bg-red-600 hover:bg-red-700 text-white text-xs h-9 px-4"
                onClick={() => handleDeleteUser(user._id)}
              >
                حذف
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};