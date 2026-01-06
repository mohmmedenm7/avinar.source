import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, MapPin, Award, BookOpen, Clock, Shield, Star, FileText, Trash2, MessageCircle, DollarSign, AlertTriangle, CheckCircle, XCircle, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { API_BASE_URL } from '@/config/env';

interface UserProfileDetailProps {
    user: any;
    currentUserRole: 'admin' | 'instructor' | 'user';
    onBack: () => void;
    onChat?: (userId: string) => void;
    onDelete?: (userId: string) => void;
}

const UserProfileDetail: React.FC<UserProfileDetailProps> = ({ user, currentUserRole, onBack, onChat, onDelete }) => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("overview");

    // Helper to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);
    };

    const isInstructor = user.role === 'instructor' || user.role === 'manager' || user.role === 'Instructor';
    const isStudent = user.role === 'user' || user.role === 'student';

    console.log("UserProfileDetail Debug:", { role: user.role, isInstructor, courses: user.courses, myCourses: user.myCourses });

    return (
        <div className="flex flex-col h-full bg-[#fafafa] dark:bg-gray-900 overflow-y-auto rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* 1. Header Section */}
            <div className="bg-white dark:bg-gray-800 p-6 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                            {isInstructor ? 'Instructor Profile' : 'Student Profile'}
                        </h2>
                    </div>

                    {/* Admin Only Actions */}
                    {currentUserRole === 'admin' && (
                        <div className="flex gap-2">
                            <Button
                                variant="destructive"
                                size="sm"
                                className="rounded-xl gap-2 bg-red-50 text-red-600 hover:bg-red-100 border-none shadow-none"
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
                                        onDelete?.(user._id);
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4" /> Delete Account
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    <div className="relative group">
                        <Avatar className="h-28 w-28 border-4 border-white dark:border-gray-700 shadow-xl rounded-3xl">
                            <AvatarImage
                                src={user.profileImg ? `${API_BASE_URL}/users/${user.profileImg}` : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`}
                                crossOrigin="anonymous"
                            /><AvatarFallback className="text-3xl rounded-3xl">{(user.name || 'U').charAt(0)}</AvatarFallback>
                        </Avatar >
                        <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-bold text-white rounded-full shadow-md ${user.active === false ? 'bg-red-500' : 'bg-green-500'}`}>
                            {user.active === false ? 'Suspended' : 'Active'}
                        </div>
                    </div >

                    <div className="flex-1 text-center md:text-start space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white capitalize">{user.name || 'Unknown User'}</h1>
                            {user.avgRating && (
                                <div className="flex items-center gap-1 bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded-lg text-xs font-bold w-fit mx-auto md:mx-0">
                                    <Star className="h-3 w-3 fill-current" /> {user.avgRating.toFixed(2)}
                                </div>
                            )}
                        </div>

                        {/* Contact Info - Hidden for Instructor viewing Student (mostly) */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-500 text-sm">
                            {(currentUserRole === 'admin' || isInstructor) && (
                                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-gray-400" /> {user.email}</span>
                            )}
                            {user.phone && (currentUserRole === 'admin' || isInstructor) && (
                                <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-gray-400" /> {user.phone}</span>
                            )}
                            <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-gray-400" /> Joined {formatDate(user.createdAt)}</span>
                        </div>

                        <div className="flex gap-3 mt-4 justify-center md:justify-start">
                            <Button
                                onClick={() => onChat?.(user._id)}
                                className="rounded-xl bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg shadow-blue-500/20"
                            >
                                <MessageCircle className="h-4 w-4" /> Send Message
                            </Button>

                            {currentUserRole === 'admin' && isInstructor && (
                                <Button variant="outline" className="rounded-xl gap-2">
                                    <Shield className="h-4 w-4" /> Admin Actions
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Quick Stat Cards (Glanceable) */}
                    <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl min-w-[100px] text-center border border-gray-100 dark:border-gray-600">
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {isInstructor ? (user.myCourses?.length || 0) : (user.courses?.length || 0)}
                            </p>
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                {isInstructor ? 'Courses' : 'Enrolled'}
                            </p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl min-w-[100px] text-center border border-gray-100 dark:border-gray-600">
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {isInstructor ? (user.studentsCount || 0) : '0'}
                            </p>
                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                                {isInstructor ? 'Students' : 'Completed'}
                            </p>
                        </div>
                    </div>
                </div >
            </div >

            {/* 2. Content Tabs */}
            < div className="p-6" >
                <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab}>
                    <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-xl border border-gray-100 dark:border-gray-700 mb-6 w-full md:w-auto flex overflow-x-auto">
                        <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">Overview</TabsTrigger>
                        <TabsTrigger value="courses" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">Courses</TabsTrigger>

                        {/* Only Admin sees Financials/Payments */}
                        {currentUserRole === 'admin' && (
                            <TabsTrigger value="financials" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">
                                {isInstructor ? 'Financials' : 'Payments'}
                            </TabsTrigger>
                        )}

                        {isInstructor && (
                            <TabsTrigger value="students" className="rounded-lg data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">Students</TabsTrigger>
                        )}
                    </TabsList>

                    {/* --- OVERVIEW TAB --- */}
                    <TabsContent value="overview" className="space-y-6 animate-in slide-in-from-left-4 duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Bio / About */}
                            <Card className="p-6 border-none shadow-sm rounded-3xl">
                                <h3 className="text-lg font-bold mb-4">About</h3>
                                <p className="text-gray-500 leading-relaxed text-sm">
                                    {user.bio || 'No biography available for this user yet.'}
                                </p>
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {['English', 'Arabic'].map(lang => (
                                        <Badge key={lang} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">
                                            {lang}
                                        </Badge>
                                    ))}
                                </div>
                            </Card>

                            {/* Performance Grid (Instructor) or Activity (Student) */}
                            <Card className="p-6 border-none shadow-sm rounded-3xl">
                                <h3 className="text-lg font-bold mb-4">Performance Snapshot</h3>
                                <div className="space-y-4">
                                    {isInstructor ? (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Total Revenue</span>
                                                <span className="font-bold text-gray-900">{formatCurrency(user.totalRevenue || 0)}</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Course Rating</span>
                                                <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                                                    <Star size={14} fill="currentColor" /> {user.avgRating?.toFixed(2) || 'N/A'}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Completion Rate</span>
                                                <span className="font-bold text-gray-900">0%</span>
                                            </div>
                                            <Separator />
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Certificates Earned</span>
                                                <div className="flex items-center gap-1 text-indigo-500 font-bold text-sm">
                                                    <Award size={14} /> 0
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* --- COURSES TAB --- */}
                    <TabsContent value="courses" className="animate-in slide-in-from-right-4 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(isInstructor ? (user.myCourses || []) : (user.courses || [])).map((course: any, idx: number) => (
                                <div key={course._id || idx} onClick={() => course._id && navigate(`/course/${course._id}`)} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 hover:shadow-lg transition-all group cursor-pointer relative overflow-hidden">
                                    <div className="flex gap-4">
                                        <div className="h-16 w-16 bg-gray-100 rounded-xl shrink-0 overflow-hidden">
                                            {course.imageCover ? (
                                                <img src={course.imageCover} className="w-full h-full object-cover" alt="course" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-300"><BookOpen size={24} /></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 dark:text-white truncate mb-1">{course.title || 'Untitled Course'}</h4>
                                            {currentUserRole === 'admin' && (
                                                <Badge variant="outline" className={`text-[10px] px-2 py-0 ${(course.progress === 100) ? 'bg-green-50 text-green-600 border-green-200' :
                                                    'bg-blue-50 text-blue-600 border-blue-200'
                                                    }`}>
                                                    {isInstructor ? 'Published' : (course.progress === 100 ? 'Completed' : 'Active')}
                                                </Badge>
                                            )}
                                            <div className="mt-2 text-xs text-gray-400 flex items-center gap-2">
                                                <Clock size={12} /> {formatDate(course.createdAt || new Date())}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Progress Bar for Students */}
                                    {!isInstructor && (
                                        <div className="mt-4">
                                            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                                <span>Progress</span>
                                                <span>{course.progress || 0}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${course.progress || 0}%` }}></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {(isInstructor ? (user.myCourses || []) : (user.courses || [])).length === 0 && (
                                <div className="col-span-full py-12 text-center bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                    <BookOpen className="mx-auto text-gray-300 mb-2" />
                                    <p className="text-gray-500">No courses found.</p>
                                </div>
                            )}
                        </div>
                    </TabsContent>

                    {/* --- FINANCIALS TAB (ADMIN ONLY) --- */}
                    {currentUserRole === 'admin' && (
                        <TabsContent value="financials" className="animate-in slide-in-from-right-4 duration-300">
                            <Card className="p-0 border-none shadow-sm rounded-3xl overflow-hidden bg-white">
                                <div className="p-6 border-b border-gray-100">
                                    <h3 className="font-bold text-lg">
                                        {isInstructor ? 'Withdrawal History' : 'Payment History'}
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
                                            <tr>
                                                <th className="px-6 py-4">ID</th>
                                                <th className="px-6 py-4">Date</th>
                                                <th className="px-6 py-4">Amount</th>
                                                <th className="px-6 py-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {/* Mock Data - In real implementation, pass history prop */}
                                            <tr>
                                                <td className="px-6 py-4 font-mono text-gray-500">#TRX-8821</td>
                                                <td className="px-6 py-4 text-gray-600">Jan 12, 2024</td>
                                                <td className="px-6 py-4 font-bold text-gray-900">$120.00</td>
                                                <td className="px-6 py-4"><Badge className="bg-green-100 text-green-700 hover:bg-green-100">Completed</Badge></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    <div className="p-8 text-center text-gray-400 text-xs italic">
                                        Showing latest transactions.
                                    </div>
                                </div>
                            </Card>
                        </TabsContent>
                    )}
                </Tabs>
            </div >
        </div >
    );
};

export default UserProfileDetail;
