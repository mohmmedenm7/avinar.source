import React, { useState, useRef } from 'react';
import { Camera, User, Mail, Phone, Save, Lock, Loader2, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from 'axios';
import { API_BASE_URL } from '@/config/env';
import { useToast } from "@/components/ui/use-toast";

interface ProfileSettingsProps {
    user: any;
    token: string;
    onUpdate?: (updatedUser: any) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, token, onUpdate }) => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
    });

    // Password state
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        password: '',
        passwordConfirm: ''
    });

    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            formDataToSend.append('phone', formData.phone);
            if (selectedFile) {
                formDataToSend.append('profileImg', selectedFile);
            }

            const res = await axios.put(`${API_BASE_URL}/api/v1/users/updateMe`, formDataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (res.data?.data) {
                toast({
                    title: "Profile updated successfully!",
                    className: "bg-green-500 text-white"
                });
                onUpdate?.(res.data.data);
            }
        } catch (error: any) {
            console.error("Update error:", error);
            toast({
                title: error.response?.data?.message || "Failed to update profile",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (passwordData.password !== passwordData.passwordConfirm) {
            toast({
                title: "Passwords do not match",
                variant: "destructive"
            });
            setLoading(false);
            return;
        }

        try {
            const res = await axios.put(`${API_BASE_URL}/api/v1/users/updateMyPassword`, {
                currentPassword: passwordData.currentPassword,
                password: passwordData.password,
                passwordConfirm: passwordData.passwordConfirm
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.data?.token) {
                toast({
                    title: "Password updated successfully!",
                    className: "bg-green-500 text-white"
                });
                // Optionally update token in local storage if returned
                localStorage.setItem('token', res.data.token);
                setPasswordData({ currentPassword: '', password: '', passwordConfirm: '' });
            }
        } catch (error: any) {
            console.error("Password update error:", error);
            toast({
                title: error.response?.data?.message || "Failed to update password",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 md:p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Account Settings</h2>

            <Tabs defaultValue="profile" className="w-full">
                <TabsList className="mb-8 w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                    <TabsTrigger
                        value="profile"
                        className="rounded-t-lg px-6 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none relative top-[1px]"
                    >
                        <User className="w-4 h-4 mr-2" />
                        Profile Settings
                    </TabsTrigger>
                    <TabsTrigger
                        value="password"
                        className="rounded-t-lg px-6 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:shadow-none relative top-[1px]"
                    >
                        <Lock className="w-4 h-4 mr-2" />
                        Password
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="mt-0">
                    <Card className="border-none shadow-sm bg-white dark:bg-gray-800">
                        <CardHeader>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your photo and personal details here.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitProfile} className="space-y-8">
                                {/* Values Section */}
                                <div className="flex flex-col md:flex-row gap-8 items-start">
                                    {/* Avatar Upload */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative group cursor-pointer" onClick={handleFileClick}>
                                            <Avatar className="w-32 h-32 border-4 border-gray-100 dark:border-gray-700 shadow-xl transition-transform group-hover:scale-105">
                                                <AvatarImage src={imagePreview || (
                                                    user.profileImg?.startsWith('user-')
                                                        ? `${API_BASE_URL}/users/${user.profileImg}`
                                                        : user.profileImg
                                                )} className="object-cover" />
                                                <AvatarFallback className="text-4xl bg-blue-100 text-blue-600">
                                                    {user.name?.charAt(0)?.toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-110 border-4 border-white dark:border-gray-800">
                                                <Camera size={18} />
                                            </div>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                className="hidden"
                                                accept="image/*"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" size="sm" onClick={handleFileClick}>
                                                <Upload size={14} className="mr-2" /> Upload New
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Fields */}
                                    <div className="flex-1 space-y-4 w-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="name"
                                                        name="name"
                                                        value={formData.name}
                                                        onChange={handleInputChange}
                                                        className="pl-10"
                                                        placeholder="Your full name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="phone">Phone Number</Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                    <Input
                                                        id="phone"
                                                        name="phone"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        className="pl-10"
                                                        placeholder="+1 234 567 890"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Address</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    className="pl-10"
                                                    type="email"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 border-t">
                                    <Button type="submit" disabled={loading} className="min-w-[140px]">
                                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="password">
                    <Card className="border-none shadow-sm bg-white dark:bg-gray-800">
                        <CardHeader>
                            <CardTitle>Security</CardTitle>
                            <CardDescription>Change your password to keep your account secure.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmitPassword} className="space-y-4 max-w-lg">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        name="currentPassword"
                                        type="password"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        name="password"
                                        type="password"
                                        value={passwordData.password}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        name="passwordConfirm"
                                        type="password"
                                        value={passwordData.passwordConfirm}
                                        onChange={handlePasswordChange}
                                        required
                                    />
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button type="submit" disabled={loading} className="min-w-[140px]">
                                        {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...</> : 'Update Password'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ProfileSettings;
