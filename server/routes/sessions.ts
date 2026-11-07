import { Router } from 'express';
import { db, formatIST, LibrarySession } from '../db.js';

export const sessionsRouter = Router();

// Helper to auto-expire sessions that have crossed scheduled time
function autoExpireOverdueSessions(): void {
  const now = new Date();
  db.update((data) => {
    for (const session of data.librarySessions) {
      if (session.status === 'ACTIVE') {
        const scheduledEnd = new Date(session.scheduledEndTime);
        if (now > scheduledEnd) {
          session.status = 'COMPLETED';
          session.actualEndTime = session.scheduledEndTime;
          session.actualEndTimeIST = formatIST(scheduledEnd);
          const startMs = new Date(session.startTime).getTime();
          const endMs = scheduledEnd.getTime();
          session.durationMinutes = Math.max(1, Math.round((endMs - startMs) / 60000));
        }
      }
    }
  });
}

// START LIBRARY SESSION (QR-2 action)
sessionsRouter.post('/start', (req, res) => {
  try {
    const { registrationId, durationHours = 3, purpose, workstation } = req.body;

    if (!registrationId || typeof registrationId !== 'string') {
      return res.status(400).json({ success: false, message: 'Registration ID is required to start a library session.' });
    }

    autoExpireOverdueSessions();
    const data = db.get();
    const cleanRegId = registrationId.trim();

    // Verify user exists
    const user = data.users.find(
      (u) => u.registrationId.toLowerCase() === cleanRegId.toLowerCase()
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Registration ID "${cleanRegId}" is not recognized. Please complete registration first using QR Code 1.`,
      });
    }

    // Check if the user already has an active session
    const existingActive = data.librarySessions.find(
      (s) => s.registrationId.toLowerCase() === cleanRegId.toLowerCase() && s.status === 'ACTIVE'
    );

    const now = new Date();

    if (existingActive) {
      const scheduledEnd = new Date(existingActive.scheduledEndTime);
      const remainingMs = scheduledEnd.getTime() - now.getTime();
      const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));

      return res.json({
        success: true,
        isExisting: true,
        message: 'Resuming your active library session.',
        session: existingActive,
        remainingSeconds,
        serverTime: now.toISOString(),
      });
    }

    // Validate duration (default: 3 hours, max: 8 hours)
    const hours = Math.min(Math.max(1, Number(durationHours) || 3), 8);
    const durationMs = hours * 60 * 60 * 1000;
    const scheduledEnd = new Date(now.getTime() + durationMs);

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
      purpose: purpose ? String(purpose).trim() : 'Study & Research Session',
      workstation: workstation ? String(workstation).trim() : 'Reading Hall A',
    };

    db.update((d) => {
      d.librarySessions.unshift(newSession);
    });

    db.logActivity(
      'SESSION_STARTED',
      `Session #${newSession.id} initiated by ${user.fullName} (${user.registrationId}) for ${hours}h. Scheduled exit: ${formatIST(scheduledEnd)}.`,
      'SESSION',
      'QR-2 Session Station'
    );

    const remainingSeconds = Math.floor(durationMs / 1000);

    return res.status(201).json({
      success: true,
      isExisting: false,
      message: `Library session started successfully. Timer active for ${hours} hours.`,
      session: newSession,
      remainingSeconds,
      serverTime: now.toISOString(),
    });
  } catch (error: any) {
    console.error('Error starting session:', error);
    return res.status(500).json({ success: false, message: 'Internal server error starting library session.' });
  }
});

