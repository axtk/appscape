import type {ErrorRequestHandler} from 'express';

export type ErrorController<T = void> = (params: T) => ErrorRequestHandler;
