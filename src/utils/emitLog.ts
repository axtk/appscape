import type {Application} from 'express';
import type {LogEventPayload} from '../types/LogEventPayload';

export function emitLog(
    app: Application,
    message?: LogEventPayload['message'] | LogEventPayload,
    payload?: LogEventPayload,
) {
    let normalizedPayload: LogEventPayload = {
        timestamp: Date.now(),
        ...payload,
        ...(typeof message === 'string' || message instanceof Error ? {message} : message),
    };

    return app.events?.emit('log', normalizedPayload);
}
