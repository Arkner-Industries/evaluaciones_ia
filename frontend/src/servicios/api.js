import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) config.headers.Authorization = `Baerer ${token}`
    return config
});

api.interceptors.response.use((respuesta) => respuesta, (error) => {

    const era_login = error.config?.url?.includes('/auth/login')

    if (error.response?.status === 401 && !era_login) {
        localStorage.removeItem('token')
        localStorage.removeItem('usuario')
        
        if (window.location.pathname !== '/login') {
            window.location.href = '/login'
        }
    }

    return Promise.reject(error)
});


const mensaje_de_error = (error, por_defecto = 'Ocurrio un error') => {
    if (error.response) return error.response.data?.mensaje || por_defecto
    if (error.request) return 'Servidor no responde'
    return error.message || por_defecto
}


export {
    api,
    mensaje_de_error
}