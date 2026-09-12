import { useState, useRef, useEffect, useCallback } from 'react';
import { isRequestRouteDefinition, RequestError, useRequest, type RequestRouteDefinition } from './use-request';

type FormData = Record<string, unknown>;
type ErrorBag = Record<string, string | undefined>;
type FormErrors<TForm extends FormData> = Partial<Record<Extract<keyof TForm, string>, string>> & ErrorBag;

type SubmitOptions<TResponse = unknown> = {
    onSuccess?: (response: TResponse) => void;
    onError?: (errors: FormErrors<FormData>) => void;
    onFinish?: () => void;
};

type UseFormReturn<TForm extends FormData> = {
    data: TForm;
    errors: FormErrors<TForm>;
    processing: boolean;
    recentlySuccessful: boolean;
    submit: <TResponse = unknown>(
        routeOrOptions?: RequestRouteDefinition | SubmitOptions<TResponse>,
        options?: SubmitOptions<TResponse>,
    ) => Promise<TResponse | undefined>;
    reset: (...fields: Array<Extract<keyof TForm, string>>) => void;
    clearErrors: (...fields: Array<Extract<keyof TForm, string>>) => void;
    resetAndClearErrors: (...fields: Array<Extract<keyof TForm, string>>) => void;
    setData: (data: Partial<TForm> | ((prev: TForm) => TForm)) => void;
};

type LaravelValidationResponse = {
    errors?: Record<string, string | string[]>;
};

const recentlySuccessfulDuration = 2000;

// Helper to determine if a form contains binary data
function hasFiles(value: unknown): boolean {
    if (value instanceof File || value instanceof FileList) return true;
    if (value !== null && typeof value === 'object') {
        return Object.values(value).some((val) => hasFiles(val));
    }
    return false;
}

// Convert plain payload to Multipart FormData
function convertToFormData(data: Record<string, unknown>): FormData {
    const formData = new window.FormData();
    Object.entries(data).forEach(([key, value]) => appendFormDataValue(formData, key, value));
    return formData as unknown as FormData;
}

function appendFormDataValue(formData: globalThis.FormData, key: string, value: unknown): void {
    if (value instanceof File) {
        formData.append(key, value);
    } else if (value instanceof FileList) {
        for (let index = 0; index < value.length; index++) {
            formData.append(`${key}[]`, value[index]);
        }
    } else if (Array.isArray(value)) {
        value.forEach((item, index) => appendFormDataValue(formData, `${key}[${index}]`, item));
    } else if (value !== null && typeof value === 'object' && !(value instanceof Date) && !(value instanceof RegExp)) {
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            appendFormDataValue(formData, `${key}[${nestedKey}]`, nestedValue);
        });
    } else if (value !== undefined) {
        formData.append(key, String(value));
    }
}

