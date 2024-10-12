/**
 * Parses a language range string (typically a value of the 'Accept-Language'
 * HTTP request header) and returns a corresponding array of locales
 * @example 'fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5'
 */
export function getLocales(languageRange: string | undefined): string[] {
    return (languageRange ?? '')
        .split(/[,;]\s*/)
        .filter(s => !s.startsWith('q=') && s !== '*');
}
