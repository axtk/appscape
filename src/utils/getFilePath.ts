import {join} from 'node:path';
import {access} from 'node:fs/promises';
import {toLanguage} from '../lib/lang/toLanguage';

export type GetFilePathParams = {
    name: string;
    dir?: string;
    lang?: string;
    supportedLocales?: string[];
    ext?: string | string[];
};

export async function getFilePath({
    name,
    dir = '.',
    lang,
    supportedLocales = [],
    ext,
}: GetFilePathParams) {
    let cwd = process.cwd();

    let localeSet = new Set(supportedLocales);
    let langSet = new Set(supportedLocales.map(toLanguage));

    let availableNames = [
        name,
        ...[...localeSet, ...langSet].map(item => `${name}.${item}`),
    ];

    let preferredLangNames: string[] | undefined;

    if (lang && (!supportedLocales.length || localeSet.has(lang) || langSet.has(lang)))
        preferredLangNames = [
            `${name}.${lang}`,
            `${name}.${toLanguage(lang)}`,
        ];

    let names = new Set(
        preferredLangNames
            ? [...preferredLangNames, ...availableNames]
            : availableNames,
    );

    let exts = Array.isArray(ext) ? ext : [ext];

    for (let item of names) {
        for (let itemExt of exts) {
            let path = join(cwd, dir, itemExt ? `${item}.${itemExt}` : item);

            try {
                await access(path);
                return path;
            }
            catch {}
        }
    }
}
