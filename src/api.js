import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'parsai_access_token';

async function call(path, options = {}) {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || `API error ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
  } finally { clearTimeout(timer); }
}

export const api = {
  health: () => call('/health'),
  tools: (category) => call(`/v1/tools${category ? `?category=${encodeURIComponent(category)}` : ''}`),
  recommendTools: (query, language = 'fa', limit = 5) => call('/v1/tools/recommend', {
    method: 'POST',
    body: JSON.stringify({ query, language, limit }),
  }),
  requestOtp: (phone, language) => call('/v1/auth/request-otp', { method: 'POST', body: JSON.stringify({ phone, language }) }),
  verifyOtp: async (phone, code, language) => {
    const result = await call('/v1/auth/verify-otp', { method: 'POST', body: JSON.stringify({ phone, code, language }) });
    await AsyncStorage.setItem(TOKEN_KEY, result.access_token);
    return result;
  },
  generatePrompt: (payload) => call('/v1/prompts/generate', { method: 'POST', body: JSON.stringify(payload) }),
  chat: (message, language) => call('/v1/chat', { method: 'POST', body: JSON.stringify({ message, language }) }),
  subscription: () => call('/v1/subscription'),
  generateImage: (prompt, size = '1024x1024') => call('/v1/images/generate', { method: 'POST', body: JSON.stringify({ prompt, size }) }),
  videoBrief: (idea, duration = 6, language = 'fa') => call('/v1/videos/brief', { method: 'POST', body: JSON.stringify({ idea, duration, language }) }),
  codeAssist: (code, task = 'review', language = 'fa') => call('/v1/code/assist', { method: 'POST', body: JSON.stringify({ code, task, language }) }),
  favorites: () => call('/v1/favorites'),
  addFavorite: (toolId) => call(`/v1/favorites/${toolId}`, { method: 'PUT' }),
  removeFavorite: (toolId) => call(`/v1/favorites/${toolId}`, { method: 'DELETE' }),
  logout: () => AsyncStorage.removeItem(TOKEN_KEY),
};