export default function useForm<TForm extends FormData>(data: TForm): UseFormReturn<TForm>;
export default function useForm<TForm extends FormData>(route: RequestRouteDefinition, data: TForm): UseFormReturn<TForm>;
export default function useForm<TForm extends FormData>(routeOrData: RequestRouteDefinition | TForm, maybeData?: TForm): UseFormReturn<TForm> {
    const defaultRoute = useRef<RequestRouteDefinition | undefined>(maybeData ? (routeOrData as RequestRouteDefinition) : undefined);
    const defaults = useRef<TForm>(cloneData(maybeData ?? (routeOrData as TForm)));
    const recentlySuccessfulTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    const [fields, setFields] = useState<TForm>(() => cloneData(defaults.current));
    const [errors, setErrorsState] = useState<FormErrors<TForm>>({});
    const [processing, setProcessing] = useState(false);
    const [recentlySuccessful, setRecentlySuccessful] = useState(false);

    useEffect(() => {
        return () => {
            if (recentlySuccessfulTimeout.current) clearTimeout(recentlySuccessfulTimeout.current);
        };
    }, []);

    const setData = useCallback((updater: Partial<TForm> | ((prev: TForm) => TForm)) => {
        setFields((prev) => (typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }));
    }, []);

    const clearErrors = useCallback((...fieldsToClearList: Array<Extract<keyof TForm, string>>) => {
        setErrorsState((prev) => {
            const next = { ...prev };
            const targets = fieldsToClearList.length > 0 ? fieldsToClearList : (Object.keys(prev) as Array<Extract<keyof TForm, string>>);
            targets.forEach((field) => { delete next[field]; });
            return next;
        });
    }, []);

    const reset = useCallback((...fieldsToResetList: Array<Extract<keyof TForm, string>>) => {
        setFields((prev) => {
            const next = { ...prev };
            const targets = fieldsToResetList.length > 0 ? fieldsToResetList : (Object.keys(defaults.current) as Array<Extract<keyof TForm, string>>);
            targets.forEach((field) => { next[field] = cloneValue(defaults.current[field]); });
            return next;
        });
    }, []);

    const resetAndClearErrors = useCallback((...fieldsToProcess: Array<Extract<keyof TForm, string>>) => {
        reset(...fieldsToProcess);
        clearErrors(...fieldsToProcess);
    }, [reset, clearErrors]);

    const submit = useCallback(async <TResponse = unknown>(
        routeOrOptions?: RequestRouteDefinition | SubmitOptions<TResponse>,
        options?: SubmitOptions<TResponse>
    ): Promise<TResponse | undefined> => {
        const route = isRequestRouteDefinition(routeOrOptions) ? routeOrOptions : undefined;
        const submitOptions = isRequestRouteDefinition(routeOrOptions) ? options : routeOrOptions;
        const submitRoute = route ?? defaultRoute.current;

        if (!submitRoute) {
            throw new Error('A route is required to submit this form.');
        }

        setProcessing(true);
        setRecentlySuccessful(false);
        clearErrors();

        try {
            const rawPayload = Object.fromEntries(
                Object.entries(fields as Record<string, unknown>).map(([field, value]) => [field, cloneValue(value)])
            );

            // Dynamic payload structural adjustment for files
            const finalPayload = hasFiles(rawPayload) ? convertToFormData(rawPayload) : rawPayload;

            const response = (await useRequest(submitRoute, {
                body: finalPayload as unknown as Record<string, unknown>,
            })) as TResponse;

            setRecentlySuccessful(true);
            if (recentlySuccessfulTimeout.current) clearTimeout(recentlySuccessfulTimeout.current);
            recentlySuccessfulTimeout.current = setTimeout(() => setRecentlySuccessful(false), recentlySuccessfulDuration);

            submitOptions?.onSuccess?.(response);
            return response;
        } catch (error) {
            const validationErrors = error instanceof RequestError ? validationErrorsFrom(error.body) : {};
            setErrorsState(validationErrors as FormErrors<TForm>);
            submitOptions?.onError?.(validationErrors);
            if (Object.keys(validationErrors).length === 0) throw error;
        } finally {
            setProcessing(false);
            submitOptions?.onFinish?.();
        }
    }, [fields, clearErrors]);

    return { data: fields, errors, processing, recentlySuccessful, submit, reset, clearErrors, resetAndClearErrors, setData };
}

function validationErrorsFrom(response: unknown): FormErrors<FormData> {
    const errors = (response as LaravelValidationResponse | null)?.errors;
    if (!errors) return {};
    return Object.fromEntries(
        Object.entries(errors).map(([field, messages]) => [
            field, 
            Array.isArray(messages) ? (messages[0] ?? '') : messages
        ])
    );
}

function cloneData<TData extends FormData>(data: TData): TData { return cloneValue(data) as TData; }

function cloneValue<TValue>(value: TValue): TValue {
    // Return early if file representations are detected to bypass structuredClone exceptions
    if (value instanceof File || value instanceof FileList) {
        return value;
    }
    try { return structuredClone(value); } catch { return cloneValueFallback(value) as TValue; }
}

function cloneValueFallback<TValue>(value: TValue): TValue {
    if (value instanceof File || value instanceof FileList) return value;
    if (value === null || typeof value === 'undefined' || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
    if (typeof value === 'bigint') return String(value) as TValue;
    if (value instanceof Date) return new Date(value.getTime()) as TValue;
    if (value instanceof RegExp) return new RegExp(value) as TValue;
    if (Array.isArray(value)) return value.map((item) => cloneValueFallback(item)) as TValue;
    if (typeof value === 'object') {
        const clonedObject: Record<string, unknown> = {};
        Object.entries(value as Record<string, unknown>).forEach(([key, nestedValue]) => {
            if (typeof nestedValue !== 'undefined') clonedObject[key] = cloneValueFallback(nestedValue);
        });
        return clonedObject as TValue;
    }
    return undefined as TValue;
}
