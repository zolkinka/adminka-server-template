import { Project } from './project.entity';
import { Customer } from './customer.entity';
import { EventSession } from './event-session.entity';
import { Ticket } from './ticket.entity';
import { Payment } from './payment.entity';
export declare enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELED = "CANCELED",
    REFUNDED = "REFUNDED"
}
export declare class Order {
    uuid: string;
    projectUuid: string;
    customerUuid: string;
    sessionUuid: string;
    subtotalAmount: string;
    discountAmount: string;
    totalAmount: string;
    currency: string;
    status: OrderStatus;
    promoCode?: string | null;
    metadata?: Record<string, any> | null;
    project: Project;
    customer: Customer;
    session: EventSession;
    tickets: Ticket[];
    payments: Payment[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
