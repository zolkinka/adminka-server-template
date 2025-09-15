import { Role } from './role.entity';
import { Project } from './project.entity';
export declare class User {
    uuid: string;
    email: string;
    name: string;
    password: string;
    isActive: boolean;
    lastLogin: Date | null;
    failedLoginAttempts: number;
    lockedUntil: Date | null;
    roleUuid: string | null;
    projectUuid: string;
    role: Role;
    project: Project;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
