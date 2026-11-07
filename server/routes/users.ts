import { Router } from 'express';
import { db, formatIST, User } from '../db.js';
import { cycleManager } from '../cycleManager.js';

export const usersRouter = Router();

// Helper to generate a unique college registration ID
function generateRegistrationId(): string {
  const year = new Date().getFullYear();
  const data = db.get();
  let candidate = '';
  let isUnique = false;
  let attempts = 0;

  while (!isUnique && attempts < 100) {
    attempts++;
    const randomFive = Math.floor(10000 + Math.random() * 90000);
    candidate = `LIB-${year}-${randomFive}`;
    isUnique = !data.users.some((u) => u.registrationId === candidate);
  }

  return candidate || `LIB-${year}-${Date.now().toString().slice(-5)}`;
}

// REGISTER NEW USER (QR-1 destination)
usersRouter.post('/register', (req, res) => {
  try {
    const { fullName, department, position, email, contactNumber } = req.body;

    // Validate required fields
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Please provide a valid full name (minimum 2 characters).' });
    }

    if (!department || typeof department !== 'string' || department.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Please select or provide an academic department.' });
    }

    const validPositions = ['Student', 'Research Scholar', 'Faculty', 'Professor', 'Staff', 'Other'];
    if (!position || !validPositions.includes(position)) {
      return res.status(400).json({
        success: false,
        message: `Position must be one of: ${validPositions.join(', ')}.`,
      });
    }

    // Ensure active 24-hour cycle
    const currentCycle = cycleManager.ensureActiveCycle();

    const now = new Date();
    const registrationId = generateRegistrationId();
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      registrationId,
      fullName: fullName.trim(),
      department: department.trim(),
      position,
      email: email ? String(email).trim() : undefined,
      contactNumber: contactNumber ? String(contactNumber).trim() : undefined,
      createdAt: now.toISOString(),
      createdAtIST: formatIST(now),
      cycleId: currentCycle.id,
      cycleNumber: currentCycle.cycleNumber,
    };

    // Save to persistent database
    db.update((data) => {
      data.users.unshift(newUser);
    });

    // Update cycle count
    cycleManager.registerUserInCycle(currentCycle.id);

    // Log activity
    db.logActivity(
      'USER_REGISTRATION',
      `New user ${newUser.fullName} registered with ID ${newUser.registrationId} (${newUser.department} - ${newUser.position}). Cycle #${currentCycle.cycleNumber}.`,
      'REGISTRATION',
      'QR-1 Registration Portal'
    );

    return res.status(201).json({
      success: true,
      message: 'Library registration completed successfully!',
      registrationId: newUser.registrationId,
      user: newUser,
      cycle: {
        cycleNumber: currentCycle.cycleNumber,
        status: currentCycle.status,
      },
    });
  } catch (error: any) {
    console.error('Error registering user:', error);
    return res.status(500).json({ success: false, message: 'Internal server error while processing registration.' });
  }
});

// GET ALL USERS (with search & filters)
usersRouter.get('/', (req, res) => {
  try {
    const { search, department, position } = req.query;
    const data = db.get();
    let results = [...data.users];

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      results = results.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.registrationId.toLowerCase().includes(q) ||
          (u.email && u.email.toLowerCase().includes(q))
      );
    }

    if (department && typeof department === 'string' && department !== 'ALL') {
      results = results.filter((u) => u.department === department);
    }

    if (position && typeof position === 'string' && position !== 'ALL') {
      results = results.filter((u) => u.position === position);
    }

    // Attach active session flag and document counts
    const enriched = results.map((u) => {
      const activeSession = data.librarySessions.find(
        (s) => s.registrationId === u.registrationId && s.status === 'ACTIVE'
      );
      const papersCount = data.researchPapers.filter((p) => p.registrationId === u.registrationId).length;
      const reportsCount = data.projectReports.filter((r) => r.registrationId === u.registrationId).length;
      const pptCount = data.presentations.filter((p) => p.registrationId === u.registrationId).length;

      return {
        ...u,
        hasActiveSession: !!activeSession,
        activeSessionId: activeSession ? activeSession.id : null,
        documentsSummary: {
          researchPapers: papersCount,
          projectReports: reportsCount,
          presentations: pptCount,
          total: papersCount + reportsCount + pptCount,
        },
      };
    });

    return res.json({ success: true, count: enriched.length, users: enriched });
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve users' });
  }
});

// LOOKUP USER BY REGISTRATION ID (QR-2 verification)
usersRouter.get('/lookup/:id', (req, res) => {
  try {
    const regId = req.params.id.trim();
    const data = db.get();

    const user = data.users.find(
      (u) => u.registrationId.toLowerCase() === regId.toLowerCase()
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Registration ID "${regId}" was not found in the university database. Please register using QR Code 1 first.`,
      });
    }

    // Check if user currently has an active session
    const activeSession = data.librarySessions.find(
      (s) => s.registrationId === user.registrationId && s.status === 'ACTIVE'
    );

    // Get user session history
    const sessions = data.librarySessions
      .filter((s) => s.registrationId === user.registrationId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    // Get research documents uploaded by this user
    const papers = data.researchPapers.filter((p) => p.registrationId === user.registrationId);
    const projects = data.projectReports.filter((p) => p.registrationId === user.registrationId);
    const presentations = data.presentations.filter((p) => p.registrationId === user.registrationId);

    return res.json({
      success: true,
      user,
      activeSession: activeSession || null,
      sessionsCount: sessions.length,
      recentSessions: sessions.slice(0, 10),
      documents: {
        papers,
        projects,
        presentations,
      },
    });
  } catch (error: any) {
    console.error('Error looking up user:', error);
    return res.status(500).json({ success: false, message: 'Server error during ID lookup' });
  }
});

// EXPORT ALL USERS TO CSV
usersRouter.get('/export/csv', (req, res) => {
  try {
    const data = db.get();
    const headers = [
      'Registration ID',
      'Full Name',
      'Department',
      'Position',
      'Email',
      'Contact Number',
      'Registered At (IST)',
      'Cycle Number',
      'Cycle ID',
    ];

    const rows = data.users.map((u) => [
      `"${u.registrationId}"`,
      `"${u.fullName.replace(/"/g, '""')}"`,
      `"${u.department.replace(/"/g, '""')}"`,
      `"${u.position}"`,
      `"${(u.email || '').replace(/"/g, '""')}"`,
      `"${(u.contactNumber || '').replace(/"/g, '""')}"`,
      `"${u.createdAtIST}"`,
      u.cycleNumber,
      `"${u.cycleId}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=library_users_${Date.now()}.csv`);
    return res.send(csvContent);
  } catch (error: any) {
    console.error('Error exporting users to CSV:', error);
    return res.status(500).json({ success: false, message: 'Failed to generate CSV export' });
  }
});
