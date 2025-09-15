import { Project } from './project.entity';
import { User } from './user.entity';
export declare enum RoleType {
    ADMIN = "ADMIN",
    USER = "USER",
    CLIENT = "CLIENT"
}
export declare class Role {
    uuid: string;
    name: string;
    key: string;
    type: RoleType;
    description: string;
    permissions: string[];
    projectUuid: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
    project: Project;
    users: User[];
}
