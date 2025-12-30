import axios, { AxiosInstance, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - Add JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle 401
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', token);
  }

  private clearToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
  }

  // Auth
  async register(data: { email: string; password: string; name: string }) {
    const response = await this.client.post('/auth/register', data);
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    return response.data;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.client.post('/auth/login', data);
    if (response.data.access_token) {
      this.setToken(response.data.access_token);
    }
    return response.data;
  }

  logout() {
    this.clearToken();
  }

  // Users
  async getMe() {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async updateProfile(data: any) {
    const response = await this.client.patch('/users/me', data);
    return response.data;
  }

  // Orgs
  async getOrgs() {
    const response = await this.client.get('/orgs');
    return response.data;
  }

  async getOrg(id: string) {
    const response = await this.client.get(`/orgs/${id}`);
    return response.data;
  }

  async createOrg(data: { name: string; slug: string; description?: string }) {
    const response = await this.client.post('/orgs', data);
    return response.data;
  }

  async getOrgMembers(orgId: string) {
    const response = await this.client.get(`/orgs/${orgId}/members`);
    return response.data;
  }

  async addOrgMember(orgId: string, data: { userId: string; role: string }) {
    const response = await this.client.post(`/orgs/${orgId}/members`, data);
    return response.data;
  }

  async removeOrgMember(orgId: string, userId: string) {
    const response = await this.client.delete(`/orgs/${orgId}/members/${userId}`);
    return response.data;
  }

  // Projects
  async getProjects(orgId: string) {
    const response = await this.client.get(`/projects?orgId=${orgId}`);
    return response.data;
  }

  async getProject(id: string) {
    const response = await this.client.get(`/projects/${id}`);
    return response.data;
  }

  async createProject(data: { orgId: string; name: string; description?: string; initialContent?: any }) {
    const response = await this.client.post('/projects', data);
    return response.data;
  }

  async updateProject(id: string, data: any) {
    const response = await this.client.patch(`/projects/${id}`, data);
    return response.data;
  }

  async deleteProject(id: string) {
    const response = await this.client.delete(`/projects/${id}`);
    return response.data;
  }

  async getProjectVersions(projectId: string) {
    const response = await this.client.get(`/projects/${projectId}/versions`);
    return response.data;
  }

  async createProjectVersion(projectId: string, data: { content: any; commitMessage?: string }) {
    const response = await this.client.post(`/projects/${projectId}/versions`, data);
    return response.data;
  }

  async getProjectVersion(versionId: string) {
    const response = await this.client.get(`/projects/versions/${versionId}`);
    return response.data;
  }

  // Compile
  async createCompileJob(versionId: string) {
    const response = await this.client.post('/compile', { versionId });
    return response.data;
  }

  async getCompileJob(id: string) {
    const response = await this.client.get(`/compile/${id}`);
    return response.data;
  }

  async getVersionCompileJobs(versionId: string) {
    const response = await this.client.get(`/compile/version/${versionId}`);
    return response.data;
  }
}

export const api = new ApiClient();
