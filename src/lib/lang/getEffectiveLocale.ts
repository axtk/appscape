import {toLanguage} from './toLanguage';

type Match = {
    index?: number;
    locale?: string | undefined;
};

export function getEffectiveLocale(
    preferredLocales: string[] | undefined,
    supportedLocales: string[] | undefined,
): string | undefined {
    if (!supportedLocales || supportedLocales.length === 0)
        return undefined;

    if (!preferredLocales || preferredLocales.length === 0)
        return supportedLocales[0];

    let exactMatch: Match = {};

    for (let i = 0; i < preferredLocales.length && !exactMatch.locale; i++) {
        let k = supportedLocales.findIndex(
            supportedLocale => preferredLocales[i] === supportedLocale,
        );

        if (k !== -1) {
            exactMatch.index = i;
            exactMatch.locale = supportedLocales[k];
        }
    }

    let languageMatch: Match = {};

    let supportedLanguages = supportedLocales.map(toLanguage);
    let preferredLanguages = preferredLocales.map(toLanguage);

    for (let i = 0; i < preferredLanguages.length && !languageMatch.locale; i++) {
        let k = supportedLanguages.findIndex(
            supportedLanguage => preferredLanguages[i] === supportedLanguage,
        );

        if (k !== -1) {
            languageMatch.index = i;
            languageMatch.locale = supportedLocales[k];
        }
    }

    // if both an exact match and a language match are found, prefer
    // the one with an index closer to the beginning of the preferred
    // locale list
    if (exactMatch.locale && (!languageMatch.locale || exactMatch.index! < languageMatch.index!))
        return exactMatch.locale;

    return languageMatch.locale ?? supportedLocales[0];
}
