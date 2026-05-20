import axios from 'axios';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
});

const clearAuthStorage = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
  localStorage.removeItem('member');
  localStorage.removeItem('userId');
  localStorage.removeItem('role');
  document.cookie = 'member=; Max-Age=0; path=/';
};

const getStoredToken = () => {
  let token =
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token');

  if (!token) {
    const member = localStorage.getItem('member');
    if (member) {
      try {
        const parsed = JSON.parse(member);
        token = parsed.accessToken || parsed.token;
      } catch (error) {
        clearAuthStorage();
      }
    }
  }

  return token;
};

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (config.skipAuth) {
    delete config.headers.Authorization;
  } else if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || '';
    const hasToken = Boolean(getStoredToken());
    const isAuthRequest = requestUrl.startsWith('/auth/');

    if ((status === 401 || status === 403) && hasToken && !isAuthRequest) {
      clearAuthStorage();
      window.alert('로그인이 만료되었습니다. 다시 로그인해 주세요.');
      window.location.href = '/';
    }

    return Promise.reject(error);
  }
);

export const login = async (payload) =>
  (await api.post('/auth/login', payload)).data;

export const signup = async (payload) =>
  (await api.post('/auth/signup', payload)).data;

export const fetchPublicOverview = async () =>
  (await api.get('/public/overview')).data;


export const sendPasswordResetCode = async (email) =>
  (await api.post('/auth/password-reset/send-code', { email }, { skipAuth: true })).data;

export const verifyPasswordResetCode = async (email, code) =>
  (await api.post('/auth/password-reset/verify-code', { email, code }, { skipAuth: true })).data;

export const confirmPasswordReset = async (email, resetToken, newPassword) =>
  (await api.post('/auth/password-reset/confirm', { email, resetToken, newPassword }, { skipAuth: true })).data;


export const fetchMyProfile = async () =>
  (await api.get('/api/users/me/profile')).data;

export const updateMyProfile = async (payload) =>
  (await api.put('/api/users/me/profile', payload)).data;

export const fetchPublicProfile = async (userId) =>
  (await api.get(`/api/users/${userId}/public-profile`)).data;

export const uploadMyProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  return (
    await api.post('/api/users/me/profile-image', formData)
  ).data;
};

export const fetchPublicUsers = async (role, keyword = '') =>
  (await api.get('/api/users/public-search', { params: { role, keyword } })).data;

export const fetchChatRoom = async (targetUserId) =>
  (await api.get(`/api/chat/rooms/${targetUserId}`)).data;

export const fetchChatRooms = async () =>
  (await api.get('/api/chat/rooms')).data;

export const markChatRoomRead = async (targetUserId) =>
  (await api.post(`/api/chat/rooms/${targetUserId}/read`)).data;

export const sendChatMessage = async (targetUserId, content) =>
  (await api.post(`/api/chat/rooms/${targetUserId}/messages`, { content })).data;

export const createInquiry = async (payload) =>
  (await api.post('/public/inquiries', payload)).data;

//영수증 
export const fetchDrivingRoute = async ({
  startLat,
  startLng,
  endLat,
  endLng,
}) =>
  (
    await api.get('/public/routes/driving', {
      params: { startLat, startLng, endLat, endLng },
    })
  ).data;

export const fetchShipments = async (page = 0, size = 10) =>
  (await api.get('/api/shipments', { params: { page, size } })).data;

export const fetchShipment = async (id) =>
  (await api.get(`/api/shipments/${id}`)).data;

export const fetchBookmarks = async () =>
  (await api.get('/api/shipments/bookmarks')).data;

export const createShipment = async (payload) =>
  (await api.post('/api/shipments', payload)).data;

export const updateShipment = async (shipmentId, payload) =>
  (await api.put(`/api/shipments/${shipmentId}`, payload)).data;

export const createOffer = async (shipmentId, payload) =>
  (await api.post(`/api/shipments/${shipmentId}/offers`, payload)).data;

export const acceptOffer = async (offerId) =>
  (await api.post(`/api/shipments/offers/${offerId}/accept`)).data;

