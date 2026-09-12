import type { RouteDefinition as WayfinderRouteDefinition, RouteFormDefinition } from '@/wayfinder';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type RouteMethod = Lowercase<HttpMethod>;
type RequestMethod = HttpMethod | RouteMethod;

export type RequestRouteDefinition =
    | WayfinderRouteDefinition<RouteMethod>
    | WayfinderRouteDefinition<RouteMethod[]>
    | RouteFormDefinition<RouteMethod>
    | {
          url?: string;
          action?: string;
          method?: string;
          methods?: string[];
      };

type RequestOptions = {
    body?: Record<string, unknown> | FormData;
    cache?: boolean | number;
    headers?: Record<string, string>;
    signal?: AbortSignal;
};

type RequestOverrides = RequestOptions & {
    url?: string;
    method?: RequestMethod;
};

type RequestParams = RequestOptions & {
    url: string;
    method: RequestMethod;
    route?: RequestRouteDefinition;
};

type RequestParamsWithRoute = RequestOptions & {
    route: RequestRouteDefinition;
    url?: string;
    method?: RequestMethod;
};

export class RequestError extends Error {
    public constructor(
        public readonly status: number,
        public readonly body: unknown,
    ) {
        super(`HTTP error! status: ${status}.`);
    }
}

type CachedResponse = {
    expiresAt: number;
    value: unknown;
};

const DEFAULT_CACHE_TTL = 60_000;
const responseCache = new Map<string, CachedResponse>();
const inflightRequests = new Map<string, Promise<unknown>>();

export async function useRequest(params: RequestParams | RequestParamsWithRoute): Promise<unknown>;
export async function useRequest(route: RequestRouteDefinition, overrides?: RequestOverrides): Promise<unknown>;
export async function useRequest(paramsOrRoute: RequestParams | RequestParamsWithRoute | RequestRouteDefinition, overrides?: RequestOverrides): Promise<unknown> {
    const params = resolveRequestParams(paramsOrRoute, overrides);
    const cacheTtl = params.body instanceof FormData ? null : resolveCacheTtl(params.cache);

    if (cacheTtl !== null) {
        const cacheKey = buildCacheKey(params);
        const cachedResponse = responseCache.get(cacheKey);

        if (cachedResponse && cachedResponse.expiresAt > Date.now()) {
            return cachedResponse.value;
        }

        const inflightRequest = inflightRequests.get(cacheKey);

        if (inflightRequest) {
            return inflightRequest;
        }

        const request = fetchRequest(params, cacheKey, cacheTtl);

        inflightRequests.set(cacheKey, request);

        return request;
    }

    return fetchRequest(params);
}

export function clearRequestCache(cacheKey?: string): void {
    if (typeof cacheKey === 'string') {
        responseCache.delete(cacheKey);
        inflightRequests.delete(cacheKey);

        return;
    }

    responseCache.clear();
    inflightRequests.clear();
}

async function fetchRequest(params: RequestParams, cacheKey?: string, cacheTtl?: number): Promise<unknown> {
    const xsrfToken = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];

    const isFormData = params.body instanceof FormData;

    // Get tenant ID from Inertia props
    let tenantId: string | undefined;
    try {
        const pageProps = (window as any).__INERTIA__?.props?.initialPage?.props;
        tenantId = pageProps?.tenantId;
    } catch {
        // Fallback: tenant ID may not be available
    }

    try {
        const response = await fetch(params.url, {
            method: params.method,
            body: params.body instanceof FormData ? params.body : params.body ? JSON.stringify(params.body) : undefined,
            headers: {
                Accept: 'application/json',
                ...(params.body && !isFormData ? { 'Content-Type': 'application/json' } : {}),
                ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
                ...(tenantId ? { 'X-Tenant-ID': tenantId } : {}),
                ...params.headers,
            },
            signal: params.signal,
        });

        const responseBody = await parseResponseBody(response);

        if (!response.ok) {
            throw new RequestError(response.status, responseBody);
        }

        if (cacheKey && typeof cacheTtl === 'number') {
            responseCache.set(cacheKey, {
                expiresAt: Date.now() + cacheTtl,
                value: responseBody,
            });
        }

        return responseBody;
    } finally {
        if (cacheKey) {
            inflightRequests.delete(cacheKey);
        }
    }
}

function resolveRequestParams(paramsOrRoute: RequestParams | RequestParamsWithRoute | RequestRouteDefinition, overrides?: RequestOverrides): RequestParams {
    const route = resolveRoute(paramsOrRoute, overrides);
    const options = overrides ?? (paramsOrRoute as RequestParams | RequestParamsWithRoute);
    const url = options.url ?? (route ? resolveUrl(route) : undefined);
    const method = options.method ?? (route ? resolveMethod(route) : undefined);

    if (!url) {
        throw new Error('The request must include a url or route.');
    }

    if (!method) {
        throw new Error('The request must include a method or route method.');
    }

    return {
        ...options,
        url,
        method: normalizeMethod(method),
    };
}

function resolveRoute(
    paramsOrRoute: RequestParams | RequestParamsWithRoute | RequestRouteDefinition,
    overrides?: RequestOverrides,
): RequestRouteDefinition | undefined {
    if (overrides) {
        return paramsOrRoute as RequestRouteDefinition;
    }

    if ('route' in paramsOrRoute) {
        return paramsOrRoute.route;
    }

    if (isRequestRouteDefinition(paramsOrRoute) && !isRequestParams(paramsOrRoute)) {
        return paramsOrRoute;
    }
}

function isRequestParams(value: RequestParams | RequestParamsWithRoute | RequestRouteDefinition): value is RequestParams {
    return 'url' in value && 'method' in value && ('body' in value || 'headers' in value || 'signal' in value || 'route' in value);
}

export function isRequestRouteDefinition(value: unknown): value is RequestRouteDefinition {
    return typeof value === 'object' && value !== null && ('method' in value || 'methods' in value);
}

function resolveUrl(route: RequestRouteDefinition): string | undefined {
    if ('url' in route && typeof route.url !== 'undefined') {
        return route.url;
    }

    if ('action' in route) {
        return route.action;
    }

    return undefined;
}

function resolveMethod(route: RequestRouteDefinition): string | undefined {
    if ('method' in route) {
        return route.method;
    }

    return route.methods?.[0];
}

function normalizeMethod(method: string): HttpMethod {
    return method.toUpperCase() as HttpMethod;
}

function resolveCacheTtl(cache: boolean | number | undefined): number | null {
    if (typeof cache === 'number') {
        return cache > 0 ? cache : null;
    }

    if (cache === true) {
        return DEFAULT_CACHE_TTL;
    }

    return null;
}

function buildCacheKey(params: RequestParams): string {
    return `${params.method}:${params.url}:${stableStringify(params.body)}`;
}

function stableStringify(value: unknown): string {
    if (value === null || typeof value !== 'object') {
        return JSON.stringify(value);
    }

    if (Array.isArray(value)) {
        return `[${value.map((item) => stableStringify(item)).join(',')}]`;
    }

    const entries = Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => typeof item !== 'undefined')
        .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
        .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);

    return `{${entries.join(',')}}`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
    const responseText = await response.text();

    if (!responseText) {
        return null;
    }

    try {
        return JSON.parse(responseText);
    } catch {
        return responseText;
    }
}
