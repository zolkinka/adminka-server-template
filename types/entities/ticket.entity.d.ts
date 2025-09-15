import { Project } from './project.entity';
import { Order } from './order.entity';
import { EventSession } from './event-session.entity';
import { TicketType } from './ticket-type.entity';
import { Customer } from './customer.entity';
import { CheckinLog } from './checkin-log.entity';
export declare enum TicketStatus {
    VALID = "VALID",
    USED = "USED",
    CANCELED = "CANCELED",
    REFUNDED = "REFUNDED"
}
export declare class Ticket {
    uuid: string;
    code: string;
    orderUuid: string;
    ticketTypeUuid: string;
    sessionUuid: string;
    customerUuid: string | null;
    projectUuid: string;
    status: TicketStatus;
    seatRow?: string | null;
    seatNumber?: string | null;
    metadata?: Record<string, any> | null;
    project: Project;
    order: Order;
    session: EventSession;
    ticketType: TicketType;
    customer: Customer;
    checkinLogs: CheckinLog[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
