import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Loader2, Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Instructor {
    _id: string;
    name: string;
    profileImg: string;
    role: string;
    instructorProfile?: {
        bio?: string;
        specialties?: string[];
        experience?: string;
    };
}

const InstructorsPage = () => {
    const { t } = useTranslation();
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [error, setError] = useState('');

    const fetchInstructors = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/users/instructors`);
            if (res.data?.data) {
                setInstructors(res.data.data);
            }
        } catch (err) {
            console.error("Error fetching instructors:", err);
            setError('Failed to load instructors. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInstructors();
    }, []);

    const filteredInstructors = instructors.filter(instructor =>
        instructor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        instructor.instructorProfile?.specialties?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50/50 text-center px-4">
                <Users className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Unavailable</h3>
                <p className="text-gray-500 mb-6 max-w-md">{error}</p>
                <Button onClick={fetchInstructors} className="bg-blue-600 hover:bg-blue-700 text-white rounded-full">
                    Try Again
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pt-24 pb-12">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                        {t('instructors.title') || 'Our World-Class Instructors'}
                    </h1>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        {t('instructors.subtitle') || 'Learn from the best professionals in the industry. Discover mentors who will guide you to success.'}
                    </p>
                </div>

                {/* Search */}
                <div className="max-w-xl mx-auto mb-16 relative">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        <Input
                            type="text"
                            placeholder={t('instructors.search') || 'Search instructors by name or specialty...'}
                            className="pl-12 py-6 rounded-full shadow-lg border-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Grid */}
                {filteredInstructors.length === 0 ? (
                    <div className="text-center py-12">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">No instructors found matching your search.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredInstructors.map((instructor) => (
                            <Link to={`/instructor/${instructor._id}`} key={instructor._id} className="group">
                                <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 h-full overflow-hidden bg-white group-hover:-translate-y-1">
                                    <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>
                                    <CardContent className="pt-0 relative px-6 pb-6 flex flex-col items-center text-center">
                                        <div className="relative -mt-12 mb-4">
                                            <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                                                <AvatarImage
                                                    src={instructor.profileImg?.startsWith('user-')
                                                        ? `${API_BASE_URL}/users/${instructor.profileImg}`
                                                        : instructor.profileImg}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">
                                                    {instructor.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                            {instructor.name}
                                        </h3>
                                        <p className="text-sm text-blue-600 font-medium mb-3 uppercase tracking-wide">
                                            {instructor.role === 'admin' ? 'Top Instructor' : 'Instructor'}
                                        </p>

                                        {instructor.instructorProfile?.bio && (
                                            <p className="text-gray-500 text-sm mb-4 line-clamp-2 px-2">
                                                {instructor.instructorProfile.bio}
                                            </p>
                                        )}

                                        {instructor.instructorProfile?.specialties && instructor.instructorProfile.specialties.length > 0 && (
                                            <div className="flex flex-wrap gap-2 justify-center mt-auto">
                                                {instructor.instructorProfile.specialties.slice(0, 3).map((spec, index) => (
                                                    <Badge key={index} variant="secondary" className="bg-gray-50 text-gray-600 hover:bg-gray-100">
                                                        {spec}
                                                    </Badge>
                                                ))}
                                                {instructor.instructorProfile.specialties.length > 3 && (
                                                    <Badge variant="secondary" className="bg-gray-50 text-gray-600">
                                                        +{instructor.instructorProfile.specialties.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}

                                        <Button variant="ghost" className="mt-6 w-full text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-semibold group-hover:underline">
                                            View Profile
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InstructorsPage;
