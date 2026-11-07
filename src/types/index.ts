export type UserPosition = 'Student' | 'Research Scholar' | 'Faculty' | 'Professor' | 'Staff' | 'Other';

export interface User {
  id: string;
  registrationId: string;
  fullName: string;
  department: string;
  position: UserPosition;
  email?: string;
  contactNumber?: string;
  createdAt: string;
  createdAtIST: string;
  cycleId: string;
  cycleNumber: number;
  hasActiveSession?: boolean;
  activeSessionId?: string | null;
  documentsSummary?: {
    researchPapers: number;
    projectReports: number;
    presentations: number;
    total: number;
  };
}

export interface RegistrationCycle {
  id: string;
  cycleNumber: number;
  startTime: string;
  endTime: string;
  startTimeIST: string;
  endTimeIST: string;
  status: 'OPEN' | 'CLOSED';
  registrationsCount: number;
  closedAt?: string;
}

export interface CycleStatusReport {
  status: 'OPEN' | 'CLOSED';
  cycleId: string;
  cycleNumber: number;
  startTime: string;
  endTime: string;
  startTimeIST: string;
  endTimeIST: string;
  remainingSeconds: number;
  todayRegistrations: number;
  totalLifetimeRegistrations: number;
  timezone: string;
  isExpired: boolean;
}

export interface LibrarySession {
  id: string;
  userId: string;
  registrationId: string;
  userName: string;
  department: string;
  position: string;
  startTime: string;
  startTimeIST: string;
  scheduledEndTime: string;
  actualEndTime: string | null;
  actualEndTimeIST: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  durationMinutes: number;
  purpose?: string;
  workstation?: string;
  remainingSeconds?: number;
  elapsedMinutes?: number;
}

export type CommunicationStatus = 'Communicated' | 'Not Communicated';

export interface ResearchPaper {
  id: string;
  title: string;
  researcherName: string;
  department: string;
  researchDomain: string;
  description: string;
  communicationStatus: CommunicationStatus;
  communicationDate?: string;
  journalConferenceName?: string;
  publicationStatus?: string;
  doiOrPaperLink?: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  registrationId?: string;
  createdAt: string;
  createdAtIST: string;
}

export interface ProjectReport {
  id: string;
  projectTitle: string;
  description: string;
  department: string;
  projectDomain: string;
  projectGuideSupervisor: string;
  submissionDate: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  registrationId?: string;
  createdAt: string;
  createdAtIST: string;
}

export interface Presentation {
  id: string;
  presentationTitle: string;
  presenterName: string;
  department: string;
  presentationDomain: string;
  presentationDate: string;
  fileName?: string;
  fileUrl?: string;
  fileSize?: number;
  registrationId?: string;
  createdAt: string;
  createdAtIST: string;
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  timestampIST: string;
  action: string;
  details: string;
  category: 'REGISTRATION' | 'SESSION' | 'DOCUMENT' | 'AUTH' | 'CYCLE';
  actor: string;
}

export interface AppSettings {
  libraryName: string;
  institutionName: string;
  defaultSessionDurationHours: number;
  maxSessionDurationHours: number;
  autoExpireSessions: boolean;
  allowManualCycleRollover: boolean;
  timezone: string;
  contactEmail: string;
}

export interface StaticQrCodeInfo {
  name: string;
  purpose: string;
  targetUrl: string;
  pngDataUrl: string;
  svgString: string;
  status: string;
  instruction: string;
}

export interface QrCodesResponse {
  success: boolean;
  baseUrl: string;
  qr1: StaticQrCodeInfo;
  qr2: StaticQrCodeInfo;
}

export interface DashboardStats {
  cycleReport: CycleStatusReport;
  kpis: {
    totalRegisteredUsers: number;
    todayRegistrations: number;
    activeLibrarySessions: number;
    completedSessions: number;
    totalResearchPapers: number;
    communicatedResearchPapers: number;
    notCommunicatedResearchPapers: number;
    totalProjectReports: number;
    totalPresentations: number;
    averageSessionDurationMinutes: number;
  };
  charts: {
    departmentStats: Array<{ department: string; count: number; percentage: number }>;
    positionStats: Array<{ position: string; count: number }>;
    dailyRegistrations: Array<{ day: string; registrations: number; sessions: number }>;
    weeklyRegistrations: Array<{ week: string; registrations: number; researchUploads: number }>;
    monthlyRegistrations: Array<{ month: string; registrations: number; papers: number }>;
    durationBuckets: Array<{ range: string; count: number }>;
  };
}
