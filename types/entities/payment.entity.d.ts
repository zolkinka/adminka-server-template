import { Project } from './project.entity';
import { Order } from './order.entity';
import { Customer } from './customer.entity';
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PAID = "PAID",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
export declare class Payment {
    uuid: string;
    projectUuid: string;
    orderUuid: string;
    customerUuid: string;
    amount: string;
    currency: string;
    status: PaymentStatus;
    provider?: string | null;
    providerPaymentId?: string | null;
    paidAt?: Date | null;
    refundedAt?: Date | null;
    metadata?: Record<string, any> | null;
    project: Project;
    order: Order;
    customer: Customer;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
