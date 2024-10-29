import {STATUS_CODES} from 'node:http';
import {RenderStatus} from '../types/RenderStatus';

export const renderStatus: RenderStatus = (req, {statusCode}) => {
    let id = req.ctx?.id;
    let statusText = `${statusCode} ${STATUS_CODES[statusCode]}`;
    let date = (new Date())
        .toISOString()
        .replace(/T/, ' ')
        .replace(/Z$/, '') + ' UTC';

    return '<!DOCTYPE html>' +
        '<html><head><meta charset="utf-8"/>' +
        '<meta name="viewport" content="width=device-width"/>' +
        `<title>${statusText}</title></head>` +
        '<body><main style="text-align: center;">' +
        `<h1>${statusText}</h1><hr/><p>` +
        (id ? `<code>ID: ${id}</code><br/>` : '') +
        `<code>${date}</code>` +
        '</p></main></body></html>';
}
