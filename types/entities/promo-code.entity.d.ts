import { Project } from './project.entity';
import { EventSession } from './event-session.entity';
export declare enum DiscountType {
    PERCENT = "PERCENT",
    FIXED = "FIXED"
}
export declare class PromoCode {
    uuid: string;
    code: string;
    discountType: DiscountType;
    discountValue: string;
    startsAt?: Date | null;
    endsAt?: Date | null;
    maxRedemptions?: number | null;
    timesRedeemed: number;
    isActive: boolean;
    metadata?: Record<string, any> | null;
    projectUuid: string;
    project: Project;
    sessions: EventSession[];
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
}
