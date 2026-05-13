import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

//attach bearer to tokens being sent to backend
apiClient.interceptors.request.use(
    (config) => {
        const sessionRaw = localStorage.getItem('chizel_auth_session');

        if(sessionRaw){
            try{
                const session = JSON.parse(sessionRaw);
                if(session.token){
                    config.headers.Authorization = `Bearer ${ session.token }`;
                }
            } catch(e) {
                console.error('Failed to parse auth session' , e);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//Catch expired tokens
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('Token expired or invalid. Logging out...');
            localStorage.removeItem('chizel_auth_session');
            localStorage.removeItem('chizel_user');
            window.location.href = '/signin'; 
        }
        return Promise.reject(error);
    }
);

export default apiClient;
