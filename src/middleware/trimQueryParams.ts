import type {Middleware} from '../types/Middleware';
import {emitLog} from '../utils/emitLog';

export const trimQueryParams: Middleware<string[]> = paramKeys => {
    return (req, res, next) => {
        let {originalUrl} = req;
        let [url, queryString] = originalUrl.split('?');

        if (!queryString)
            return next();

        let params = new URLSearchParams(queryString);
        let updatedParams: string[] = [];

        for (let key of paramKeys) {
            let value = req.query[key];

            if (typeof value !== 'string')
                continue;

            let trimmedValue = value.trim();

            if (trimmedValue && value === trimmedValue)
                continue;

            if (trimmedValue) params.set(key, trimmedValue);
            else params.delete(key);

            updatedParams.push(key);
        }

        if (updatedParams.length === 0)
            return next();

        let updatedQueryString = params.toString();
        let updatedUrl = `${url}${updatedQueryString ? `?${updatedQueryString}` : ''}`;

        emitLog(req.app, 'Trim query params and redirect', {
            req,
            res,
            data: {
                originalUrl,
                updatedUrl,
                updatedParams,
            },
        });

        res.redirect(updatedUrl);
    };
};
