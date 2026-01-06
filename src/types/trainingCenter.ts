export type UserRole =
    | 'user'
    | 'manager'
    | 'admin'
    | 'platform-manager'
    | 'training-center-manager'
    | 'facilitator'
    | 'instructor';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    profileImg?: string;
    phone?: string;
}

export interface TrainingCenter {
    _id: string;
    name: string;
    description?: string;
    manager: User; // Populated
    facilitator?: User; // Populated
    instructors?: User[]; // Populated
    address?: string;
    contactInfo?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTrainingCenterData {
    name: string;
    description?: string;
    manager: string; // User ID
    facilitator?: string; // User ID
    instructors?: string[]; // User IDs
    address?: string;
    contactInfo?: string;
    isActive?: boolean;
}

export interface UpdateTrainingCenterData {
    name?: string;
    description?: string;
    manager?: string;
    facilitator?: string;
    instructors?: string[];
    address?: string;
    contactInfo?: string;
    isActive?: boolean;
}
