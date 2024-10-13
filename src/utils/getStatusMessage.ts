import {STATUS_CODES} from 'node:http';

export function getStatusMessage(prefix: string, statusCode: number) {
    return `${prefix} - [${statusCode}] ${STATUS_CODES[statusCode]}`;
}
