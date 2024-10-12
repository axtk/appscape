import type {Request} from 'express';

export type LogOptions = {
    timestamp?: number;
    level?: 'debug' | 'info' | 'warn' | 'error';
    data?: unknown;
    req?: Request;
};
