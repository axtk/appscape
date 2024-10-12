import type {Request} from 'express';
import helmet from 'helmet';
import type {Middleware} from '../types/Middleware';

export type SecHeadersParams = {
    unsafeInlineScript?: boolean;
    unsafeInlineStyle?: boolean;
    scriptSrc?: string[];
    styleSrc?: string[];
    connectSrc?: string[];
    imgSrc?: string[];
    frameSrc?: string[];
    formAction?: string[];
};

export const secHeaders: Middleware<SecHeadersParams | void> = ({
    unsafeInlineScript,
    unsafeInlineStyle,
    scriptSrc = [],
    styleSrc = [],
    connectSrc = [],
    imgSrc = [],
    frameSrc = [],
    formAction = [],
} = {}) =>
    helmet({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: {
            directives: {
                scriptSrc: [
                    '\'self\'',
                    unsafeInlineScript ? '\'unsafe-inline\'' : req => `'nonce-${(req as Request).ctx?.nonce}'`,
                    'cdnjs.cloudflare.com',
                    'mc.yandex.ru',
                    ...scriptSrc,
                ],
                styleSrc: [
                    '\'self\'',
                    unsafeInlineStyle ? '\'unsafe-inline\'' : req => `'nonce-${(req as Request).ctx?.nonce}'`,
                    'fonts.googleapis.com',
                    'fonts.gstatic.com',
                    'cdnjs.cloudflare.com',
                    ...styleSrc,
                ],
                connectSrc: [
                    '\'self\'',
                    'mc.yandex.ru',
                    ...connectSrc,
                ],
                imgSrc: [
                    '\'self\'',
                    'data:',
                    ...imgSrc,
                ],
                frameSrc: [
                    '\'self\'',
                    'mc.yandex.md',
                    ...frameSrc,
                ],
                formAction: [
                    '\'self\'',
                    ...formAction,
                ],
            },
        },
    });
