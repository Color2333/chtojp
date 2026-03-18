// src/services/api.js
import axios from "axios";

const API_BASE_URL = "/api"; // 使用相对路径，让 Nginx 代理处理
const ADMIN_TOKEN = "admin123"; // 与后端配置的管理员令牌保持一致

const api = {
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

  // Get all characters
  getCharacters: async () => {
    const response = await axios.get(`${API_BASE_URL}/v1/characters`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
      },
    });
    return response.data;
  },

  // Admin API methods
  createCharacter: async (character) => {
    const response = await axios.post(
      `${API_BASE_URL}/v1/admin/characters`,
      character,
      {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
      }
    );
    return response.data;
  },

  updateCharacter: async (id, character) => {
    const response = await axios.put(
      `${API_BASE_URL}/v1/admin/characters/${id}`,
      character,
      {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
      }
    );
    return response.data;
  },

  deleteCharacter: async (id) => {
    const response = await axios.delete(
      `${API_BASE_URL}/v1/admin/characters/${id}`,
      {
        headers: {
          Authorization: `Bearer ${ADMIN_TOKEN}`,
        },
      }
    );
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
};

export default api;
