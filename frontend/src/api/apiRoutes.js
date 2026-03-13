import api from './axiosConfig';

export const authAPI = {
    requestOTP: (data) => api.post('/auth/request-otp', data),
    verifyOTP: (data) => api.post('/auth/verify-otp', data),
    getProfile: () => api.get('/auth/profile'),
};

export const rideAPI = {
    createRide: (data) => api.post('/rides', data),
    searchRides: (params) => api.get('/rides/search', { params }),
    getRideDetails: (id) => api.get(`/rides/${id}`),
};

export const bookingAPI = {
    requestBooking: (data) => api.post('/bookings', data),
    respondBooking: (id, data) => api.put(`/bookings/${id}/respond`, data),
    getMyRequests: () => api.get('/bookings/my-requests'),
};

export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getConfig: () => api.get('/admin/config'),
    updateConfig: (data) => api.put('/admin/config', data),
    blockUser: (data) => api.post('/admin/block-user', data)
};

export const paymentAPI = {
    createOrder: (data) => api.post('/payments/create-order', data),
    verifyPayment: (data) => api.post('/payments/verify', data),
};
