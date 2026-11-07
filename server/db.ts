import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  registrationId: string;
  fullName: string;
  department: string;
  position: 'Student' | 'Research Scholar' | 'Faculty' | 'Professor' | 'Staff' | 'Other';
  email?: string;
  contactNumber?: string;
  createdAt: string;
  createdAtIST: string;
  cycleId: string;
  cycleNumber: number;
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
}

export interface ResearchPaper {
  id: string;
  title: string;
  researcherName: string;
  department: string;
  researchDomain: string;
  description: string;
  communicationStatus: 'Communicated' | 'Not Communicated';
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
  passwordHash: string;
  name: string;
  role: 'Super Admin' | 'Librarian' | 'Staff';
  lastLogin?: string;
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

export interface DatabaseSchema {
  users: User[];
  registrationCycles: RegistrationCycle[];
  librarySessions: LibrarySession[];
  researchPapers: ResearchPaper[];
  projectReports: ProjectReport[];
  presentations: Presentation[];
  adminUsers: AdminUser[];
  activityLogs: ActivityLog[];
  settings: AppSettings;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function formatIST(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(date);
}

// Initial default seed state
const initialData: DatabaseSchema = {
  users: [
    {
      id: 'usr_1',
      registrationId: 'LIB-2026-10024',
      fullName: 'Debadrito Chakraborty',
      department: 'Computer Science and Engineering',
      position: 'Student',
      email: 'debadritochakraborty9@gmail.com',
      contactNumber: '+91 98765 43210',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      createdAtIST: formatIST(new Date(Date.now() - 3600000 * 2)),
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
    {
      id: 'usr_5',
      registrationId: 'LIB-2026-10028',
      fullName: 'Sunita Mukherjee',
      department: 'Library Sciences',
      position: 'Staff',
      email: 's.mukherjee@library.edu',
      contactNumber: '+91 90001 88888',
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      createdAtIST: formatIST(new Date(Date.now() - 3600000 * 12)),
      cycleId: 'cycle_1',
      cycleNumber: 1,
    }
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
      registrationsCount: 5,
    }
  ],
  librarySessions: [
    {
      id: 'sess_1',
      userId: 'usr_1',
      registrationId: 'LIB-2026-10024',
      userName: 'Debadrito Chakraborty',
      department: 'Computer Science and Engineering',
      position: 'Student',
      startTime: new Date(Date.now() - 3600000 * 1.2).toISOString(),
      startTimeIST: formatIST(new Date(Date.now() - 3600000 * 1.2)),
      scheduledEndTime: new Date(Date.now() + 3600000 * 1.8).toISOString(),
      actualEndTime: null,
      actualEndTimeIST: null,
      status: 'ACTIVE',
      durationMinutes: 72,
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
    {
      id: 'sess_3',
      userId: 'usr_2',
      registrationId: 'LIB-2026-10025',
      userName: 'Dr. Ananya Roy',
      department: 'Electronics & Communication',
      position: 'Professor',
      startTime: new Date(Date.now() - 3600000 * 6).toISOString(),
      startTimeIST: formatIST(new Date(Date.now() - 3600000 * 6)),
      scheduledEndTime: new Date(Date.now() - 3600000 * 3).toISOString(),
      actualEndTime: new Date(Date.now() - 3600000 * 3.2).toISOString(),
      actualEndTimeIST: formatIST(new Date(Date.now() - 3600000 * 3.2)),
      status: 'COMPLETED',
      durationMinutes: 168,
      purpose: 'Faculty Research Consultation',
      workstation: 'Faculty Reading Room F-02',
    }
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
      fileUrl: '/uploads/sample-paper-1.pdf',
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
      fileUrl: '/uploads/sample-paper-2.pdf',
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
      fileUrl: '/uploads/sample-paper-3.pdf',
      fileSize: 1840200,
      fileType: 'application/pdf',
      registrationId: 'LIB-2026-10025',
      createdAt: new Date(Date.now() - 3600000 * 120).toISOString(),
      createdAtIST: formatIST(new Date(Date.now() - 3600000 * 120)),
    }
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
      fileUrl: '/uploads/sample-project-1.pdf',
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
      fileUrl: '/uploads/sample-project-2.pdf',
      fileSize: 3820100,
      registrationId: 'LIB-2026-10026',
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      createdAtIST: formatIST(new Date(Date.now() - 3600000 * 20)),
    }
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
      fileUrl: '/uploads/sample-presentation-1.pptx',
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
      fileUrl: '/uploads/sample-presentation-2.pptx',
      fileSize: 8450100,
      registrationId: 'LIB-2026-10027',
      createdAt: new Date(Date.now() - 3600000 * 40).toISOString(),
      createdAtIST: formatIST(new Date(Date.now() - 3600000 * 40)),
    }
  ],
  adminUsers: [
    {
      id: 'admin_1',
      username: 'admin',
      email: 'admin@library.edu',
      // bcrypt hash of 'Admin@Library2026'
      passwordHash: '$2a$10$w66kZ6Y6P.fV01UqK3lS5e0Z0Q9N3X.2P2W2L8M5N7K9P1R3T5V8m',
      name: 'Chief University Librarian',
      role: 'Super Admin',
      lastLogin: new Date().toISOString(),
    }
  ],
  activityLogs: [
    {
      id: 'act_1',
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      timestampIST: formatIST(new Date(Date.now() - 3600000 * 8)),
      action: 'CYCLE_INITIALIZED',
      details: 'Automatic 24-hour registration cycle #1 initialized in Asia/Kolkata timezone.',
      category: 'CYCLE',
      actor: 'System Daemon',
    },
    {
      id: 'act_2',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      timestampIST: formatIST(new Date(Date.now() - 3600000 * 2)),
      action: 'USER_REGISTERED',
      details: 'Debadrito Chakraborty registered with ID LIB-2026-10024 (Computer Science and Engineering - Student)',
      category: 'REGISTRATION',
      actor: 'Public QR-1 Portal',
    },
    {
      id: 'act_3',
      timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
      timestampIST: formatIST(new Date(Date.now() - 3600000 * 1.2)),
      action: 'SESSION_STARTED',
      details: 'Debadrito Chakraborty started a library study session at Carrel C-14.',
      category: 'SESSION',
      actor: 'Public QR-2 Portal',
    }
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
  }
};

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...initialData, ...parsed };
      }
    } catch (e) {
      console.error('Error reading database file, resetting to initial seed:', e);
    }
    this.save(initialData);
    return initialData;
  }

  private save(dataToSave: DatabaseSchema): void {
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(dataToSave, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public update(updater: (data: DatabaseSchema) => void): DatabaseSchema {
    updater(this.data);
    this.save(this.data);
    return this.data;
  }

  public logActivity(action: string, details: string, category: ActivityLog['category'], actor: string = 'System') {
    const now = new Date();
    const newLog: ActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: now.toISOString(),
      timestampIST: formatIST(now),
      action,
      details,
      category,
      actor,
    };
    this.update((data) => {
      data.activityLogs.unshift(newLog);
      // Keep last 500 logs
      if (data.activityLogs.length > 500) {
        data.activityLogs.length = 500;
      }
    });
    return newLog;
  }
}

export const db = new Database();
