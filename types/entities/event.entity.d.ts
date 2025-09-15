import { Project } from './project.entity';
import { EventSession } from './event-session.entity';
import { Venue } from './venue.entity';
export declare enum EventStatus {
    DRAFT = "DRAFT",
    PUBLISHED = "PUBLISHED",
    ARCHIVED = "ARCHIVED"
}
export declare class Event {
    uuid: string;
    title: string;
    slug?: string | null;
    description?: string | null;
    status: EventStatus;
    category?: string | null;
    posterUrl?: string | null;
    ageRestriction?: number | null;
    metadata?: Record<string, any> | null;
    projectUuid: string;
    venueUuid?: string | null;
    project: Project;
    venue?: Venue | null;
    sessions: EventSession[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
