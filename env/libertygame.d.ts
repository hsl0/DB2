// 리버티게임에서 window 네임스페이스에 지정된 함수들

// Common.js
interface NotificationOptions extends Partial<typeof mw.notification.defaults> {
    additionalMessage: string;
}
interface MWApiHTTPErrorDetails {
    xhr: JQueryXHR;
    textStatus: string;
    exception: string;
}
declare function notifyApiError(
    msg: string,
    option: NotificationOptions | null,
    code: string,
    object?: MWApiHTTPErrorDetails
): void;

declare function geturlSearch(location?: URL | Location): {
    [key: string]: string;
};

// gadget-Tasker
declare function registerRenderer(renderer: unknown): void;
declare function registerRenderer(...renderers: Array<unknown>): void;

declare function registerHandler(renderer: unknown): void;
declare function registerHandler(...renderers: Array<unknown>): void;

declare function registerTrigger(renderer: unknown): void;
declare function registerTrigger(...renderers: Array<unknown>): void;
