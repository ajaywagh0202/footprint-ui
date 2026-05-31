import axios from 'axios';

const getBaseUrl = () => (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.BACKEND_URL ||
    ''
);

const getAuthToken = () => {
    if (typeof localStorage === 'undefined') {
        return null;
    }

    return localStorage.getItem('authToken') || localStorage.getItem('token');
};

const joinUrl = (baseUrl, path) => {
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${normalizedBaseUrl}${normalizedPath}`;
};

export const getTableData = async (path) => {
    const token = getAuthToken();
    const response = await axios.get(joinUrl(getBaseUrl(), path), {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });

    return Array.isArray(response.data) ? response.data : [];
};
