import type {RequestHandler} from 'express';

/**
 * Defines an intermediate request handler performing manipulations
 * with request data without sending a response
 */
export type Middleware<T = void> = (params: T) => RequestHandler;
