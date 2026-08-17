export const getApiBaseUrl = (): string => {
    let url = import.meta.env.VITE_API_URL || 'https://zk-document-verification-platform-production.up.railway.app';
    url = url.trim().replace(/\/$/, '');
    if (url.endsWith('/api')) {
        url = url.slice(0, -4);
    }
    return url;
};

export const API_BASE_URL = getApiBaseUrl();

export const getAppBaseUrl = (): string => {
    if (import.meta.env.VITE_APP_URL) {
        return import.meta.env.VITE_APP_URL.replace(/\/$/, '');
    }
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
        return window.location.origin.replace(/\/$/, '');
    }
    return '';
};