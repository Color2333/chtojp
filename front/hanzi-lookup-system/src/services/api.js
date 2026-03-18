// src/services/api.js
import axios from "axios";

const API_BASE_URL = "/api"; // 使用相对路径，让 Nginx 代理处理

// localStorage 键名
const ADMIN_TOKEN_KEY = "admin_jwt_token";

/**
 * 获取存储的管理员 JWT Token
 * @returns {string} JWT Token 或空字符串
 */
const getAdminToken = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ADMIN_TOKEN_KEY) || "";
};

/**
 * 保存管理员 JWT Token
 * @param {string} token - JWT Token
 */
const setAdminToken = (token) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

/**
 * 清除管理员 JWT Token
 */
const clearAdminToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

/**
 * 检查是否已登录
 * @returns {boolean} 是否已登录
 */
const isAdminLoggedIn = () => {
  return !!getAdminToken();
};

/**
 * 获取认证请求头
 * @returns {object} 包含 Authorization 的请求头
 */
const getAuthHeaders = () => {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const api = {
  // ==================== 公共 API ====================

  // Search for characters
  searchCharacters: async (query, lang, limit = 20, offset = 0) => {
    const response = await axios.get(`${API_BASE_URL}/v1/search`, {
      params: { q: query, lang, limit, offset },
    });
    return response.data;
  },

  // Get character details by ID
  getCharacterById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/v1/characters/${id}`);
    return response.data;
  },

  // Get random character
  getRandomCharacter: async () => {
    const response = await axios.get(`${API_BASE_URL}/v1/characters/random`);
    return response.data;
  },

  // Get characters by level
  getCharactersByLevel: async (level, limit = 20, offset = 0) => {
    const response = await axios.get(
      `${API_BASE_URL}/v1/characters/level/${encodeURIComponent(level)}`,
      {
        params: { limit, offset },
      }
    );
    return response.data;
  },

  // Get all levels
  getLevels: async () => {
    const response = await axios.get(`${API_BASE_URL}/v1/characters/levels`);
    return response.data;
  },

  // Get database statistics
  getStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/v1/stats`);
    return response.data;
  },

  // 获取热门搜索词
  getHotSearches: async (limit = 5) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/v1/search/hot`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching hot searches:", error);
      throw error;
    }
  },

  // 记录搜索词
  recordSearch: async (searchTerm) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/v1/search/record`, {
        search_term: searchTerm,
      });
      return response.data;
    } catch (error) {
      console.error("Error recording search:", error);
      throw error;
    }
  },

  // ==================== 管理员 API ====================

  /**
   * 管理员登录
   * @param {string} password - 管理员密码
   * @returns {object} 登录响应，包含 access_token
   */
  adminLogin: async (password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/v1/admin/login`, {
        password,
      });
      // 保存 JWT Token
      if (response.data.access_token) {
        setAdminToken(response.data.access_token);
      }
      return response.data;
    } catch (error) {
      console.error("Error during admin login:", error);
      throw error;
    }
  },

  /**
   * 验证管理员令牌
   * @returns {object} 验证结果
   */
  verifyAdminToken: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/v1/admin/verify`, {
        headers: getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      // Token 无效时清除
      if (error.response?.status === 401) {
        clearAdminToken();
      }
      throw error;
    }
  },

  /**
   * 管理员登出
   */
  adminLogout: () => {
    clearAdminToken();
  },

  // Get all characters (paginated) - 需要认证
  getCharacters: async (page = 1, size = 20) => {
    const offset = (page - 1) * size;
    const response = await axios.get(`${API_BASE_URL}/v1/characters`, {
      params: { limit: size, offset },
      headers: getAuthHeaders(),
    });
    return response.data;
  },

  // Admin API methods - 需要认证
  createCharacter: async (character) => {
    const response = await axios.post(
      `${API_BASE_URL}/v1/admin/characters`,
      character,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  },

  updateCharacter: async (id, character) => {
    const response = await axios.put(
      `${API_BASE_URL}/v1/admin/characters/${id}`,
      character,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  },

  deleteCharacter: async (id) => {
    const response = await axios.delete(
      `${API_BASE_URL}/v1/admin/characters/${id}`,
      {
        headers: getAuthHeaders(),
      }
    );
    return response.data;
  },

  // 导出工具函数供外部使用
  getAdminToken,
  setAdminToken,
  clearAdminToken,
  isAdminLoggedIn,
};

export default api;
