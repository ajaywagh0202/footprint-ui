const getBaseUrl = () => import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || '';

const buildUrl = (path, queryParams) => {
    const baseUrl = getBaseUrl();
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${normalizedBaseUrl}${normalizedPath}`;

    if (!queryParams) {
        return url;
    }

    const searchParams = new URLSearchParams();

    Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, value);
        }
    });

    const queryString = searchParams.toString();
    return queryString ? `${url}?${queryString}` : url;
};

const getAuthToken = () => {
    if (typeof localStorage === 'undefined') {
        return null;
    }

    return localStorage.getItem('authToken') || localStorage.getItem('token');
};

const request = async (path, options = {}) => {
    const { method = 'GET', body, queryParams, headers = {} } = options;
    const token = getAuthToken();

    const response = await fetch(buildUrl(path, queryParams), {
        method,
        headers: {
            ...(body ? { 'Content-Type': 'application/json' } : {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers
        },
        ...(body ? { body: JSON.stringify(body) } : {})
    });

    const responseText = await response.text();
    let data = null;

    if (responseText) {
        try {
            data = JSON.parse(responseText);
        } catch {
            data = responseText;
        }
    }

    if (!response.ok) {
        throw new Error(data?.message || data?.error || data?.detail || responseText || 'Request failed');
    }

    return data;
};

export const createZone = (zoneData) => request('/zones/', {
    method: 'POST',
    body: zoneData
});

export const getZones = ({ skip = 0, limit = 100 } = {}) => request('/zones/', {
    queryParams: { skip, limit }
});

export const getZone = (zoneId) => request(`/zones/${zoneId}`);

export const updateZone = (zoneId, zoneData) => request(`/zones/${zoneId}`, {
    method: 'PUT',
    body: zoneData
});

export const deleteZone = (zoneId) => request(`/zones/${zoneId}`, {
    method: 'DELETE'
});

export const getZoneDivisions = (zoneId) => request(`/zones/${zoneId}/divisions`);

export const createDivision = (divisionData) => request('/divisions/', {
    method: 'POST',
    body: divisionData
});

export const getDivisions = ({ skip = 0, limit = 100 } = {}) => request('/divisions/', {
    queryParams: { skip, limit }
});

export const getDivision = (divisionId) => request(`/divisions/${divisionId}`);

export const updateDivision = (divisionId, divisionData) => request(`/divisions/${divisionId}`, {
    method: 'PUT',
    body: divisionData
});

export const deleteDivision = (divisionId) => request(`/divisions/${divisionId}`, {
    method: 'DELETE'
});

export const getDivisionStations = (divisionId) => request(`/divisions/${divisionId}/stations`);

export const createStation = (stationData) => request('/stations/', {
    method: 'POST',
    body: stationData
});

export const getStations = ({ skip = 0, limit = 100 } = {}) => request('/stations/', {
    queryParams: { skip, limit }
});

export const getStation = (stationId) => request(`/stations/${stationId}`);

export const updateStation = (stationId, stationData) => request(`/stations/${stationId}`, {
    method: 'PUT',
    body: stationData
});

export const deleteStation = (stationId) => request(`/stations/${stationId}`, {
    method: 'DELETE'
});
