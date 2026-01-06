import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    MapPin,
    Star,
    Users,
    BookOpen,
    MessageCircle,
    Globe,
    Linkedin,
    Twitter,
    Facebook,
    Loader2,
    Calendar,
    Briefcase,

    Award,
    Link as LinkIcon
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ChatButton } from "@/components/chat";
import { useToast } from "@/components/ui/use-toast";

interface InstructorData {
    instructor: {
        _id: string;
        name: string;
        profileImg: string;
        bio?: string;
        specialties?: string[];
        experience?: string;
        socialLinks?: {
            website?: string;
            linkedin?: string;
            twitter?: string;
            facebook?: string;
        };
        memberSince: string;
    };
    stats: {
        totalCourses: number;
        totalStudents: number;
        totalReviews: number;
    };
    courses: {
        _id: string;
        title: string;
        description: string;
        imageCover: string;
        price: number;
        ratingsAverage: number;
        ratingsQuantity: number;
    }[];
}

const InstructorProfile = () => {
    const { instructorId } = useParams();
    const [data, setData] = useState<InstructorData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { t } = useTranslation();
    const { toast } = useToast();

    const handleShareProfile = () => {
        navigator.clipboard.writeText(window.location.href);
        toast({
            title: "Link Copied!",
            description: "Profile link has been copied to clipboard.",
            className: "bg-green-600 text-white",
        });
    };

    useEffect(() => {
        const fetchInstructor = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/api/v1/users/instructor/${instructorId}`);
                if (res.data?.data) {
                    setData(res.data.data);
                }
            } catch (err: any) {
                console.error("Error fetching instructor:", err);
                setError(err.response?.data?.message || "Failed to load instructor profile.");
            } finally {
                setLoading(false);
            }
        };

        if (instructorId) {
            fetchInstructor();
        }
    }, [instructorId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-xl text-red-500 font-semibold">{error || "Instructor not found"}</p>
                <Link to="/courses">
                    <Button variant="outline">Back to Courses</Button>
                </Link>
            </div>
        );
    }

    const { instructor, stats, courses } = data;

    return (
        <div className="min-h-screen bg-gray-50/50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* Back Button */}
                <div className="mb-8">
                    <Link to="/courses" className="text-sm text-gray-500 hover:text-orange-500 flex items-center gap-1 transition-colors">
                        &larr; {t('common.back', 'Back')}
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Profile Card */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="border-none shadow-lg rounded-[24px] overflow-hidden sticky top-28 bg-white">
                            <div className="h-32 bg-gradient-to-r from-blue-500/10 to-purple-500/10 relative"></div>
                            <div className="px-6 relative">
                                <Avatar className="w-32 h-32 border-4 border-white shadow-xl absolute -top-16">
                                    <AvatarImage
                                        src={instructor.profileImg?.startsWith('user-')
                                            ? `${API_BASE_URL}/users/${instructor.profileImg}`
                                            : instructor.profileImg}
                                        className="object-cover"
                                    />
                                    <AvatarFallback className="text-3xl bg-orange-100 text-orange-600">
                                        {instructor.name?.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                            </div>

                            <CardContent className="pt-20 px-6 pb-8 space-y-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{instructor.name}</h1>
                                    <p className="text-gray-500 font-medium">Instructor & Mentor</p>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                                        <MapPin size={16} />
                                        <span>Global / Online</span>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-3 gap-2 py-4 border-t border-b border-gray-100">
                                    <div className="text-center">
                                        <div className="font-bold text-gray-900">{stats.totalStudents}</div>
                                        <div className="text-xs text-gray-500">Students</div>
                                    </div>
                                    <div className="text-center border-l border-gray-100">
                                        <div className="font-bold text-gray-900">{stats.totalCourses}</div>
                                        <div className="text-xs text-gray-500">Courses</div>
                                    </div>
                                    <div className="text-center border-l border-gray-100">
                                        <div className="font-bold text-gray-900">{stats.totalReviews}</div>
                                        <div className="text-xs text-gray-500">Reviews</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <ChatButton
                                        instructorId={instructor._id}
                                        instructorName={instructor.name}
                                        courseId=""
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full h-12 shadow-lg shadow-blue-500/20 gap-2 font-bold"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            className="flex-1 rounded-full border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-colors"
                                            onClick={() => {
                                                // Placeholder for Follow Logic
                                                // This would require a backend endpoint for following users
                                                alert("Follow feature coming soon!");
                                            }}
                                        >
                                            Follow
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="flex-1 rounded-full border-gray-200 hover:border-blue-500 hover:text-blue-600 transition-colors gap-2"
                                            onClick={handleShareProfile}
                                        >
                                            <LinkIcon size={16} />
                                            Share
                                        </Button>
                                    </div>
                                </div>

                                {instructor.socialLinks && Object.values(instructor.socialLinks).some(Boolean) && (
                                    <div className="flex gap-4 justify-center pt-2">
                                        {instructor.socialLinks.website && (
                                            <a href={instructor.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                                                <Globe size={20} />
                                            </a>
                                        )}
                                        {instructor.socialLinks.linkedin && (
                                            <a href={instructor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-700 transition-colors">
                                                <Linkedin size={20} />
                                            </a>
                                        )}
                                        {instructor.socialLinks.twitter && (
                                            <a href={instructor.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-sky-500 transition-colors">
                                                <Twitter size={20} />
                                            </a>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Content */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* About Section */}
                        <div className="bg-white rounded-[24px] p-8 shadow-sm">
                            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Briefcase className="text-orange-500" size={20} />
                                About
                            </h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {instructor.bio || "This instructor hasn't added a bio yet."}
                            </p>

                            {instructor.specialties && instructor.specialties.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-gray-500">Specialties</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {instructor.specialties.map((spec, i) => (
                                            <Badge key={i} variant="secondary" className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                                                {spec}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Tabs: Courses & Reviews */}
                        <Tabs defaultValue="courses" className="w-full">
                            <TabsList className="bg-transparent border-b border-gray-200 w-full justify-start rounded-none h-auto p-0 mb-6 gap-8">
                                <TabsTrigger
                                    value="courses"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base font-medium text-gray-500 data-[state=active]:text-orange-600"
                                >
                                    Courses ({courses.length})
                                </TabsTrigger>
                                <TabsTrigger
                                    value="reviews"
                                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-orange-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 py-3 text-base font-medium text-gray-500 data-[state=active]:text-orange-600"
                                >
                                    Reviews ({stats.totalReviews})
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="courses" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {courses.map((course) => (
                                        <Card key={course._id} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group bg-white h-full flex flex-col">
                                            <div className="relative h-48 overflow-hidden">
                                                <img
                                                    src={course.imageCover?.startsWith('http') ? course.imageCover : `${API_BASE_URL}/products/${course.imageCover}`}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                                            </div>
                                            <CardContent className="p-5 flex-1 flex flex-col">
                                                <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                    {course.title}
                                                </h3>
                                                <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-grow">
                                                    {course.description}
                                                </p>

                                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                                                        <Star size={16} fill="currentColor" />
                                                        <span>{course.ratingsAverage?.toFixed(1) || '0.0'}</span>
                                                        <span className="text-gray-400 font-normal text-xs">({course.ratingsQuantity})</span>
                                                    </div>
                                                    <div className="font-bold text-lg text-blue-600">
                                                        ${course.price}
                                                    </div>
                                                </div>

                                                <Link to={`/course-details/${course._id}`} className="mt-4 block">
                                                    <Button variant="secondary" className="w-full bg-gray-50 hover:bg-gray-100 text-gray-900 rounded-full">
                                                        View Course
                                                    </Button>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>

                            <TabsContent value="reviews">
                                <div className="bg-white p-8 rounded-[24px] text-center text-gray-500">
                                    <p>Reviews will be displayed here.</p>
                                    {/* Future: Map through reviews if API provides them detailed */}
                                </div>
                            </TabsContent>
                        </Tabs>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorProfile;
