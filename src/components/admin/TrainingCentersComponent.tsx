import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { trainingCenterService } from "@/services/trainingCenterService";
import { TrainingCenter, CreateTrainingCenterData } from "@/types/trainingCenter";
import { User } from "@/types/trainingCenter"; // Define User locally or import
import axios from "axios";
import { API_BASE_URL } from "@/config/env";
import { Loader2, Plus, Pencil, Trash2, MapPin, Phone, User as UserIcon, Users as UsersIcon } from "lucide-react";

interface Props {
    token: string | null;
}

export const TrainingCentersComponent = ({ token }: Props) => {
    const [centers, setCenters] = useState<TrainingCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const { toast } = useToast();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCenter, setCurrentCenter] = useState<Partial<CreateTrainingCenterData> & { _id?: string }>({});
    const [isLoadingSubmit, setIsLoadingSubmit] = useState(false);

    const fetchCenters = async () => {
        try {
            const data = await trainingCenterService.getAllTrainingCenters();
            setCenters(data);
        } catch (error) {
            console.error(error);
            toast({ title: "Failed to load training centers", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        if (!token) return;
        try {
            const res = await axios.get(`${API_BASE_URL}/api/v1/users?limit=1000`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(res.data?.data || []);
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchCenters();
        fetchUsers();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoadingSubmit(true);

        try {
            if (isEditing && currentCenter._id) {
                await trainingCenterService.updateTrainingCenter(currentCenter._id, currentCenter);
                toast({ title: "Updated successfully" });
            } else {
                await trainingCenterService.createTrainingCenter(currentCenter as CreateTrainingCenterData);
                toast({ title: "Created successfully" });
            }
            setIsModalOpen(false);
            fetchCenters();
            setCurrentCenter({});
        } catch (error: any) {
            toast({
                title: error.response?.data?.message || "Operation failed",
                variant: "destructive"
            });
        } finally {
            setIsLoadingSubmit(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this center?")) return;
        try {
            await trainingCenterService.deleteTrainingCenter(id);
            toast({ title: "Deleted successfully" });
            fetchCenters();
        } catch (error) {
            toast({ title: "Failed to delete", variant: "destructive" });
        }
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setCurrentCenter({ isActive: true });
        setIsModalOpen(true);
    };

    const openEditModal = (center: TrainingCenter) => {
        setIsEditing(true);
        setCurrentCenter({
            _id: center._id,
            name: center.name,
            description: center.description,
            manager: center.manager?._id,
            facilitator: center.facilitator?._id,
            instructors: center.instructors?.map(i => i._id) || [],
            address: center.address,
            contactInfo: center.contactInfo,
            isActive: center.isActive
        });
        setIsModalOpen(true);
    };

    // Filter users for roles
    const managers = users.filter(u => ['manager', 'platform-manager', 'training-center-manager', 'admin'].includes(u.role));
    const facilitators = users.filter(u => ['facilitator', 'manager', 'admin'].includes(u.role));
    const instructors = users.filter(u => ['instructor', 'manager', 'admin'].includes(u.role));

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Training Centers</h2>
                <Button onClick={openCreateModal} className="bg-orange-500 hover:bg-orange-600">
                    <Plus className="mr-2 h-4 w-4" /> Add Center
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {centers.map(center => (
                    <Card key={center._id} className="p-6 relative hover:shadow-lg transition-all rounded-xl border-t-4 border-t-orange-500 overflow-hidden group">
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500 bg-blue-50 hover:bg-blue-100" onClick={() => openEditModal(center)}>
                                <Pencil size={14} />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 bg-red-50 hover:bg-red-100" onClick={() => handleDelete(center._id)}>
                                <Trash2 size={14} />
                            </Button>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-xl font-bold text-gray-900 mb-1">{center.name}</h3>
                            <p className={`text-xs px-2 py-0.5 rounded-full w-fit ${center.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {center.isActive ? 'Active' : 'Inactive'}
                            </p>
                        </div>

                        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{center.description || "No description provided."}</p>

                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                    <UserIcon size={16} />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs">Manager</p>
                                    <p className="font-medium">{center.manager?.name || "N/A"}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <UsersIcon size={16} />
                                </div>
                                <div>
                                    <p className="text-gray-400 text-xs">Facilitator</p>
                                    <p className="font-medium">{center.facilitator?.name || "N/A"}</p>
                                </div>
                            </div>

                            {center.address && (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                                        <MapPin size={16} />
                                    </div>
                                    <p className="text-gray-600">{center.address}</p>
                                </div>
                            )}

                            {center.contactInfo && (
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 rounded-lg text-gray-600">
                                        <Phone size={16} />
                                    </div>
                                    <p className="text-gray-600">{center.contactInfo}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}
            </div>

            {centers.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed rounded-xl">
                    <p className="text-gray-500">No training centers found. Create one to get started.</p>
                </div>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Edit Training Center" : "New Training Center"}</DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Center Name</Label>
                            <Input
                                required
                                value={currentCenter.name || ''}
                                onChange={e => setCurrentCenter({ ...currentCenter, name: e.target.value })}
                                placeholder="e.g. AVinar Academy Cairo"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={currentCenter.description || ''}
                                onChange={e => setCurrentCenter({ ...currentCenter, description: e.target.value })}
                                placeholder="Brief description..."
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Manager (Modir)</Label>
                                <Select
                                    value={currentCenter.manager}
                                    onValueChange={val => setCurrentCenter({ ...currentCenter, manager: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Manager" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {managers.map(u => (
                                            <SelectItem key={u._id} value={u._id}>{u.name} ({u.role})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Facilitator (Moyasser)</Label>
                                <Select
                                    value={currentCenter.facilitator}
                                    onValueChange={val => setCurrentCenter({ ...currentCenter, facilitator: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Facilitator" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {facilitators.map(u => (
                                            <SelectItem key={u._id} value={u._id}>{u.name} ({u.role})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Input
                                    value={currentCenter.address || ''}
                                    onChange={e => setCurrentCenter({ ...currentCenter, address: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Contact Info</Label>
                                <Input
                                    value={currentCenter.contactInfo || ''}
                                    onChange={e => setCurrentCenter({ ...currentCenter, contactInfo: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is-active"
                                checked={currentCenter.isActive}
                                onCheckedChange={checked => setCurrentCenter({ ...currentCenter, isActive: checked })}
                            />
                            <Label htmlFor="is-active">Active Status</Label>
                        </div>

                        <div className="pt-4 flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isLoadingSubmit}>
                                {isLoadingSubmit && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isEditing ? "Save Changes" : "Create Center"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};
