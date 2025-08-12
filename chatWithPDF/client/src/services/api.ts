const API_BASE_URL = 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  status: boolean;
  message: string;
  data?: T;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface LoginResponse {
  status: boolean;
  message: string;
  accessToken: string;
}

interface RegisterResponse {
  status: boolean;
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
  };
  Verification_Link: string;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
}

interface ChatMessage {
  message: string;
  collectionName: string;
}

interface ChatResponse {
  success: boolean;
  message: string;
  answer: string;
  context: string;
  contextData: any[];
}

interface UploadResponse {
  success: boolean;
  message: string;
  fileData?: {
    id: string;
    filename: string;
    collectionName: string;
    isIndexed: boolean;
    uploadedAt: string;
  };
}

interface UserFile {
  _id: string;
  originalName: string;
  collectionName: string;
  isIndexed: boolean;
  createdAt: string;
  fileSize: number;
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      credentials: 'include',
      ...options,
    };

    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      config.headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };
    } else {
      config.headers = {
        ...options.headers,
      };
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/auth/logout', {
      method: 'POST',
    });
  }

  async getProfile(): Promise<{ status: boolean; message: string; user: UserProfile }> {
    return this.request<{ status: boolean; message: string; user: UserProfile }>('/auth/profile');
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/auth/verify/${token}`, {
      method: 'POST',
    });
  }

  async uploadPDF(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request<UploadResponse>('/pdf/upload', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }

  async getUserFiles(): Promise<{ success: boolean; files: UserFile[] }> {
    return this.request<{ success: boolean; files: UserFile[] }>('/pdf/files');
  }

  async deleteFile(fileId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/pdf/files/${fileId}`, {
      method: 'DELETE',
    });
  }

  async getFileStatus(fileId: string): Promise<{ success: boolean; file: any }> {
    return this.request<{ success: boolean; file: any }>(`/pdf/files/${fileId}/status`);
  }

  async chatWithPDF(message: string, collectionName: string = 'pdf'): Promise<ChatResponse> {
    return this.request<ChatResponse>('/pdf/chat', {
      method: 'POST',
      body: JSON.stringify({ message, collectionName }),
    });
  }

  async uploadVideo(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.request<UploadResponse>('/video/upload', {
      method: 'POST',
      headers: {}, // Remove Content-Type to let browser set it for FormData
      body: formData,
    });
  }
}

export const apiService = new ApiService();
export type { LoginRequest, RegisterRequest, UserProfile, ApiResponse, ChatMessage, ChatResponse, UploadResponse, UserFile };