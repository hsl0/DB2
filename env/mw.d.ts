// 미디어위키에서 기본적으로 제공하는 mw 네임스페이스
declare namespace mw {
    class Map<Value> {
        values: { [key: string]: Value };
        get(): { [key: string]: Value };
        get(selection: string | string[]): Value;
        get<_Fallback>(
            selection: string | string[],
            fallback: _Fallback
        ): Value | _Fallback;
        set(selection: string, value: Value): boolean;
        exists(selection: string | { [key: string]: Value }): boolean;
    }
    namespace user {
        const options: Map<string>;
        function isAnon(): boolean;
    }
    class Api {
        get(
            parameters: Object,
            ajaxOptions?: JQueryAjaxSettings
        ): JQueryPromise<any>;
        saveOptions(options: {
            [key: string]: string | null;
        }): JQuery.Promise<
            [Object, JQueryXHR],
            [string, Object, Object, JQueryXHR] | ['http']
        >;
    }
    namespace Api {
        interface HTTPErrorDetails {
            xhr: JQueryXHR;
            textStatus: string;
            exception: string;
        }
    }
    const config: mw.Map<unknown>;
    namespace loader {
        function using(
            dependencies: string | string[],
            ready?: (require: (moduleName: string) => any) => any,
            error?: () => any
        ): JQueryPromise<(moduleName: string) => any>;
    }
    namespace util {
        function getUrl(pagename?: string | null, params?: Object): string;
    }
    namespace notification {
        interface Options {
            autoHide?: boolean;
            autoHideSeconds?: 'short' | 'long';
            tag?: string;
            title?: string;
            type?: string;
            visibleTimeout?: boolean;
            id?: string;
        }
        function notify(
            message: HTMLElement | HTMLElement[] | JQuery | mw.Message | string,
            options?: Options
        ): mw.Notification;
    }
    class Notification {
        close(): void;
    }
    class Message {}
}