export const startTrip = async (shipmentId) =>
  (await api.post(`/api/shipments/${shipmentId}/start`)).data;

export const updateLocation = async (shipmentId, payload) =>
  (await api.post(`/api/shipments/${shipmentId}/locations`, payload)).data;

export const completeTrip = async (shipmentId, payload) =>
  (await api.post(`/api/shipments/${shipmentId}/complete`, payload)).data;

export const cancelShipment = async (shipmentId, payload) =>
  (await api.post(`/api/shipments/${shipmentId}/cancel`, payload)).data;

export const toggleBookmark = async (shipmentId) =>
  (await api.post(`/api/shipments/${shipmentId}/bookmark`)).data;

export const fetchFinanceSummary = async () =>
  (await api.get('/api/finance/summary')).data;

export const fetchFinanceTransactions = async () =>
  (await api.get('/api/finance/transactions')).data;

export const fetchReceipt = async (shipmentId) =>
  (await api.get(`/api/finance/receipt/${shipmentId}`)).data;
export const payShipment = async (shipmentId, payload = {}) =>
  (await api.post(`/api/finance/shipments/${shipmentId}/pay`, payload)).data;

export const fetchNotifications = async () =>
  (await api.get('/api/interactions/notifications')).data;

export const fetchAllNotifications = async () =>
  (await api.get('/api/interactions/notifications/all')).data;

export const markNotificationRead = async (notificationId) =>
  (await api.post(`/api/interactions/notifications/${notificationId}/read`)).data;

export const markAllNotificationsRead = async () =>
  (await api.post('/api/interactions/notifications/read-all')).data;

export const fetchRatingsDashboard = async () =>
  (await api.get('/api/ratings/dashboard')).data;

export const createRating = async (shipmentId, payload) =>
  (await api.post(`/api/ratings/shipments/${shipmentId}`, payload)).data;

export const fetchAdminRecentRatings = async () =>
  (await api.get('/api/ratings/admin/recent')).data;

export const fetchAdminDashboard = async () =>
  (await api.get('/api/admin/dashboard')).data;

export const fetchAdminMembers = async () =>
  (await api.get('/api/admin/members')).data;

export const updateMemberRole = async (memberId, role) =>
  (await api.patch(`/api/admin/members/${memberId}/role`, { role })).data;

export const updateMemberStatus = async (memberId, status) =>
  (await api.patch(`/api/admin/members/${memberId}/status`, { status })).data;

export const updateMemberPenalty = async (memberId, payload) =>
  (await api.patch(`/api/admin/members/${memberId}/penalty`, payload)).data;

export const fetchAdminShipments = async () =>
  (await api.get('/api/admin/shipments')).data;

export const forceShipmentStatus = async (shipmentId, status, note = '') =>
  (
    await api.patch(`/api/admin/shipments/${shipmentId}/status`, {
      status,
      note,
    })
  ).data;

export const fetchAdminNotices = async () =>
  (await api.get('/api/admin/notices')).data;

export const createAdminNotice = async (payload) =>
  (await api.post('/api/admin/notices', payload)).data;

export const updateAdminNotice = async (id, payload) =>
  (await api.put(`/api/admin/notices/${id}`, payload)).data;

export const deleteAdminNotice = async (id) =>
  (await api.delete(`/api/admin/notices/${id}`)).data;

export const fetchAdminFaqs = async () =>
  (await api.get('/api/admin/faqs')).data;

export const createAdminFaq = async (payload) =>
  (await api.post('/api/admin/faqs', payload)).data;

export const updateAdminFaq = async (id, payload) =>
  (await api.put(`/api/admin/faqs/${id}`, payload)).data;

export const deleteAdminFaq = async (id) =>
  (await api.delete(`/api/admin/faqs/${id}`)).data;

export const fetchAdminInquiries = async () =>
  (await api.get('/api/admin/inquiries')).data;

export const answerAdminInquiry = async (id, content) =>
  (await api.post(`/api/admin/inquiries/${id}/answer`, { content })).data;

export const fetchAdminReports = async () =>
  (await api.get('/api/admin/reports')).data;

export const fetchAdminDisputes = async () =>
  (await api.get('/api/admin/disputes')).data;

