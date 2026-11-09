import QRCode from 'qrcode';
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

const STORAGE_KEY = 'SMART_LIBRARY_STANDALONE_DB_V1';
const CYCLE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 Hours

export function formatIST(dateObj: Date | string): string {
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(d);
}

interface LocalDatabase {
  users: User[];
  registrationCycles: RegistrationCycle[];
  librarySessions: LibrarySession[];
  researchPapers: ResearchPaper[];
  projectReports: ProjectReport[];
  presentations: Presentation[];
  settings: AppSettings;
}

const DEFAULT_DATA: LocalDatabase = {
  users: [
    {
      id: 'usr_1',
      registrationId: 'LIB-2026-10024',
      fullName: 'Debadrito Chakraborty',
      department: 'Computer Science and Engineering',
      position: 'Student',
      email: 'debadritochakraborty9@gmail.com',
      contactNumber: '+91 98765 43210',
      createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
      createdAtIST: formatIST(new Date(Date.now() - 3600000 * 3)),
      cycleId: 'cycle_1',
      cycleNumber: 1,
    },
    {
      id: 'usr_2',
      registrationId: 'LIB-2026-10025',
      fullName: 'Dr. Ananya Roy',
      department: 'Electronics & Communication',
      position: 'Professor',
      email: 'a.roy@library.edu',
      contactNumber: '+91 98301 23456',
      createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
      createdAtIST: formatIST(new Date(Date.now() - 3600000 * 18)),
      cycleId: 'cycle_1',
      cycleNumber: 1,
    },
    {
      id: 'usr_3',
      registrationId: 'LIB-2026-10026',
      fullName: 'Priya Sharma',
      department: 'Biotechnology & Bioengineering',
      position: 'Research Scholar',
      email: 'p.sharma@research.edu',
      contactNumber: '+91 91234 56789',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      createdAtIST: formatIST(new Date(Date.now() - 3600000 * 5)),
      cycleId: 'cycle_1',
      cycleNumber: 1,
    },
    {
      id: 'usr_4',
      registrationId: 'LIB-2026-10027',
      fullName: 'Prof. Rajesh Sen',
      department: 'Mechanical Engineering',
      position: 'Faculty',
      email: 'r.sen@library.edu',
      contactNumber: '+91 94321 09876',
      createdAt: new Date(Date.now() - 3600000 * 22).toISOString(),
      createdAtIST: formatIST(new Date(Date.now() - 3600000 * 22)),
      cycleId: 'cycle_1',
      cycleNumber: 1,
    },
  ],
  registrationCycles: [
    {
      id: 'cycle_1',
      cycleNumber: 1,
      startTime: new Date(Date.now() - 3600000 * 8).toISOString(),
      endTime: new Date(Date.now() + 3600000 * 16).toISOString(),
      startTimeIST: formatIST(new Date(Date.now() - 3600000 * 8)),
      endTimeIST: formatIST(new Date(Date.now() + 3600000 * 16)),
      status: 'OPEN',
      registrationsCount: 4,
    },
  ],
  librarySessions: [
    {
      id: 'sess_1',
      userId: 'usr_1',
      registrationId: 'LIB-2026-10024',
      userName: 'Debadrito Chakraborty',
      department: 'Computer Science and Engineering',
      position: 'Student',
      startTime: new Date(Date.now() - 3600000 * 1).toISOString(),
      startTimeIST: formatIST(new Date(Date.now() - 3600000 * 1)),
      scheduledEndTime: new Date(Date.now() + 3600000 * 2).toISOString(),
      actualEndTime: null,
      actualEndTimeIST: null,
      status: 'ACTIVE',
      durationMinutes: 60,
      purpose: 'Deep Learning & Neural Network Thesis Research',
      workstation: 'Research Carrel C-14',
    },
    {
      id: 'sess_2',
      userId: 'usr_3',
      registrationId: 'LIB-2026-10026',
      userName: 'Priya Sharma',
      department: 'Biotechnology & Bioengineering',
      position: 'Research Scholar',
      startTime: new Date(Date.now() - 3600000 * 4).toISOString(),
      startTimeIST: formatIST(new Date(Date.now() - 3600000 * 4)),
      scheduledEndTime: new Date(Date.now() - 3600000 * 1).toISOString(),
      actualEndTime: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      actualEndTimeIST: formatIST(new Date(Date.now() - 3600000 * 1.5)),
      status: 'COMPLETED',
      durationMinutes: 150,
      purpose: 'CRISPR-Cas9 Literature Survey',
      workstation: 'E-Resource Station E-04',
    },
  ],
  researchPapers: [
    {
      id: 'pap_1',
      title: 'Scalable Distributed Inference Architectures for Multi-Modal LLM Serving in Academic Clusters',
      researcherName: 'Debadrito Chakraborty',
      department: 'Computer Science and Engineering',
      researchDomain: 'Distributed Systems & Machine Learning',
      description: 'A study on optimizing latency, cache locality, and tensor parallelism across heterogeneous university compute nodes.',
      communicationStatus: 'Communicated',
      communicationDate: '2026-09-15',
      journalConferenceName: 'IEEE Transactions on Parallel and Distributed Systems',
      publicationStatus: 'Under Review',
      doiOrPaperLink: 'https://doi.org/10.1109/TPDS.2026.3389102',
      fileName: 'Debadrito_Distributed_LLM_Inference_2026.pdf',
      fileSize: 2458200,
      fileType: 'application/pdf',
      registrationId: 'LIB-2026-10024',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      createdAtIST: formatIST(new Date(Date.now() - 3600000 * 48)),
    },
    {
      id: 'pap_2',
      title: 'CRISPR Target Selection Algorithms Utilizing Quantum-Inspired Annealing',
      researcherName: 'Priya Sharma',
      department: 'Biotechnology & Bioengineering',
      researchDomain: 'Computational Biology & Genomics',
      description: 'Novel heuristics for off-target minimization in mammalian gene editing protocols with verification assays.',
      communicationStatus: 'Not Communicated',
      communicationDate: '',
      journalConferenceName: 'Nature Computational Science (Target Submission)',
      publicationStatus: 'Internal Review / Pre-Submission',
      doiOrPaperLink: '',
      fileName: 'Sharma_Quantum_CRISPR_Targeting_Draft.pdf',
      fileSize: 3120400,
      fileType: 'application/pdf',
      registrationId: 'LIB-2026-10026',
      createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      createdAtIST: formatIST(new Date(Date.now() - 3600000 * 72)),
    },
    {
      id: 'pap_3',
      title: 'Low-Power Sub-6GHz Phased Array Antenna Optimization with Gallium Nitride MMICs',
      researcherName: 'Dr. Ananya Roy',
      department: 'Electronics & Communication',
      researchDomain: 'RF Engineering & Telecommunications',
      description: 'Energy efficiency characterization of multi-beam forming modules for 6G base stations.',
      communicationStatus: 'Communicated',
      communicationDate: '2026-08-20',
      journalConferenceName: 'IEEE Microwave and Wireless Technology Letters',
      publicationStatus: 'Accepted',
      doiOrPaperLink: 'https://doi.org/10.1109/LMWT.2026.1049281',
      fileName: 'Roy_Sub6GHz_Phased_Array_Antenna.pdf',
      fileSize: 1840200,
      fileType: 'application/pdf',
      registrationId: 'LIB-2026-10025',
      createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
      createdAtIST: formatIST(new Date(Date.now() - 3600000 * 120)),
    },
  ],
  projectReports: [
    {
      id: 'proj_1',
      projectTitle: 'Smart Autonomous Solar-Powered Microgrid Monitoring & Fault Isolation',
      description: 'Implementation of IoT edge telemetry and dynamic impedance estimation for automated microgrid grid-tie stability.',
      department: 'Electrical Engineering',
      projectDomain: 'Renewable Energy & IoT',
      projectGuideSupervisor: 'Dr. V. K. Ramanujan',
      submissionDate: '2026-10-15',
      fileName: 'BTech_Capstone_Solar_Microgrid_Report.pdf',
      fileSize: 4520900,
      registrationId: 'LIB-2026-10024',
      createdAt: new Date(Date.now() - 3600000 * 30).toISOString(),
      createdAtIST: formatIST(new Date(Date.now() - 3600000 * 30)),
    },
    {
      id: 'proj_2',
      projectTitle: 'Automated Bio-Chemical Spectrophotometer Sensor Calibration Suite',
      description: 'Design and laboratory verification of automated calibration curves using microfluidic linear gradient generators.',
      department: 'Biotechnology & Bioengineering',
      projectDomain: 'Analytical Instrumentation',
      projectGuideSupervisor: 'Prof. Sunita Bannerjee',
      submissionDate: '2026-10-22',
      fileName: 'MTech_Spectrophotometer_Calibration_Report.pdf',
      fileSize: 3820100,
      registrationId: 'LIB-2026-10026',
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      createdAtIST: formatIST(new Date(Date.now() - 3600000 * 20)),
    },
  ],
  presentations: [
    {
      id: 'ppt_1',
      presentationTitle: 'Accelerating Transformer Attention Mechanisms with FlashDecoders on Apple Silicon',
      presenterName: 'Debadrito Chakraborty',
      department: 'Computer Science and Engineering',
      presentationDomain: 'Deep Learning System Optimization',
      presentationDate: '2026-10-28',
      fileName: 'Debadrito_Seminar_Transformer_Acceleration.pptx',
      fileSize: 6710400,
      registrationId: 'LIB-2026-10024',
      createdAt: new Date(Date.now() - 3600000 * 15).toISOString(),
      createdAtIST: formatIST(new Date(Date.now() - 3600000 * 15)),
    },
    {
      id: 'ppt_2',
      presentationTitle: 'Next-Generation Smart Materials for Vibration Damping in Aerospace Structures',
      presenterName: 'Prof. Rajesh Sen',
      department: 'Mechanical Engineering',
      presentationDomain: 'Materials Science',
      presentationDate: '2026-10-18',
      fileName: 'Sen_Aerospace_Damping_Materials.pptx',
      fileSize: 8450100,
      registrationId: 'LIB-2026-10027',
      createdAt: new Date(Date.now() - 3600000 * 40).toISOString(),
      createdAtIST: formatIST(new Date(Date.now() - 3600000 * 40)),
    },
  ],
  settings: {
    libraryName: 'Central University Research Library & Documentation Centre',
    institutionName: 'Institute of Advanced Science & Technology',
    defaultSessionDurationHours: 3,
    maxSessionDurationHours: 8,
    autoExpireSessions: true,
    allowManualCycleRollover: true,
    timezone: 'Asia/Kolkata',
    contactEmail: 'library-support@library.edu',
  },
};

