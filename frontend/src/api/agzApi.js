import axiosConfig from './axiosConfig';

export const agzAPI = {
    getSession: (requestId) => axiosConfig.get(`/agz/session/${requestId}`),
    confirmInterest: (requestId) => axiosConfig.post(`/agz/session/${requestId}/confirm`),
    getChatMessages: (sessionId) => axiosConfig.get(`/agz/chat/${sessionId}`),
    sendChatMessage: (payload) => axiosConfig.post('/agz/chat', payload),
    syncStatus: (requestId) => axiosConfig.get(`/agz/sync/${requestId}`),
};
