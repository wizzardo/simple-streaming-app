import {orNoop} from "react-ui-basics/Tools";

const CONTENT_TYPE_APPLICATION_JSON = 'application/json';

const toKeyValue = (key, value) => key && (encodeURIComponent(key) + '=' + encodeURIComponent(value !== null && typeof value === 'object' ? JSON.stringify(value) : value));

export const toRequestParams = (params) => (params && Object.keys(params).map(key => {
    const value = params[key];
    if (Array.isArray(value))
        return value.map(it => toKeyValue(key, it)).join('&')
    else
        return toKeyValue(key, value);
}).join('&')) || '';

export type Method = 'GET' | 'DELETE' | 'POST' | 'PUT'

export class FetchOptions {
    method?: Method = 'GET'
    headers?: ({ [name: string]: string })
    params?: ({ [name: string]: any }) | FormData | Blob
    multipart?: boolean = false
    async?: boolean = true
    withCredentials?: boolean = true
    timeout?: number
    onTimeout?: ((ev: ProgressEvent) => any)
    onSuccess?: ((t: any) => void)
    onError?: ((e: any, status: number) => void)
    onProgress?: ((ev: ProgressEvent) => any)
    provideCancel?: ((cancelFunction: () => void) => void)
}

const DEFAULT_OPTIONS = new FetchOptions()

export const fetch = <T>(url, options: FetchOptions = DEFAULT_OPTIONS) => {
    const method = options.method || 'GET'
    const params = options.params || {};
    if (method === 'GET' || method === 'DELETE') {
        const serializedData = toRequestParams(params);
        if (serializedData)
            url = url + "?" + serializedData;
    }

    const headers = {
        'Accept': CONTENT_TYPE_APPLICATION_JSON,
        ...(options.headers || {})
    };

    let body: FormData | string | Blob

    if (method === 'POST' || method === 'PUT') {
        if (options.multipart) {
            let formData;
            if (params instanceof FormData) {
                formData = params;
            } else {
                formData = new FormData();
                Object.keys(params).forEach(name => {
                    let value = params[name];
                    if (Array.isArray(value)) {
                        value.forEach(it => formData.append(name, it))
                    } else if (value != null)
                        formData.append(name, value);
                });
            }
            body = formData;
        } else if (params instanceof Blob || params instanceof FormData) {
            body = params;
        } else {
            headers['Content-Type'] = CONTENT_TYPE_APPLICATION_JSON;
            body = JSON.stringify(params || {}, (key, value) => {
                if (value !== null)
                    return value
            });
        }
    }

    let makeRequest = (success, error) => {
        const request = new XMLHttpRequest();

        const data = body;

        if (!!(options.withCredentials === void 0 ? true : options.withCredentials))
            request.withCredentials = true;

        const async = !!(options.async === void 0 ? true : options.async);
        request.open(method, url, async);

        Object.keys(headers).forEach(key =>
            request.setRequestHeader(key, headers[key])
        );
        const onError = orNoop(error);

        if (options.timeout && async) {
            request.timeout = options.timeout;
            request.ontimeout = (e) => (options.onTimeout || onError)(e);
        }

        const onProgress = options.onProgress;
        if (onProgress) {
            request.upload.onprogress = e => {
                if (e.lengthComputable)
                    onProgress(e);
            };
            request.onprogress = onProgress;
        }

        request.onload = () => {
            const responseText = request.responseText;
            const status = request.status;
            if (status >= 200 && status < 400) {
                try {
                    orNoop(success)(JSON.parse(responseText || "{}"));
                } catch (e) {
                    const message = `Unexpected exception while processing response for ${method} ${url}, status: ${status}, response: '${responseText}', exception:`;
                    console.log(message, e)
                    onError(new FetchError(message, status, responseText))
                }
            } else {
                const message = `Not ok response for ${method} ${url}, status: ${status}, response: '${responseText}'`;
                console.log(message);
                onError(new FetchError(message, status, responseText))
            }
        };

        request.onerror = onError;

        try {
            if (method === 'POST') {
                if (typeof data === 'string' || data instanceof Blob || data instanceof FormData)
                    request.send(data);
                else
                    request.send(toRequestParams(data));
            } else
                request.send();
        } catch (e) {
            onError(e);
        }

        if (options.provideCancel) {
            options.provideCancel(() => request.abort());
        }
        return request
    };

    // if (!window.Promise)
    //     return makeRequest(options.onSuccess, options.onError);

    return new Promise<T>((resolve, reject) => {
        const success = data => (options.onSuccess || resolve)(data);
        const error = (e, status) => (options.onError || reject)(e, status);
        makeRequest(success, error);
    });
};

class FetchError extends Error {
    status: number;
    responseText?: string;

    constructor(message, status: number, responseText?: string) {
        super(message);
        this.status = status;
        this.responseText = responseText;
    }
}