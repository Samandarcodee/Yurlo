import { getApiUrl } from '../utils/environment';

const API_BASE = getApiUrl();

class ApiService {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request('/health');
  }

  // User Profile API
  async createUserProfile(profile: any): Promise<any> {
    return this.request('/user/profile', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  async getUserProfile(telegramId: string): Promise<any> {
    return this.request(`/user/profile?telegramId=${telegramId}`);
  }

  async updateUserProfile(telegramId: string, updates: any): Promise<any> {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify({ telegramId, ...updates }),
    });
  }

  async deleteUserProfile(telegramId: string): Promise<any> {
    return this.request('/user/profile', {
      method: 'DELETE',
      body: JSON.stringify({ telegramId }),
    });
  }

  async getAIRecommendations(telegramId: string): Promise<any> {
    return this.request(`/user/recommendations?telegramId=${telegramId}`);
  }

  // Telegram Webhook
  async handleTelegramWebhook(update: any): Promise<any> {
    return this.request('/telegram/webhook', {
      method: 'POST',
      body: JSON.stringify(update),
    });
  }

  // Generic data operations
  async createData(endpoint: string, data: any): Promise<any> {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getData(endpoint: string, params?: Record<string, string>): Promise<any> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request(`${endpoint}${queryString}`);
  }

  async updateData(endpoint: string, data: any): Promise<any> {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteData(endpoint: string, id: string): Promise<any> {
    return this.request(endpoint, {
      method: 'DELETE',
      body: JSON.stringify({ id }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
