import {
  User,
  DashboardStats,
  QrCodesResponse,
  LibrarySession,
  ResearchPaper,
  ProjectReport,
  Presentation,
  CycleStatusReport,
  RegistrationCycle,
  ActivityLog,
  AppSettings,
  CommunicationStatus,
} from '../types';
import { localEngine } from './localEngine';

const BASE_URL = '/api';

// Helper to safely parse JSON or detect static hosting / 404 HTML fallback
async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    // If not OK or HTML returned (Vercel SPA fallback), return null to trigger localEngine
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return null;
    const data = await res.json();
    return data;
  } catch (e) {
    return null;
  }
}

export const api = {
  // QR CODES (Permanent Static)
  async getQrCodes(): Promise<QrCodesResponse> {
    const remote = await safeFetchJson<QrCodesResponse>(`${BASE_URL}/qr/codes`);
    if (remote && remote.success && remote.qr1 && remote.qr2) {
      return remote;
    }
    // Fallback: Generate high-res static QR codes client-side
    return localEngine.getQrCodes();
  },

  // USERS & REGISTRATION
  async registerUser(userData: {
    fullName: string;
    department: string;
    position: string;
    email?: string;
    contactNumber?: string;
  }): Promise<{ success: boolean; message: string; registrationId: string; user: User }> {
    const remote = await safeFetchJson<{ success: boolean; message: string; registrationId: string; user: User }>(
      `${BASE_URL}/users/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      }
    );
    if (remote && remote.success) return remote;
    return localEngine.registerUser(userData);
  },

  async lookupUser(registrationId: string): Promise<{
    success: boolean;
    user?: User;
    activeSession?: LibrarySession | null;
    recentSessions?: LibrarySession[];
    documents?: {
      papers: ResearchPaper[];
      projects: ProjectReport[];
      presentations: Presentation[];
    };
    message?: string;
  }> {
    const remote = await safeFetchJson<any>(
      `${BASE_URL}/users/lookup/${encodeURIComponent(registrationId.trim())}`
    );
    if (remote && remote.success) return remote;
    return localEngine.lookupUser(registrationId);
  },

  async getUsers(params?: { search?: string; department?: string; position?: string }): Promise<{
    success: boolean;
    count: number;
    users: User[];
  }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.department) query.set('department', params.department);
    if (params?.position) query.set('position', params.position);
    const remote = await safeFetchJson<any>(`${BASE_URL}/users?${query.toString()}`);
    if (remote && remote.success) return remote;
    return localEngine.getUsers(params);
  },

  getUsersExportUrl(): string {
    return `${BASE_URL}/users/export/csv`;
  },

  // SESSIONS
  async startSession(payload: {
    registrationId: string;
    durationHours?: number;
    purpose?: string;
    workstation?: string;
  }): Promise<{
    success: boolean;
    isExisting?: boolean;
    message: string;
    session?: LibrarySession;
    remainingSeconds?: number;
    serverTime?: string;
  }> {
    const remote = await safeFetchJson<any>(`${BASE_URL}/sessions/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (remote && remote.success) return remote;
    return localEngine.startSession(payload);
  },

  async endSession(payload: { sessionId?: string; registrationId?: string }): Promise<{
    success: boolean;
    message: string;
    session?: LibrarySession;
  }> {
    const remote = await safeFetchJson<any>(`${BASE_URL}/sessions/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (remote && remote.success) return remote;
    return localEngine.endSession(payload);
  },

  async getCurrentSession(registrationId: string): Promise<{
    success: boolean;
    hasActiveSession: boolean;
    session?: LibrarySession | null;
    remainingSeconds?: number;
    elapsedMinutes?: number;
    serverTime?: string;
  }> {
    const remote = await safeFetchJson<any>(
      `${BASE_URL}/sessions/current/${encodeURIComponent(registrationId.trim())}`
    );
    if (remote && remote.success) return remote;
    return localEngine.getCurrentSession(registrationId);
  },

  async getActiveSessions(): Promise<{
    success: boolean;
    count: number;
    sessions: LibrarySession[];
    serverTime: string;
    serverTimeIST: string;
  }> {
    const remote = await safeFetchJson<any>(`${BASE_URL}/sessions/active`);
    if (remote && remote.success) return remote;
    return localEngine.getActiveSessions();
  },

  async getSessionHistory(params?: { status?: string; department?: string; search?: string }): Promise<{
    success: boolean;
    count: number;
    sessions: LibrarySession[];
  }> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.department) query.set('department', params.department);
    if (params?.search) query.set('search', params.search);
    const remote = await safeFetchJson<any>(`${BASE_URL}/sessions/history?${query.toString()}`);
    if (remote && remote.success) return remote;
    return localEngine.getSessionHistory(params);
  },

  // RESEARCH PAPERS
  async getResearchPapers(params?: { communicationStatus?: string; department?: string; search?: string }): Promise<{
    success: boolean;
    count: number;
    papers: ResearchPaper[];
    summary: { total: number; communicated: number; notCommunicated: number };
  }> {
    const query = new URLSearchParams();
    if (params?.communicationStatus) query.set('communicationStatus', params.communicationStatus);
    if (params?.department) query.set('department', params.department);
    if (params?.search) query.set('search', params.search);
    const remote = await safeFetchJson<any>(`${BASE_URL}/research/papers?${query.toString()}`);
    if (remote && remote.success) return remote;
    return localEngine.getResearchPapers(params);
  },

  async uploadResearchPaper(formData: FormData): Promise<{ success: boolean; message: string; paper?: ResearchPaper }> {
    const remote = await safeFetchJson<any>(`${BASE_URL}/research/papers`, {
      method: 'POST',
      body: formData,
    });
    if (remote && remote.success) return remote;
    return localEngine.uploadResearchPaper(formData);
  },

  async updatePaperCommunicationStatus(
    id: string,
    payload: {
      communicationStatus: CommunicationStatus;
      journalConferenceName?: string;
      communicationDate?: string;
      doiOrPaperLink?: string;
      publicationStatus?: string;
    }
  ): Promise<{ success: boolean; message: string; paper?: ResearchPaper }> {
    const remote = await safeFetchJson<any>(`${BASE_URL}/research/papers/${id}/communication-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (remote && remote.success) return remote;
    return localEngine.updatePaperCommunicationStatus(id, payload);
  },

  async deleteResearchPaper(id: string): Promise<{ success: boolean; message: string }> {
    const remote = await safeFetchJson<any>(`${BASE_URL}/research/papers/${id}`, { method: 'DELETE' });
    if (remote && remote.success) return remote;
    return localEngine.deleteResearchPaper(id);
  },

  // PROJECT REPORTS
  async getProjectReports(params?: { department?: string; search?: string }): Promise<{
    success: boolean;
    count: number;
    projects: ProjectReport[];
    total: number;
  }> {
    const query = new URLSearchParams();
    if (params?.department) query.set('department', params.department);
    if (params?.search) query.set('search', params.search);
    const remote = await safeFetchJson<any>(`${BASE_URL}/research/projects?${query.toString()}`);
    if (remote && remote.success) return remote;
    return localEngine.getProjectReports(params);
  },

  async uploadProjectReport(formData: FormData): Promise<{ success: boolean; message: string; project?: ProjectReport }> {
    const remote = await safeFetchJson<any>(`${BASE_URL}/research/projects`, {
      method: 'POST',
      body: formData,
    });
    if (remote && remote.success) return remote;
    return localEngine.uploadProjectReport(formData);
  },

  async deleteProjectReport(id: string): Promise<{ success: boolean; message: string }> {
    const remote = await safeFetchJson<any>(`${BASE_URL}/research/projects/${id}`, { method: 'DELETE' });
    if (remote && remote.success) return remote;
    return localEngine.deleteProjectReport(id);
  },

  // PPT PRESENTATIONS
  async getPresentations(params?: { department?: string; search?: string }): Promise<{
    success: boolean;
    count: number;
    presentations: Presentation[];
    total: number;
  }> {
    const query = new URLSearchParams();
    if (params?.department) query.set('department', params.department);
    if (params?.search) query.set('search', params.search);
    const remote = await safeFetchJson<any>(`${BASE_URL}/research/presentations?${query.toString()}`);
    if (remote && remote.success) return remote;
    return localEngine.getPresentations(params);
  },

  async uploadPresentation(formData: FormData): Promise<{ success: boolean; message: string; presentation?: Presentation }> {
    const remote = await safeFetchJson<any>(`${BASE_URL}/research/presentations`, {
      method: 'POST',
      body: formData,
    });
    if (remote && remote.success) return remote;
    return localEngine.uploadPresentation(formData);
  },

  async deletePresentation(id: string): Promise<{ success: boolean; message: string }> {
    const remote = await safeFetchJson<any>(`${BASE_URL}/research/presentations/${id}`, { method: 'DELETE' });
    if (remote && remote.success) return remote;
    return localEngine.deletePresentation(id);
  },

  // DASHBOARD & ADMIN
  async getDashboardStats(): Promise<{ success: boolean } & DashboardStats> {
    const remote = await safeFetchJson<{ success: boolean } & DashboardStats>(`${BASE_URL}/admin/stats`);
    if (remote && remote.success && remote.kpis) return remote;
    return localEngine.getDashboardStats();
  },

  async getCycleReport(): Promise<{ success: boolean; cycle: CycleStatusReport }> {
    const remote = await safeFetchJson<{ success: boolean; cycle: CycleStatusReport }>(`${BASE_URL}/cycle-status`);
    if (remote && remote.success && remote.cycle) return remote;
    return localEngine.getCycleReport();
  },

  async getCycleHistory(): Promise<{
    success: boolean;
    cycles: RegistrationCycle[];
    activeCycle?: RegistrationCycle;
  }> {
    const remote = await safeFetchJson<any>(`${BASE_URL}/admin/cycles/history`);
    if (remote && remote.success) return remote;
    return localEngine.getCycleHistory();
  },

  async rolloverCycle(): Promise<{ success: boolean; message: string; cycle: CycleStatusReport }> {
    const remote = await safeFetchJson<any>(`${BASE_URL}/admin/cycles/rollover`, { method: 'POST' });
    if (remote && remote.success) return remote;
    return localEngine.rolloverCycle();
  },

  async adminLogin(username: string, password: string): Promise<{ success: boolean; token?: string; message?: string; admin?: any }> {
    const remote = await safeFetchJson<any>(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (remote && remote.success) return remote;
    return localEngine.adminLogin(username, password);
  },

  async getActivityLogs(): Promise<{ success: boolean; logs: ActivityLog[] }> {
    const remote = await safeFetchJson<any>(`${BASE_URL}/admin/logs`);
    if (remote && remote.success) return remote;
    return { success: true, logs: [] };
  },

  async getSettings(): Promise<{ success: boolean; settings: AppSettings }> {
    const remote = await safeFetchJson<any>(`${BASE_URL}/admin/settings`);
    if (remote && remote.success) return remote;
    return localEngine.getSettings();
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<{ success: boolean; settings: AppSettings }> {
    const remote = await safeFetchJson<any>(`${BASE_URL}/admin/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (remote && remote.success) return remote;
    return localEngine.updateSettings(settings);
  },
};
