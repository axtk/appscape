import type {Request} from 'express';
import type {DynamicCSPDirective} from '../types/DynamicCSPDirective';

export const cspNonce: DynamicCSPDirective = req => {
    return `'nonce-${(req as Request).ctx?.nonce}'`;
}
