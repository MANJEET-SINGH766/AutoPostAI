const API_BASE_URL = 'http://localhost:3000/api';

// Helper to get authorization headers
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const api = {
  // Authentication
  auth: {
    login: async (email: string, password: string) => {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      
      // Store user token
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, _id: data._id }));
      return data;
    },
    register: async (email: string, password: string, name: string) => {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, _id: data._id }));
      return data;
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    isAuthenticated: (): boolean => {
      return !!localStorage.getItem('token');
    },
    getUser: () => {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
  },

  // Social Auth Connections (Zernio Integration)
  socialAuth: {
    getConnectUrl: async (platform: string) => {
      const res = await fetch(`${API_BASE_URL}/social-auth/connect/${platform}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate auth url');
      return data; // returns { url: '...' }
    },
    syncAccounts: async () => {
      const res = await fetch(`${API_BASE_URL}/social-auth/sync`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to sync accounts');
      return data; // returns array of synced accounts
    },
    disconnectAccount: async (accountId: string) => {
      const res = await fetch(`${API_BASE_URL}/social-auth/${accountId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to disconnect account');
      return data;
    }
  },

  // Post Operations
  posts: {
    getPosts: async () => {
      const res = await fetch(`${API_BASE_URL}/posts`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch posts');
      return data;
    },
    schedulePost: async (postData: {
      accounts: string[];
      content: {
        text: string;
        mediaUrls?: string[];
      };
      scheduledAt: string;
    }) => {
      const res = await fetch(`${API_BASE_URL}/posts/schedule`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(postData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to schedule post');
      return data;
    },
    cancelPost: async (postId: string) => {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}/cancel`, {
        method: 'POST',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel post');
      return data;
    },
    deletePost: async (postId: string) => {
      const res = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete post');
      return data;
    },
    uploadMedia: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/posts/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to upload media');
      return data; // returns { url: '...' }
    }
  },

  // AI Content Generator Operations
  ai: {
    generateContent: async (params: {
      platform: string;
      topic: string;
      tone: string;
      length: string;
      targetAudience: string;
      hashtags: boolean;
      emojis: boolean;
      callToAction: boolean;
    }) => {
      const res = await fetch(`${API_BASE_URL}/ai/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to generate AI content');
      return data;
    }
  }
};
