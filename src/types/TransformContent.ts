import type {Request, Response} from 'express';

export type TransformContent = (
    req: Request,
    res: Response,
    content: string,
) => string | Promise<string>;
