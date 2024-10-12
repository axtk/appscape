import type {CookieOptions} from 'express';
import {getEffectiveLocale} from '../lib/lang/getEffectiveLocale';
import {getLocales} from '../lib/lang/getLocales';
import {toLanguage} from '../lib/lang/toLanguage';
import {emitLog} from '../utils/emitLog';
import type {Middleware} from '../types/Middleware';

const defaultLangCookieOptions: CookieOptions = {
    maxAge: 90*86_400_000,
};

export type LangParams = {
    supportedLocales?: string[];
    shouldSetLangCookie?: boolean;
    shouldRedirect?: boolean;
    langCookieOptions?: CookieOptions;
};

export const lang: Middleware<LangParams | void> = ({
    supportedLocales = [],
    shouldSetLangCookie = true,
    shouldRedirect = true,
    langCookieOptions = defaultLangCookieOptions,
} = {}) => {
    let langSet = new Set(supportedLocales.map(toLanguage));
    let localeSet = new Set(supportedLocales);

    return (req, res, next) => {
        let langParam = req.query.lang as string[] | string | undefined;
        let lang = (Array.isArray(langParam) ? langParam[0] : langParam) ?? '';

        if (localeSet.has(lang) || langSet.has(lang)) {
            if (shouldSetLangCookie) {
                emitLog(req.app, `Set lang cookie: ${JSON.stringify(lang)}`, {
                    req,
                    res,
                });

                res.cookie('lang', lang, langCookieOptions);
            }

            if (shouldRedirect) {
                let {originalUrl} = req;
                let nextUrl = originalUrl.replace(/[\?&]lang=[^&]+/g, '');

                if (nextUrl !== originalUrl) {
                    emitLog(req.app, 'Strip lang param and redirect', {
                        req,
                        res,
                    });

                    res.redirect(nextUrl);
                    return;
                }
            }
        }

        let langCookie = shouldSetLangCookie
            ? req.cookies.lang as string | undefined
            : undefined;

        let userAgentLocales = getLocales(req.get('accept-language'));
        let preferredLocales = langCookie
            ? [langCookie, ...userAgentLocales]
            : userAgentLocales;

        let effectiveLang = getEffectiveLocale(preferredLocales, supportedLocales);

        if (req.ctx && effectiveLang)
            req.ctx.lang = effectiveLang;

        emitLog(req.app, `Detected lang: ${JSON.stringify(effectiveLang)}`, {
            req,
            res,
            data: {
                userAgentLocales,
                langCookie,
                lang: effectiveLang,
            },
        });

        next();
    };
};
