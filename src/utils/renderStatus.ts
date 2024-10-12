import {STATUS_CODES} from 'node:http';
import {Request, Response} from 'express';

export function renderStatus(req: Request, {statusCode}: Response) {
    let statusText = `${statusCode} ${STATUS_CODES[statusCode]}`;

    return '<!DOCTYPE html>' +
        '<html><head><meta charset="utf-8"/>' +
        '<meta name="viewport" content="width=device-width"/>' +
        `<title>${statusText}</title></head>` +
        '<body><main style="text-align: center;">' +
        `<h1>${statusText}</h1><hr/>` +
        `<pre>ID: ${req.ctx?.id ?? 'None'}</pre>` +
        '</main></body></html>';
}
