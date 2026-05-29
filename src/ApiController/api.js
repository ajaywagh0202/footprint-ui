
export const Login = async (username, password) => {
    if (!username || !password) {
        throw new Error('Username and password are required');
    }

    // if (username === 'admin@railways.in' && password === 'admin') {
    //     return { success: true, token: 'S324D3D23AFF23' };
    // }
    try {
        const baseUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || '';
        const response = await fetch(`${baseUrl}login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const responseText = await response.text();
        let data = null;

        if (responseText) {
            try {
                data = JSON.parse(responseText);
            } catch {
                data = null;
            }
        }

        if (!response.ok) {
            throw new Error(data?.message || data?.error || responseText || 'Login failed');
        }

        return data;
    } catch (error) {
        console.error('Error during login:', error);
        throw error;
    }
}