export const resolveAdminDispute = async (id, status) =>
  (await api.post(`/api/admin/disputes/${id}/resolve`, { status })).data;

export const fetchAdminActionLogs = async () =>
  (await api.get('/api/admin/action-logs')).data;

export default api;
export const createQuickDrawRoom = async () =>
  (await api.post('/api/game/quickdraw/rooms')).data;

export const joinQuickDrawRoom = async (roomCode) =>
  (await api.post('/api/game/quickdraw/rooms/join', { roomCode })).data;

export const getQuickDrawRoomState = async (roomCode) =>
  (await api.get(`/api/game/quickdraw/rooms/${roomCode}`)).data;

export const markQuickDrawReady = async (roomCode) =>
  (await api.post(`/api/game/quickdraw/rooms/${roomCode}/ready`)).data;

export const shootQuickDraw = async (roomCode) =>
  (await api.post(`/api/game/quickdraw/rooms/${roomCode}/shoot`)).data;

export const resetQuickDrawRoom = async (roomCode) =>
  (await api.post(`/api/game/quickdraw/rooms/${roomCode}/reset`)).data;

export const leaveQuickDrawRoom = async (roomCode) =>
  (await api.delete(`/api/game/quickdraw/rooms/${roomCode}`)).data;


export const createRoundsLiteRoom = async () =>
  (await api.post('/api/game/rounds-lite/rooms')).data;

export const joinRoundsLiteRoom = async (roomCode) =>
  (await api.post('/api/game/rounds-lite/rooms/join', { roomCode })).data;

export const getRoundsLiteState = async (roomCode) =>
  (await api.get(`/api/game/rounds-lite/rooms/${roomCode}`)).data;

export const readyRoundsLiteRoom = async (roomCode) =>
  (await api.post(`/api/game/rounds-lite/rooms/${roomCode}/ready`)).data;

export const sendRoundsLiteInput = async (roomCode, payload) =>
  (await api.post(`/api/game/rounds-lite/rooms/${roomCode}/input`, payload)).data;

export const selectRoundsLiteCard = async (roomCode, cardKey) =>
  (await api.post(`/api/game/rounds-lite/rooms/${roomCode}/select-card`, { cardKey })).data;

export const resetRoundsLiteRoom = async (roomCode) =>
  (await api.post(`/api/game/rounds-lite/rooms/${roomCode}/reset`)).data;

export const leaveRoundsLiteRoom = async (roomCode) =>
  (await api.delete(`/api/game/rounds-lite/rooms/${roomCode}`)).data;


export const joinRoundsLiteMatchmaking = async () =>
  (await api.post('/api/game/rounds-lite/matchmaking/join')).data;

export const cancelRoundsLiteMatchmaking = async (roomCode) =>
  (await api.post(`/api/game/rounds-lite/matchmaking/${roomCode}/cancel`)).data;
export const askAssistant = async (payload) =>
  (await api.post('/api/assistant/chat', payload)).data;

export const fetchAdminAssistantLogs = async () =>
  (await api.get('/api/admin/assistant/logs')).data;

export const updateAdminAssistantLog = async (id, payload) =>
  (await api.patch(`/api/admin/assistant/logs/${id}`, payload)).data;

export const deleteAdminAssistantLog = async (id) =>
  (await api.delete(`/api/admin/assistant/logs/${id}`)).data;

export const fetchAdminAssistantGuidelines = async () =>
  (await api.get('/api/admin/assistant/guidelines')).data;

export const createAdminAssistantGuideline = async (payload) =>
  (await api.post('/api/admin/assistant/guidelines', payload)).data;

export const updateAdminAssistantGuideline = async (id, payload) =>
  (await api.put(`/api/admin/assistant/guidelines/${id}`, payload)).data;

export const deleteAdminAssistantGuideline = async (id) =>
  (await api.delete(`/api/admin/assistant/guidelines/${id}`)).data;

export const kakaoLogin = async (accessToken, role = null) =>
  (
    await api.post(
      '/auth/kakao',
      { accessToken, role },
      { skipAuth: true },
    )
  ).data;
