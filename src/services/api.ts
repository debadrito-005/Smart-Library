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

const BASE_URL = '/api';

export const api = {
  // QR CODES
  async getQrCodes(): Promise<QrCodesResponse> {
    const res = await fetch(`${BASE_URL}/qr/codes`);
    return res.json();
  },

  // USERS & REGISTRATION
  async registerUser(userData: {
    fullName: string;
    department: string;
    position: string;
    email?: string;
    contactNumber?: string;
  }): Promise<{ success: boolean; message: string; registrationId: string; user: User }> {
    const res = await fetch(`${BASE_URL}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return res.json();
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
    const res = await fetch(`${BASE_URL}/users/lookup/${encodeURIComponent(registrationId.trim())}`);
    return res.json();
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
    const res = await fetch(`${BASE_URL}/users?${query.toString()}`);
    return res.json();
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
    const res = await fetch(`${BASE_URL}/sessions/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async endSession(payload: { sessionId?: string; registrationId?: string }): Promise<{
    success: boolean;
    message: string;
    session?: LibrarySession;
  }> {
    const res = await fetch(`${BASE_URL}/sessions/end`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getCurrentSession(registrationId: string): Promise<{
    success: boolean;
    hasActiveSession: boolean;
    session?: LibrarySession | null;
    remainingSeconds?: number;
    elapsedMinutes?: number;
    serverTime?: string;
  }> {
    const res = await fetch(`${BASE_URL}/sessions/current/${encodeURIComponent(registrationId.trim())}`);
    return res.json();
  },

  async getActiveSessions(): Promise<{
    success: boolean;
    count: number;
    sessions: LibrarySession[];
    serverTime: string;
    serverTimeIST: string;
  }> {
    const res = await fetch(`${BASE_URL}/sessions/active`);
    return res.json();
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
    const res = await fetch(`${BASE_URL}/sessions/history?${query.toString()}`);
    return res.json();
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
    const res = await fetch(`${BASE_URL}/research/papers?${query.toString()}`);
    return res.json();
  },

  async uploadResearchPaper(formData: FormData): Promise<{ success: boolean; message: string; paper?: ResearchPaper }> {
    const res = await fetch(`${BASE_URL}/research/papers`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
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
    const res = await fetch(`${BASE_URL}/research/papers/${id}/communication-status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async deleteResearchPaper(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/research/papers/${id}`, { method: 'DELETE' });
    return res.json();
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
    const res = await fetch(`${BASE_URL}/research/projects?${query.toString()}`);
    return res.json();
  },

  async uploadProjectReport(formData: FormData): Promise<{ success: boolean; message: string; project?: ProjectReport }> {
    const res = await fetch(`${BASE_URL}/research/projects`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  async deleteProjectReport(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/research/projects/${id}`, { method: 'DELETE' });
    return res.json();
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
    const res = await fetch(`${BASE_URL}/research/presentations?${query.toString()}`);
    return res.json();
  },

  async uploadPresentation(formData: FormData): Promise<{ success: boolean; message: string; presentation?: Presentation }> {
    const res = await fetch(`${BASE_URL}/research/presentations`, {
      method: 'POST',
      body: formData,
    });
    return res.json();
  },

  async deletePresentation(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${BASE_URL}/research/presentations/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // DASHBOARD & ADMIN
  async getDashboardStats(): Promise<{ success: boolean } & DashboardStats> {
    const res = await fetch(`${BASE_URL}/admin/stats`);
    return res.json();
  },

  async getCycleReport(): Promise<{ success: boolean; cycle: CycleStatusReport }> {
    const res = await fetch(`${BASE_URL}/cycle-status`);
    return res.json();
  },

  async getCycleHistory(): Promise<{
    success: boolean;
    cycles: RegistrationCycle[];
    activeCycle?: RegistrationCycle;
  }> {
    const res = await fetch(`${BASE_URL}/admin/cycles/history`);
    return res.json();
  },

  async rolloverCycle(): Promise<{ success: boolean; message: string; cycle: CycleStatusReport }> {
    const res = await fetch(`${BASE_URL}/admin/cycles/rollover`, { method: 'POST' });
    return res.json();
  },

  async adminLogin(username: string, password: string): Promise<{ success: boolean; token?: string; message?: string; admin?: any }> {
    const res = await fetch(`${BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    return res.json();
  },

  async getActivityLogs(): Promise<{ success: boolean; logs: ActivityLog[] }> {
    const res = await fetch(`${BASE_URL}/admin/logs`);
    return res.json();
  },

  async getSettings(): Promise<{ success: boolean; settings: AppSettings }> {
    const res = await fetch(`${BASE_URL}/admin/settings`);
    return res.json();
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<{ success: boolean; settings: AppSettings }> {
    const res = await fetch(`${BASE_URL}/admin/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },
};
