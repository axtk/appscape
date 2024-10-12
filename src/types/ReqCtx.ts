/** Session request data collected on the server via `req.ctx` */
export type ReqCtx = {
    /** Request ID */
    id?: string;
    /** CSP nonce */
    nonce?: string;
    /** When the request started to be handled */
    startTime?: number;
    /** User locale */
    lang?: string;
};
