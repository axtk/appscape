import {STATUS_CODES} from 'node:http';

export function renderStatus(statusCode: number) {
    return `<h1>${statusCode} ${STATUS_CODES[statusCode]}</h1>`;
}
