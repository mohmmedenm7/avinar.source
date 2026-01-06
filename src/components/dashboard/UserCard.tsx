import React from 'react';
import { Mail, Phone, MapPin, MoreHorizontal, Heart, MessageCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from '@/config/env';

const getImageUrl = (path: string | undefined, type: 'users' | 'products' = 'products') => {
    if (!path) return undefined;
    if (path.startsWith('http')) {
        const lastIndex = path.lastIndexOf('http');
        return path.substring(lastIndex);
    }
    return `${API_BASE_URL}/${type}/${path}`;
};

interface UserCardProps {
    user: {
        _id: string;
        name: string;
        email: string;
        role?: string;
        profileImg?: string;
        phone?: string;
        title?: string;
    };
    onClick: (user: any) => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, onClick }) => {
    return (
        <div
            onClick={() => onClick(user)}
            className="group relative bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
        >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                </Button>
            </div>

            <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                    <Avatar className="h-24 w-24 border-4 border-white dark:border-gray-700 shadow-md">
                        <AvatarImage
                            src={getImageUrl(user.profileImg, 'users') || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name || 'User')}`}
                            crossOrigin="anonymous"
                        /><AvatarFallback>{(user.name || 'U').charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute bottom-0 right-0 h-6 w-6 bg-green-500 border-4 border-white dark:border-gray-800 rounded-full"></div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize mb-1">
                    {user.name || 'Unknown User'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 truncate max-w-[200px]">
                    {user.email}
                </p>

                <Badge variant="secondary" className="mb-6 capitalize bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100">
                    {user.role || 'Student'}
                </Badge>

                <div className="flex items-center gap-2 w-full">
                    <Button
                        variant="outline"
                        className="flex-1 rounded-xl text-xs font-semibold h-9 border-gray-200 hover:border-blue-200 hover:text-blue-600 dark:border-gray-700"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick(user);
                        }}
                    >
                        View Profile
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-gray-50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:bg-gray-700/50">
                        <MessageCircle className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UserCard;
