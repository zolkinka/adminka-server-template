import { Project } from './project.entity';
import { EventSession } from './event-session.entity';
import { Ticket } from './ticket.entity';
export declare enum CheckinResult {
    SUCCESS = "SUCCESS",
    ALREADY_USED = "ALREADY_USED",
    INVALID = "INVALID",
    CANCELED = "CANCELED"
}
export declare class CheckinLog {
    uuid: string;
    projectUuid: string;
    sessionUuid: string;
    ticketUuid: string;
    result: CheckinResult;
    scannerId?: string | null;
    metadata?: Record<string, any> | null;
    project: Project;
    session: EventSession;
    ticket: Ticket;
    createdAt: Date;
}
