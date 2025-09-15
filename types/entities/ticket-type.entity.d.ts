import { Project } from './project.entity';
import { EventSession } from './event-session.entity';
import { Ticket } from './ticket.entity';
export declare class TicketType {
    uuid: string;
    name: string;
    description?: string | null;
    price: string;
    currency: string;
    quota?: number | null;
    sold: number;
    isActive: boolean;
    sessionUuid: string;
    projectUuid: string;
    project: Project;
    session: EventSession;
    tickets: Ticket[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
