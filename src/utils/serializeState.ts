export function serializeState(state: unknown) {
    return JSON.stringify(state).replace(/</g, '\\x3c');
}
