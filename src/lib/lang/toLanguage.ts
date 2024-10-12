export function toLanguage(locale: string): string {
    return locale.split(/[-_]/)[0];
}