function getLocalData(): LocalDatabase {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_DATA, ...parsed };
    }
  } catch (e) {
    console.error('Error reading local database:', e);
  }
  setLocalData(DEFAULT_DATA);
  return DEFAULT_DATA;
}

function setLocalData(data: LocalDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving local database:', e);
  }
}

export const localEngine = {
  // 1. GENERATE STATIC QR CODES CLIENT-SIDE
  async getQrCodes(): Promise<QrCodesResponse> {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://library.edu';
    const registrationUrl = `${origin}/register`;
    const loginUrl = `${origin}/library-login`;

    const [png1, png2, svg1, svg2] = await Promise.all([
      QRCode.toDataURL(registrationUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 512,
        color: { dark: '#0f172a', light: '#ffffff' },
      }),
      QRCode.toDataURL(loginUrl, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 512,
        color: { dark: '#1e3a8a', light: '#ffffff' },
      }),
      QRCode.toString(registrationUrl, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
      }),
      QRCode.toString(loginUrl, {
        type: 'svg',
        errorCorrectionLevel: 'H',
        margin: 2,
        color: { dark: '#1e3a8a', light: '#ffffff' },
      }),
    ]);

    return {
      success: true,
      baseUrl: origin,
      qr1: {
        name: 'QR CODE 1: REGISTRATION QR CODE',
        purpose: 'Direct entry to Smart Library User & Research Scholar Registration Form',
        targetUrl: registrationUrl,
        pngDataUrl: png1,
        svgString: svg1,
        status: 'PERMANENT_STATIC',
        instruction: 'Scan with smartphone or library kiosk camera to register new reader credentials.',
      },
      qr2: {
        name: 'QR CODE 2: LIBRARY LOGIN QR CODE',
        purpose: 'Direct entry to Library Session Verification & Countdown Management',
        targetUrl: loginUrl,
        pngDataUrl: png2,
        svgString: svg2,
        status: 'PERMANENT_STATIC',
        instruction: 'Scan upon entering reading halls to validate Registration ID and start session timer.',
      },
    };
  },

  // 2. 24-HOUR CYCLE MANAGER IN ASIA/KOLKATA TIMEZONE
  getCycleReport(): { success: true; cycle: CycleStatusReport } {
    const data = getLocalData();
    const now = new Date();
    let activeCycle = data.registrationCycles.find((c) => c.status === 'OPEN');

    if (!activeCycle || now.getTime() >= new Date(activeCycle.endTime).getTime()) {
      if (activeCycle) {
        activeCycle.status = 'CLOSED';
        activeCycle.closedAt = now.toISOString();
      }
      const nextNum = (activeCycle ? activeCycle.cycleNumber : data.registrationCycles.length) + 1;
      const startTime = now;
      const endTime = new Date(startTime.getTime() + CYCLE_DURATION_MS);
      activeCycle = {
        id: `cycle_${Date.now()}_${nextNum}`,
        cycleNumber: nextNum,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        startTimeIST: formatIST(startTime),
        endTimeIST: formatIST(endTime),
        status: 'OPEN',
        registrationsCount: 0,
      };
      data.registrationCycles.unshift(activeCycle);
      setLocalData(data);
    }

    const remainingSeconds = Math.max(
      0,
      Math.floor((new Date(activeCycle.endTime).getTime() - now.getTime()) / 1000)
    );
    const todayRegistrations = data.users.filter((u) => u.cycleId === activeCycle!.id).length;

    return {
      success: true,
      cycle: {
        status: activeCycle.status,
        cycleId: activeCycle.id,
        cycleNumber: activeCycle.cycleNumber,
        startTime: activeCycle.startTime,
        endTime: activeCycle.endTime,
        startTimeIST: activeCycle.startTimeIST,
        endTimeIST: activeCycle.endTimeIST,
        remainingSeconds,
        todayRegistrations,
        totalLifetimeRegistrations: data.users.length,
        timezone: 'Asia/Kolkata',
        isExpired: remainingSeconds <= 0,
      },
    };
  },

  // 3. DASHBOARD KPIS & CHARTS
  getDashboardStats(): { success: true } & DashboardStats {
    const data = getLocalData();
    const cycleReport = this.getCycleReport().cycle;

    const totalUsers = data.users.length;
    const activeSessions = data.librarySessions.filter((s) => s.status === 'ACTIVE').length;
    const completedSessions = data.librarySessions.filter((s) => s.status === 'COMPLETED').length;
    const totalPapers = data.researchPapers.length;
    const communicatedPapers = data.researchPapers.filter((p) => p.communicationStatus === 'Communicated').length;
    const notCommunicatedPapers = data.researchPapers.filter((p) => p.communicationStatus === 'Not Communicated').length;
    const totalReports = data.projectReports.length;
    const totalPresentations = data.presentations.length;

    const departmentCounts: Record<string, number> = {};
    for (const u of data.users) {
      departmentCounts[u.department] = (departmentCounts[u.department] || 0) + 1;
    }
    const departmentStats = Object.entries(departmentCounts).map(([department, count]) => ({
      department,
      count,
      percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    const positionCounts: Record<string, number> = {};
    for (const u of data.users) {
      positionCounts[u.position] = (positionCounts[u.position] || 0) + 1;
    }
    const positionStats = Object.entries(positionCounts).map(([position, count]) => ({
      position,
      count,
    }));

    const dailyDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];
    const dailyRegistrations = dailyDays.map((day, idx) => {
      const isToday = idx === dailyDays.length - 1;
      return {
        day,
        registrations: isToday ? cycleReport.todayRegistrations : Math.max(2, Math.floor((totalUsers / 7) * (0.7 + idx * 0.1))),
        sessions: isToday ? activeSessions + completedSessions : Math.max(3, Math.floor((totalUsers / 5) * (0.8 + idx * 0.08))),
      };
    });

    const weeklyRegistrations = [
      { week: 'Week 1', registrations: Math.floor(totalUsers * 0.18), researchUploads: 3 },
      { week: 'Week 2', registrations: Math.floor(totalUsers * 0.24), researchUploads: 5 },
      { week: 'Week 3', registrations: Math.floor(totalUsers * 0.28), researchUploads: 4 },
      { week: 'Week 4 (Current)', registrations: Math.max(cycleReport.todayRegistrations, Math.floor(totalUsers * 0.3)), researchUploads: 6 },
    ];

    const monthlyRegistrations = [
      { month: 'May 2026', registrations: 42, papers: 8 },
      { month: 'Jun 2026', registrations: 68, papers: 14 },
      { month: 'Jul 2026', registrations: 95, papers: 19 },
      { month: 'Aug 2026', registrations: 124, papers: 25 },
      { month: 'Sep 2026', registrations: 180, papers: 38 },
      { month: 'Oct 2026', registrations: Math.max(totalUsers, 210), papers: totalPapers },
    ];

    const completedList = data.librarySessions.filter((s) => s.status === 'COMPLETED');
    const avgDuration =
      completedList.length > 0
        ? Math.round(completedList.reduce((acc, s) => acc + s.durationMinutes, 0) / completedList.length)
        : 120;

    const durationBuckets = [
      { range: '< 1 Hour', count: completedList.filter((s) => s.durationMinutes < 60).length + 2 },
      { range: '1 - 2 Hours', count: completedList.filter((s) => s.durationMinutes >= 60 && s.durationMinutes < 120).length + 5 },
      { range: '2 - 3 Hours', count: completedList.filter((s) => s.durationMinutes >= 120 && s.durationMinutes < 180).length + 8 },
      { range: '3+ Hours', count: completedList.filter((s) => s.durationMinutes >= 180).length + 4 },
    ];

    return {
      success: true,
      cycleReport,
      kpis: {
        totalRegisteredUsers: totalUsers,
        todayRegistrations: cycleReport.todayRegistrations,
        activeLibrarySessions: activeSessions,
        completedSessions,
        totalResearchPapers: totalPapers,
        communicatedResearchPapers: communicatedPapers,
        notCommunicatedResearchPapers: notCommunicatedPapers,
        totalProjectReports: totalReports,
        totalPresentations,
        averageSessionDurationMinutes: avgDuration,
      },
      charts: {
        departmentStats,
        positionStats,
        dailyRegistrations,
        weeklyRegistrations,
        monthlyRegistrations,
        durationBuckets,
      },
    };
  },

  // 4. USER REGISTRATION
  registerUser(userData: {
    fullName: string;
    department: string;
    position: string;
    email?: string;
    contactNumber?: string;
  }): { success: true; message: string; registrationId: string; user: User } {
    const data = getLocalData();
    const cycleReport = this.getCycleReport().cycle;
    const year = new Date().getFullYear();
    const randomFive = Math.floor(10000 + Math.random() * 90000);
    const registrationId = `LIB-${year}-${randomFive}`;
    const now = new Date();

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      registrationId,
      fullName: userData.fullName.trim(),
      department: userData.department.trim(),
      position: userData.position as any,
      email: userData.email?.trim(),
      contactNumber: userData.contactNumber?.trim(),
      createdAt: now.toISOString(),
      createdAtIST: formatIST(now),
      cycleId: cycleReport.cycleId,
      cycleNumber: cycleReport.cycleNumber,
    };

    data.users.unshift(newUser);
    const activeCycle = data.registrationCycles.find((c) => c.id === cycleReport.cycleId);
    if (activeCycle) {
      activeCycle.registrationsCount += 1;
    }
    setLocalData(data);

    return {
      success: true,
      message: 'Library registration completed successfully!',
      registrationId: newUser.registrationId,
      user: newUser,
    };
  },

  // 5. USER LOOKUP
  lookupUser(registrationId: string) {
    const data = getLocalData();
    const cleanId = registrationId.trim().toLowerCase();
    const user = data.users.find((u) => u.registrationId.toLowerCase() === cleanId);

    if (!user) {
      return {
        success: false,
        message: `Registration ID "${registrationId}" was not found in the university database.`,
      };
    }

    const activeSession = data.librarySessions.find(
      (s) => s.registrationId.toLowerCase() === cleanId && s.status === 'ACTIVE'
    );
    const recentSessions = data.librarySessions
      .filter((s) => s.registrationId.toLowerCase() === cleanId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    const papers = data.researchPapers.filter((p) => p.registrationId === user.registrationId);
    const projects = data.projectReports.filter((p) => p.registrationId === user.registrationId);
    const presentations = data.presentations.filter((p) => p.registrationId === user.registrationId);

    return {
      success: true,
      user,
      activeSession: activeSession || null,
      sessionsCount: recentSessions.length,
      recentSessions: recentSessions.slice(0, 10),
      documents: { papers, projects, presentations },
    };
  },

  getUsers(params?: { search?: string; department?: string; position?: string }) {
    const data = getLocalData();
    let results = [...data.users];
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      results = results.filter((u) => u.fullName.toLowerCase().includes(q) || u.registrationId.toLowerCase().includes(q));
    }
    if (params?.department && params.department !== 'ALL') {
      results = results.filter((u) => u.department === params.department);
    }
    if (params?.position && params.position !== 'ALL') {
      results = results.filter((u) => u.position === params.position);
    }
    return { success: true, count: results.length, users: results };
  },

  // 6. SESSIONS MANAGEMENT
  startSession(payload: {
    registrationId: string;
    durationHours?: number;
    purpose?: string;
    workstation?: string;
  }) {
    const data = getLocalData();
    const cleanId = payload.registrationId.trim().toLowerCase();
    const user = data.users.find((u) => u.registrationId.toLowerCase() === cleanId);

    if (!user) {
      return { success: false, message: 'Invalid registration ID.' };
    }

    const now = new Date();
    const existing = data.librarySessions.find(
      (s) => s.registrationId.toLowerCase() === cleanId && s.status === 'ACTIVE'
    );

    if (existing) {
      const remainingSecs = Math.max(0, Math.floor((new Date(existing.scheduledEndTime).getTime() - now.getTime()) / 1000));
      return {
        success: true,
        isExisting: true,
        message: 'Resuming your active library session.',
        session: existing,
        remainingSeconds: remainingSecs,
      };
    }

    const hours = Math.min(Math.max(1, Number(payload.durationHours) || 3), 8);
    const scheduledEnd = new Date(now.getTime() + hours * 3600000);

    const newSession: LibrarySession = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      registrationId: user.registrationId,
      userName: user.fullName,
      department: user.department,
      position: user.position,
      startTime: now.toISOString(),
      startTimeIST: formatIST(now),
      scheduledEndTime: scheduledEnd.toISOString(),
      actualEndTime: null,
      actualEndTimeIST: null,
      status: 'ACTIVE',
      durationMinutes: 0,
      purpose: payload.purpose || 'Research & Academic Study',
      workstation: payload.workstation || 'Reading Hall A',
    };

    data.librarySessions.unshift(newSession);
    setLocalData(data);

    return {
      success: true,
      message: 'Library session started successfully.',
      session: newSession,
      remainingSeconds: hours * 3600,
    };
  },

  endSession(payload: { sessionId?: string; registrationId?: string }) {
    const data = getLocalData();
    const now = new Date();
    let endedSession: LibrarySession | null = null;

    const session = data.librarySessions.find((s) => {
      if (s.status !== 'ACTIVE') return false;
      if (payload.sessionId && s.id === payload.sessionId) return true;
      if (payload.registrationId && s.registrationId.toLowerCase() === payload.registrationId.trim().toLowerCase()) return true;
      return false;
    });

    if (session) {
      session.status = 'COMPLETED';
      session.actualEndTime = now.toISOString();
      session.actualEndTimeIST = formatIST(now);
      const diffMs = now.getTime() - new Date(session.startTime).getTime();
      session.durationMinutes = Math.max(1, Math.round(diffMs / 60000));
      endedSession = session;
      setLocalData(data);
    }

    if (!endedSession) {
      return { success: false, message: 'No active session found.' };
    }

    return { success: true, message: 'Session concluded successfully.', session: endedSession };
  },

  getCurrentSession(registrationId: string) {
    const data = getLocalData();
    const cleanId = registrationId.trim().toLowerCase();
    const active = data.librarySessions.find(
      (s) => s.registrationId.toLowerCase() === cleanId && s.status === 'ACTIVE'
    );

    if (!active) {
      return { success: true, hasActiveSession: false, session: null };
    }

    const now = Date.now();
    const remaining = Math.max(0, Math.floor((new Date(active.scheduledEndTime).getTime() - now) / 1000));
    const elapsed = Math.max(0, Math.floor((now - new Date(active.startTime).getTime()) / 60000));

    return {
      success: true,
      hasActiveSession: true,
      session: active,
      remainingSeconds: remaining,
      elapsedMinutes: elapsed,
    };
  },

  getActiveSessions() {
    const data = getLocalData();
    const now = Date.now();
    const active = data.librarySessions
      .filter((s) => s.status === 'ACTIVE')
      .map((s) => ({
        ...s,
        remainingSeconds: Math.max(0, Math.floor((new Date(s.scheduledEndTime).getTime() - now) / 1000)),
        elapsedMinutes: Math.max(0, Math.floor((now - new Date(s.startTime).getTime()) / 60000)),
      }));

    return { success: true, count: active.length, sessions: active, serverTime: new Date().toISOString(), serverTimeIST: formatIST(new Date()) };
  },

  getSessionHistory(params?: { status?: string; department?: string; search?: string }) {
    const data = getLocalData();
    let list = [...data.librarySessions];
    if (params?.status && params.status !== 'ALL') {
      list = list.filter((s) => s.status === params.status);
    }
    if (params?.department && params.department !== 'ALL') {
      list = list.filter((s) => s.department === params.department);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter((s) => s.userName.toLowerCase().includes(q) || s.registrationId.toLowerCase().includes(q));
    }
    list.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    return { success: true, count: list.length, sessions: list };
  },

  // 7. RESEARCH PAPERS
  getResearchPapers(params?: { communicationStatus?: string; department?: string; search?: string }) {
    const data = getLocalData();
    let papers = [...data.researchPapers];
    if (params?.communicationStatus && params.communicationStatus !== 'ALL') {
      papers = papers.filter((p) => p.communicationStatus === params.communicationStatus);
    }
    if (params?.department && params.department !== 'ALL') {
      papers = papers.filter((p) => p.department === params.department);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      papers = papers.filter((p) => p.title.toLowerCase().includes(q) || p.researcherName.toLowerCase().includes(q));
    }
    papers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return {
      success: true,
      count: papers.length,
      papers,
      summary: {
        total: data.researchPapers.length,
        communicated: data.researchPapers.filter((p) => p.communicationStatus === 'Communicated').length,
        notCommunicated: data.researchPapers.filter((p) => p.communicationStatus === 'Not Communicated').length,
      },
    };
  },

  uploadResearchPaper(formData: FormData) {
    const data = getLocalData();
    const now = new Date();
    const newPaper: ResearchPaper = {
      id: `pap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: String(formData.get('title') || 'Untitled Manuscript'),
      researcherName: String(formData.get('researcherName') || 'Author'),
      department: String(formData.get('department') || 'Computer Science'),
      researchDomain: String(formData.get('researchDomain') || 'General'),
      description: String(formData.get('description') || ''),
      communicationStatus: (formData.get('communicationStatus') as CommunicationStatus) || 'Not Communicated',
      communicationDate: formData.get('communicationDate') ? String(formData.get('communicationDate')) : undefined,
      journalConferenceName: formData.get('journalConferenceName') ? String(formData.get('journalConferenceName')) : undefined,
      publicationStatus: String(formData.get('publicationStatus') || 'Under Review'),
      doiOrPaperLink: formData.get('doiOrPaperLink') ? String(formData.get('doiOrPaperLink')) : undefined,
      fileName: 'Manuscript_Preprint.pdf',
      fileUrl: '/uploads/sample-paper-1.pdf',
      fileSize: 2048000,
      registrationId: formData.get('registrationId') ? String(formData.get('registrationId')) : undefined,
      createdAt: now.toISOString(),
      createdAtIST: formatIST(now),
    };

    data.researchPapers.unshift(newPaper);
    setLocalData(data);
    return { success: true, message: 'Research paper cataloged successfully.', paper: newPaper };
  },

  updatePaperCommunicationStatus(id: string, payload: any) {
    const data = getLocalData();
    const paper = data.researchPapers.find((p) => p.id === id);
    if (paper) {
      paper.communicationStatus = payload.communicationStatus;
      if (payload.journalConferenceName !== undefined) paper.journalConferenceName = payload.journalConferenceName;
      if (payload.communicationDate !== undefined) paper.communicationDate = payload.communicationDate;
      if (payload.doiOrPaperLink !== undefined) paper.doiOrPaperLink = payload.doiOrPaperLink;
      if (payload.publicationStatus !== undefined) paper.publicationStatus = payload.publicationStatus;
      setLocalData(data);
      return { success: true, message: 'Status updated.', paper };
    }
    return { success: false, message: 'Paper not found.' };
  },

  deleteResearchPaper(id: string) {
    const data = getLocalData();
    data.researchPapers = data.researchPapers.filter((p) => p.id !== id);
    setLocalData(data);
    return { success: true, message: 'Paper deleted.' };
  },

  // 8. PROJECT REPORTS
  getProjectReports(params?: { department?: string; search?: string }) {
    const data = getLocalData();
    let projects = [...data.projectReports];
    if (params?.department && params.department !== 'ALL') {
      projects = projects.filter((p) => p.department === params.department);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      projects = projects.filter((p) => p.projectTitle.toLowerCase().includes(q) || p.projectGuideSupervisor.toLowerCase().includes(q));
    }
    projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { success: true, count: projects.length, projects, total: data.projectReports.length };
  },

  uploadProjectReport(formData: FormData) {
    const data = getLocalData();
    const now = new Date();
    const newProject: ProjectReport = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectTitle: String(formData.get('projectTitle') || 'Capstone Report'),
      description: String(formData.get('description') || ''),
      department: String(formData.get('department') || 'Engineering'),
      projectDomain: String(formData.get('projectDomain') || 'General'),
      projectGuideSupervisor: String(formData.get('projectGuideSupervisor') || 'Supervisor'),
      submissionDate: String(formData.get('submissionDate') || now.toISOString().split('T')[0]),
      fileName: 'Project_Report.pdf',
      fileUrl: '/uploads/sample-project-1.pdf',
      fileSize: 3500000,
      registrationId: formData.get('registrationId') ? String(formData.get('registrationId')) : undefined,
      createdAt: now.toISOString(),
      createdAtIST: formatIST(now),
    };
    data.projectReports.unshift(newProject);
    setLocalData(data);
    return { success: true, message: 'Project report uploaded.', project: newProject };
  },

  deleteProjectReport(id: string) {
    const data = getLocalData();
    data.projectReports = data.projectReports.filter((p) => p.id !== id);
    setLocalData(data);
    return { success: true, message: 'Project deleted.' };
  },

  // 9. PRESENTATIONS
  getPresentations(params?: { department?: string; search?: string }) {
    const data = getLocalData();
    let list = [...data.presentations];
    if (params?.department && params.department !== 'ALL') {
      list = list.filter((p) => p.department === params.department);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      list = list.filter((p) => p.presentationTitle.toLowerCase().includes(q) || p.presenterName.toLowerCase().includes(q));
    }
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { success: true, count: list.length, presentations: list, total: data.presentations.length };
  },

  uploadPresentation(formData: FormData) {
    const data = getLocalData();
    const now = new Date();
    const newPpt: Presentation = {
      id: `ppt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      presentationTitle: String(formData.get('presentationTitle') || 'Seminar Deck'),
      presenterName: String(formData.get('presenterName') || 'Presenter'),
      department: String(formData.get('department') || 'Engineering'),
      presentationDomain: String(formData.get('presentationDomain') || 'General'),
      presentationDate: String(formData.get('presentationDate') || now.toISOString().split('T')[0]),
      fileName: 'Presentation_Deck.pptx',
      fileUrl: '/uploads/sample-presentation-1.pptx',
      fileSize: 5200000,
      registrationId: formData.get('registrationId') ? String(formData.get('registrationId')) : undefined,
      createdAt: now.toISOString(),
      createdAtIST: formatIST(now),
    };
    data.presentations.unshift(newPpt);
    setLocalData(data);
    return { success: true, message: 'Presentation uploaded.', presentation: newPpt };
  },

  deletePresentation(id: string) {
    const data = getLocalData();
    data.presentations = data.presentations.filter((p) => p.id !== id);
    setLocalData(data);
    return { success: true, message: 'Presentation deleted.' };
  },

  // 10. CYCLES
  getCycleHistory() {
    const data = getLocalData();
    return {
      success: true,
      cycles: data.registrationCycles,
      activeCycle: data.registrationCycles.find((c) => c.status === 'OPEN'),
    };
  },

  rolloverCycle() {
    const data = getLocalData();
    const now = new Date();
    const active = data.registrationCycles.find((c) => c.status === 'OPEN');
    if (active) {
      active.status = 'CLOSED';
      active.closedAt = now.toISOString();
    }
    const nextNum = (active ? active.cycleNumber : data.registrationCycles.length) + 1;
    const nextCycle: RegistrationCycle = {
      id: `cycle_${Date.now()}_${nextNum}`,
      cycleNumber: nextNum,
      startTime: now.toISOString(),
      endTime: new Date(now.getTime() + CYCLE_DURATION_MS).toISOString(),
      startTimeIST: formatIST(now),
      endTimeIST: formatIST(new Date(now.getTime() + CYCLE_DURATION_MS)),
      status: 'OPEN',
      registrationsCount: 0,
    };
    data.registrationCycles.unshift(nextCycle);
    setLocalData(data);

    return {
      success: true,
      message: `24-hour cycle rolled over. New cycle #${nextNum} started in Asia/Kolkata timezone.`,
      cycle: this.getCycleReport().cycle,
    };
  },

  // 11. ADMIN AUTH & SETTINGS
  adminLogin(username: string, password: string) {
    if ((username === 'admin' || username === 'admin@library.edu') && password === 'Admin@Library2026') {
      return {
        success: true,
        token: `jwt_simulated_${Date.now()}`,
        admin: { username: 'admin', name: 'Chief University Librarian', role: 'Super Admin', email: 'admin@library.edu' },
      };
    }
    return { success: false, message: 'Invalid administrator credentials.' };
  },

  getSettings() {
    const data = getLocalData();
    return { success: true, settings: data.settings };
  },

  updateSettings(settings: Partial<AppSettings>) {
    const data = getLocalData();
    data.settings = { ...data.settings, ...settings };
    setLocalData(data);
    return { success: true, settings: data.settings };
  },
};
