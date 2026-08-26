export const getApiBaseUrl = (): string => {
    if (import.meta.env.VITE_API_URL) {
        let url = import.meta.env.VITE_API_URL.trim().replace(/\/$/, '');
        if (url.endsWith('/api')) {
            url = url.slice(0, -4);
        }
        return url;
    }
    if (typeof window !== 'undefined' && window.location) {
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3001';
        }
    }
    return 'https://zk-document-verification-platform.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();

export const getAppBaseUrl = (): string => {
    if (import.meta.env.VITE_APP_URL) {
        return import.meta.env.VITE_APP_URL.replace(/\/$/, '');
    }
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
        return window.location.origin.replace(/\/$/, '');
    }
    return 'http://localhost:5173';
};