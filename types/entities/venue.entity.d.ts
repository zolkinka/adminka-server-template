import { Project } from './project.entity';
import { Event } from './event.entity';
import { EventSession } from './event-session.entity';
export declare class Venue {
    uuid: string;
    name: string;
    description?: string | null;
    address?: string | null;
    city?: string | null;
    country?: string | null;
    timezone?: string | null;
    capacity?: number | null;
    metadata?: Record<string, any> | null;
    projectUuid: string;
    project: Project;
    events: Event[];
    sessions: EventSession[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
