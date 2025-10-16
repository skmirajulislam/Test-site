/**
 * Centralized API client with error handling, timeout, and retry logic
 */

interface FetchOptions extends RequestInit {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
}

interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public response?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

/**
 * Enhanced fetch with timeout, retry, and error handling
 */
async function fetchWithTimeout(
    url: string,
    options: FetchOptions = {}
): Promise<Response> {
    const {
        timeout = 10000,
        retries = 0,
        retryDelay = 1000,
        ...fetchOptions
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, {
                ...fetchOptions,
                signal: controller.signal,
            });

            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error('Unknown error');

            // Don't retry on abort or last attempt
            if (
                lastError.name === 'AbortError' ||
                attempt === retries
            ) {
                clearTimeout(timeoutId);
                throw lastError;
            }

            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
    }

    clearTimeout(timeoutId);
    throw lastError || new Error('Fetch failed');
}

/**
 * Main API client with automatic JSON parsing and error handling
 */
export async function apiClient<T = unknown>(
    url: string,
    options: FetchOptions = {}
): Promise<ApiResponse<T>> {
    try {
        console.log(`🔄 API Request: ${options.method || 'GET'} ${url}`);

        const response = await fetchWithTimeout(url, options);

        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('application/json')) {
            if (!response.ok) {
                throw new ApiError(
                    `HTTP Error ${response.status}: ${response.statusText}`,
                    response.status
                );
            }
            const text = await response.text();
            console.log(`✅ API Response: ${response.status} (text)`);
            return {
                success: true,
                data: text as T,
            };
        }

        // Parse JSON response
        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.error || data.message || `HTTP Error ${response.status}`;
            console.error(`❌ API Error: ${response.status} - ${errorMessage}`);
            throw new ApiError(errorMessage, response.status, data);
        }

        console.log(`✅ API Success: ${response.status}`);
        return {
            success: true,
            data: data.data !== undefined ? data.data : data,
            message: data.message,
        };
    } catch (error) {
        if (error instanceof ApiError) {
            return {
                success: false,
                error: error.message,
            };
        }

        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                console.error('❌ API Timeout:', url);
                return {
                    success: false,
                    error: 'Request timeout. Please try again.',
                };
            }

            console.error('❌ API Error:', error.message);
            return {
                success: false,
                error: error.message,
            };
        }

        console.error('❌ Unknown API Error:', error);
        return {
            success: false,
            error: 'An unexpected error occurred',
        };
    }
}

/**
 * Convenience methods for common HTTP verbs
 */
export const api = {
    get: <T = unknown>(url: string, options?: FetchOptions) =>
        apiClient<T>(url, { ...options, method: 'GET' }),

    post: <T = unknown>(url: string, body?: unknown, options?: FetchOptions) =>
        apiClient<T>(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        }),

    put: <T = unknown>(url: string, body?: unknown, options?: FetchOptions) =>
        apiClient<T>(url, {
            ...options,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        }),

    delete: <T = unknown>(url: string, options?: FetchOptions) =>
        apiClient<T>(url, { ...options, method: 'DELETE' }),

    // For FormData uploads
    upload: <T = unknown>(url: string, formData: FormData, options?: FetchOptions) =>
        apiClient<T>(url, {
            ...options,
            method: 'POST',
            body: formData,
        }),
};

/**
 * Hook-friendly API client that returns loading and error states
 */
export async function apiWithState<T = unknown>(
    url: string,
    options: FetchOptions = {},
    onStart?: () => void,
    onComplete?: () => void
): Promise<{ data: T | null; error: string | null }> {
    onStart?.();

    try {
        const result = await apiClient<T>(url, options);

        if (result.success && result.data !== undefined) {
            return { data: result.data as T, error: null };
        }

        return { data: null, error: result.error || 'Unknown error' };
    } catch (error) {
        return {
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    } finally {
        onComplete?.();
    }
}

export { ApiError };
