import { Project } from './project.entity';
import { Event } from './event.entity';
import { Venue } from './venue.entity';
import { Ticket } from './ticket.entity';
import { TicketType } from './ticket-type.entity';
import { Order } from './order.entity';
import { CheckinLog } from './checkin-log.entity';
import { PromoCode } from './promo-code.entity';
export declare enum SessionStatus {
    SCHEDULED = "SCHEDULED",
    CANCELED = "CANCELED",
    COMPLETED = "COMPLETED"
}
export declare class EventSession {
    uuid: string;
    eventUuid: string;
    venueUuid?: string | null;
    projectUuid: string;
    startsAt: Date;
    endsAt: Date;
    timezone?: string | null;
    capacity?: number | null;
    sold: number;
    status: SessionStatus;
    metadata?: Record<string, any> | null;
    project: Project;
    event: Event;
    venue?: Venue | null;
    tickets: Ticket[];
    ticketTypes: TicketType[];
    orders: Order[];
    checkinLogs: CheckinLog[];
    promoCodes: PromoCode[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
