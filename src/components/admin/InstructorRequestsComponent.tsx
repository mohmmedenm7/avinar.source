import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Check, X, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const InstructorRequestsComponent = ({ token }: { token: string }) => {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/users/upgradeRequests`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRequests(res.data?.data || []);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleApprove = async (id: string) => {
        try {
            await axios.put(`${API_BASE_URL}/api/v1/users/approveUpgrade/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast({ title: "تم قبول الطلب بنجاح", className: "bg-green-500 text-white" });
            fetchRequests();
        } catch (error) {
            toast({ title: "حدث خطأ", variant: "destructive" });
        }
    };

    const handleReject = async (id: string) => {
        try {
            await axios.put(`${API_BASE_URL}/api/v1/users/rejectUpgrade/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast({ title: "تم رفض الطلب" });
            fetchRequests();
        } catch (error) {
            toast({ title: "حدث خطأ", variant: "destructive" });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">طلبات الترقية لمدرب</h2>
                <span className="text-sm text-gray-500">{requests.length} طلب</span>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            ) : requests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <User size={48} className="mx-auto mb-4 opacity-20" />
                    <p>لا توجد طلبات ترقية معلقة حالياً</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map((user) => (
                        <Card key={user._id}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-lg">{user.name}</h3>
                                    <p className="text-gray-500 text-sm">{user.email}</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="bg-green-600 hover:bg-green-700 text-white gap-2"
                                        onClick={() => handleApprove(user._id)}
                                    >
                                        <Check size={16} /> قبول
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="gap-2"
                                        onClick={() => handleReject(user._id)}
                                    >
                                        <X size={16} /> رفض
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