// END LIBRARY SESSION (QR-2 action)
sessionsRouter.post('/end', (req, res) => {
  try {
    const { sessionId, registrationId } = req.body;

    if (!sessionId && !registrationId) {
      return res.status(400).json({ success: false, message: 'Session ID or Registration ID is required.' });
    }

    const now = new Date();
    let endedSession: LibrarySession | null = null;

    db.update((data) => {
      const session = data.librarySessions.find((s) => {
        if (s.status !== 'ACTIVE') return false;
        if (sessionId && s.id === sessionId) return true;
        if (registrationId && s.registrationId.toLowerCase() === registrationId.trim().toLowerCase()) return true;
        return false;
      });

      if (session) {
        session.status = 'COMPLETED';
        session.actualEndTime = now.toISOString();
        session.actualEndTimeIST = formatIST(now);
        const startMs = new Date(session.startTime).getTime();
        const durationMin = Math.max(1, Math.round((now.getTime() - startMs) / 60000));
        session.durationMinutes = durationMin;
        endedSession = session;
      }
    });

    if (!endedSession) {
      return res.status(404).json({
        success: false,
        message: 'No active session found matching the provided identifiers.',
      });
    }

    const typedSession = endedSession as LibrarySession;

    db.logActivity(
      'SESSION_CONCLUDED',
      `Session #${typedSession.id} concluded by ${typedSession.userName} (${typedSession.registrationId}). Total duration: ${typedSession.durationMinutes} minutes.`,
      'SESSION',
      'QR-2 Session Station'
    );

    return res.json({
      success: true,
      message: 'Library session recorded and closed successfully.',
      session: typedSession,
    });
  } catch (error: any) {
    console.error('Error ending session:', error);
    return res.status(500).json({ success: false, message: 'Internal server error concluding session.' });
  }
});

// GET CURRENT USER SESSION (for persistent browser refresh synchronization)
sessionsRouter.get('/current/:registrationId', (req, res) => {
  try {
    const regId = req.params.registrationId.trim();
    autoExpireOverdueSessions();
    const data = db.get();
    const now = new Date();

    const activeSession = data.librarySessions.find(
      (s) => s.registrationId.toLowerCase() === regId.toLowerCase() && s.status === 'ACTIVE'
    );

    if (!activeSession) {
      return res.json({
        success: true,
        hasActiveSession: false,
        session: null,
      });
    }

    const scheduledEnd = new Date(activeSession.scheduledEndTime);
    const remainingMs = scheduledEnd.getTime() - now.getTime();
    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
    const elapsedMinutes = Math.max(0, Math.floor((now.getTime() - new Date(activeSession.startTime).getTime()) / 60000));

    return res.json({
      success: true,
      hasActiveSession: true,
      session: activeSession,
      remainingSeconds,
      elapsedMinutes,
      serverTime: now.toISOString(),
    });
  } catch (error: any) {
    console.error('Error getting current session:', error);
    return res.status(500).json({ success: false, message: 'Server error checking active session.' });
  }
});

// GET ALL ACTIVE SESSIONS (for admin dashboard & monitoring)
sessionsRouter.get('/active', (req, res) => {
  try {
    autoExpireOverdueSessions();
    const data = db.get();
    const now = new Date();

    const active = data.librarySessions
      .filter((s) => s.status === 'ACTIVE')
      .map((s) => {
        const scheduledEnd = new Date(s.scheduledEndTime);
        const remainingMs = scheduledEnd.getTime() - now.getTime();
        const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
        const elapsedMinutes = Math.max(0, Math.floor((now.getTime() - new Date(s.startTime).getTime()) / 60000));

        return {
          ...s,
          remainingSeconds,
          elapsedMinutes,
        };
      });

    return res.json({
      success: true,
      count: active.length,
      sessions: active,
      serverTime: now.toISOString(),
      serverTimeIST: formatIST(now),
    });
  } catch (error: any) {
    console.error('Error fetching active sessions:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve active sessions.' });
  }
});

// GET ALL SESSIONS (History with filtering & sorting)
sessionsRouter.get('/history', (req, res) => {
  try {
    const { status, department, search } = req.query;
    autoExpireOverdueSessions();
    const data = db.get();
    let list = [...data.librarySessions];

    if (status && typeof status === 'string' && status !== 'ALL') {
      list = list.filter((s) => s.status === status);
    }

    if (department && typeof department === 'string' && department !== 'ALL') {
      list = list.filter((s) => s.department === department);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.userName.toLowerCase().includes(q) ||
          s.registrationId.toLowerCase().includes(q) ||
          (s.workstation && s.workstation.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    list.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

    return res.json({
      success: true,
      count: list.length,
      sessions: list,
    });
  } catch (error: any) {
    console.error('Error retrieving session history:', error);
    return res.status(500).json({ success: false, message: 'Failed to retrieve session history.' });
  }
});
