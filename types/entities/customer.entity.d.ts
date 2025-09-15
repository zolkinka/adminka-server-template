import { Project } from './project.entity';
import { Order } from './order.entity';
import { Ticket } from './ticket.entity';
import { Payment } from './payment.entity';
export declare class Customer {
    uuid: string;
    email: string;
    name?: string | null;
    phone?: string | null;
    metadata?: Record<string, any> | null;
    projectUuid: string;
    project: Project;
    orders: Order[];
    tickets: Ticket[];
    payments: Payment[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
