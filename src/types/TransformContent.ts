import type {Request, Response} from 'express';

export type TransformContent = (
    req: Request,
    res: Response,
    params: {
        content: string;
        path?: string;
        name?: string;
    },
) => string | Promise<string>;
