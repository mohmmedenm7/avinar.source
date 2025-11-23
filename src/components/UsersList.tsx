import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UsersList = ({ users }: { users: any[] }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-right">المستخدمون في النظام</CardTitle>
      </CardHeader>
      <CardContent className="text-right">
        {users.length === 0 ? (
          <p className="text-center text-gray-500">لا يوجد مستخدمون</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2">الاسم</th>
                  <th className="text-right p-2">البريد الإلكتروني</th>
                  <th className="text-right p-2">الدور</th>
                  <th className="text-right p-2">تاريخ الإنشاء</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-100">
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.role === "admin" ? "bg-red-100 text-red-800" :
                        user.role === "instructor" ? "bg-blue-100 text-blue-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {user.role === "admin" ? "مسؤول" : user.role === "instructor" ? "مدرب" : "طالب"}
                      </span>
                    </td>
                    <td className="p-2">{new Date(user.createdAt).toLocaleDateString('ar')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsersList;
