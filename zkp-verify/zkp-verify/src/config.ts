export const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'https://zk-document-verification-platform-production.up.railway.app';

export const getAppBaseUrl = (): string => {
    if (import.meta.env.VITE_APP_URL) {
        return import.meta.env.VITE_APP_URL.replace(/\/$/, '');
    }
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
        return window.location.origin.replace(/\/$/, '');
    }
    return '';
};