import type {Request, Response} from 'express';
import type {LogLevel} from './LogLevel';

export type LogEventPayload = {
    timestamp?: number;
    level?: LogLevel;
    message?: string | Error;
    status?: number;
    req?: Request;
    res?: Response;
    data?: unknown;
};
