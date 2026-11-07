import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db, formatIST, ResearchPaper, ProjectReport, Presentation } from '../db.js';

export const researchRouter = Router();

const UPLOADS_DIR = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Generate sample downloadable dummy document files if they don't exist yet
const sampleFiles = [
  { name: 'sample-paper-1.pdf', text: '%PDF-1.4 Research Paper: Scalable Distributed Inference Architectures for Multi-Modal LLM Serving' },
  { name: 'sample-paper-2.pdf', text: '%PDF-1.4 Research Paper: CRISPR Target Selection Algorithms Utilizing Quantum-Inspired Annealing' },
  { name: 'sample-paper-3.pdf', text: '%PDF-1.4 Research Paper: Low-Power Sub-6GHz Phased Array Antenna Optimization' },
  { name: 'sample-project-1.pdf', text: '%PDF-1.4 Project Capstone Report: Smart Autonomous Solar-Powered Microgrid Monitoring' },
  { name: 'sample-project-2.pdf', text: '%PDF-1.4 Project Capstone Report: Automated Bio-Chemical Spectrophotometer Sensor Calibration Suite' },
  { name: 'sample-presentation-1.pptx', text: 'PPTX Presentation Deck: Accelerating Transformer Attention Mechanisms with FlashDecoders' },
  { name: 'sample-presentation-2.pptx', text: 'PPTX Presentation Deck: Next-Generation Smart Materials for Vibration Damping in Aerospace' },
];

for (const sample of sampleFiles) {
  const filePath = path.join(UPLOADS_DIR, sample.name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, sample.text, 'utf-8');
  }
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}_${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.pdf', '.ppt', '.pptx', '.doc', '.docx', '.txt'];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file format ${ext}. Allowed formats: PDF, PPT, PPTX, DOC, DOCX`));
    }
  },
});

/* ========================================================
   1. RESEARCH PAPERS
   ======================================================== */

// GET ALL RESEARCH PAPERS
researchRouter.get('/papers', (req, res) => {
  try {
    const { communicationStatus, department, search } = req.query;
    const data = db.get();
    let papers = [...data.researchPapers];

    if (communicationStatus && typeof communicationStatus === 'string' && communicationStatus !== 'ALL') {
      papers = papers.filter((p) => p.communicationStatus === communicationStatus);
    }

    if (department && typeof department === 'string' && department !== 'ALL') {
      papers = papers.filter((p) => p.department === department);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      papers = papers.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.researcherName.toLowerCase().includes(q) ||
          p.researchDomain.toLowerCase().includes(q) ||
          (p.journalConferenceName && p.journalConferenceName.toLowerCase().includes(q))
      );
    }

    papers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      count: papers.length,
      papers,
      summary: {
        total: data.researchPapers.length,
        communicated: data.researchPapers.filter((p) => p.communicationStatus === 'Communicated').length,
        notCommunicated: data.researchPapers.filter((p) => p.communicationStatus === 'Not Communicated').length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching research papers:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch research papers' });
  }
});

// UPLOAD / CREATE RESEARCH PAPER
researchRouter.post('/papers', upload.single('file'), (req, res) => {
  try {
    const {
      title,
      researcherName,
      department,
      researchDomain,
      description,
      communicationStatus,
      communicationDate,
      journalConferenceName,
      publicationStatus,
      doiOrPaperLink,
      registrationId,
    } = req.body;

    if (!title || !researcherName || !department || !researchDomain) {
      return res.status(400).json({
        success: false,
        message: 'Title, Researcher Name, Department, and Research Domain are required fields.',
      });
    }

    const now = new Date();
    const file = req.file;

    const newPaper: ResearchPaper = {
      id: `pap_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      researcherName: researcherName.trim(),
      department: department.trim(),
      researchDomain: researchDomain.trim(),
      description: (description || '').trim(),
      communicationStatus: communicationStatus === 'Communicated' ? 'Communicated' : 'Not Communicated',
      communicationDate: communicationDate ? String(communicationDate) : undefined,
      journalConferenceName: journalConferenceName ? String(journalConferenceName).trim() : undefined,
      publicationStatus: publicationStatus ? String(publicationStatus).trim() : 'Under Review',
      doiOrPaperLink: doiOrPaperLink ? String(doiOrPaperLink).trim() : undefined,
      fileName: file ? file.filename : 'Manuscript_Preprint.pdf',
      fileUrl: file ? `/uploads/${file.filename}` : '/uploads/sample-paper-1.pdf',
      fileSize: file ? file.size : 2048000,
      fileType: file ? file.mimetype : 'application/pdf',
      registrationId: registrationId ? String(registrationId).trim() : undefined,
      createdAt: now.toISOString(),
      createdAtIST: formatIST(now),
    };

    db.update((data) => {
      data.researchPapers.unshift(newPaper);
    });

    db.logActivity(
      'RESEARCH_PAPER_UPLOADED',
      `Research paper "${newPaper.title}" uploaded by ${newPaper.researcherName} (${newPaper.communicationStatus}).`,
      'DOCUMENT',
      newPaper.researcherName
    );

    return res.status(201).json({
      success: true,
      message: 'Research paper successfully registered and archived.',
      paper: newPaper,
    });
  } catch (error: any) {
    console.error('Error creating research paper:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error uploading research paper' });
  }
});

// TOGGLE COMMUNICATION STATUS OF A RESEARCH PAPER
researchRouter.patch('/papers/:id/communication-status', (req, res) => {
  try {
    const { id } = req.params;
    const { communicationStatus, journalConferenceName, communicationDate, doiOrPaperLink, publicationStatus } = req.body;

    if (!['Communicated', 'Not Communicated'].includes(communicationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Communication status must be either "Communicated" or "Not Communicated".',
      });
    }

    let updatedPaper: ResearchPaper | null = null;

    db.update((data) => {
      const paper = data.researchPapers.find((p) => p.id === id);
      if (paper) {
        paper.communicationStatus = communicationStatus;
        if (journalConferenceName !== undefined) paper.journalConferenceName = journalConferenceName;
        if (communicationDate !== undefined) paper.communicationDate = communicationDate;
        if (doiOrPaperLink !== undefined) paper.doiOrPaperLink = doiOrPaperLink;
        if (publicationStatus !== undefined) paper.publicationStatus = publicationStatus;
        updatedPaper = paper;
      }
    });

    if (!updatedPaper) {
      return res.status(404).json({ success: false, message: 'Research paper not found' });
    }

    const typed = updatedPaper as ResearchPaper;

    db.logActivity(
      'PAPER_STATUS_UPDATED',
      `Communication status for paper "${typed.title}" updated to "${communicationStatus}".`,
      'DOCUMENT',
      'Research Administrator'
    );

    return res.json({
      success: true,
      message: `Communication status updated to ${communicationStatus}`,
      paper: typed,
    });
  } catch (error: any) {
    console.error('Error updating paper status:', error);
    return res.status(500).json({ success: false, message: 'Server error updating paper status' });
  }
});

// DELETE RESEARCH PAPER
researchRouter.delete('/papers/:id', (req, res) => {
  try {
    const { id } = req.params;
    let deletedTitle = '';

    db.update((data) => {
      const idx = data.researchPapers.findIndex((p) => p.id === id);
      if (idx !== -1) {
        deletedTitle = data.researchPapers[idx].title;
        data.researchPapers.splice(idx, 1);
      }
    });

    if (!deletedTitle) {
      return res.status(404).json({ success: false, message: 'Research paper not found' });
    }

    db.logActivity(
      'RESEARCH_PAPER_DELETED',
      `Research paper "${deletedTitle}" was deleted from archive.`,
      'DOCUMENT',
      'Research Administrator'
    );

    return res.json({ success: true, message: 'Paper deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete research paper' });
  }
});

/* ========================================================
   2. PROJECT REPORTS
   ======================================================== */

// GET ALL PROJECT REPORTS
researchRouter.get('/projects', (req, res) => {
  try {
    const { department, search } = req.query;
    const data = db.get();
    let projects = [...data.projectReports];

    if (department && typeof department === 'string' && department !== 'ALL') {
      projects = projects.filter((p) => p.department === department);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      projects = projects.filter(
        (p) =>
          p.projectTitle.toLowerCase().includes(q) ||
          p.projectDomain.toLowerCase().includes(q) ||
          p.projectGuideSupervisor.toLowerCase().includes(q)
      );
    }

    projects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      count: projects.length,
      projects,
      total: data.projectReports.length,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch project reports' });
  }
});

// UPLOAD / CREATE PROJECT REPORT
researchRouter.post('/projects', upload.single('file'), (req, res) => {
  try {
    const {
      projectTitle,
      description,
      department,
      projectDomain,
      projectGuideSupervisor,
      submissionDate,
      registrationId,
    } = req.body;

    if (!projectTitle || !department || !projectDomain || !projectGuideSupervisor) {
      return res.status(400).json({
        success: false,
        message: 'Project Title, Department, Domain, and Guide/Supervisor are required.',
      });
    }

    const now = new Date();
    const file = req.file;

    const newProject: ProjectReport = {
      id: `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      projectTitle: projectTitle.trim(),
      description: (description || '').trim(),
      department: department.trim(),
      projectDomain: projectDomain.trim(),
      projectGuideSupervisor: projectGuideSupervisor.trim(),
      submissionDate: submissionDate || now.toISOString().split('T')[0],
      fileName: file ? file.filename : 'Project_Report.pdf',
      fileUrl: file ? `/uploads/${file.filename}` : '/uploads/sample-project-1.pdf',
      fileSize: file ? file.size : 3500000,
      registrationId: registrationId ? String(registrationId).trim() : undefined,
      createdAt: now.toISOString(),
      createdAtIST: formatIST(now),
    };

    db.update((data) => {
      data.projectReports.unshift(newProject);
    });

    db.logActivity(
      'PROJECT_REPORT_UPLOADED',
      `Project report "${newProject.projectTitle}" submitted under Guide ${newProject.projectGuideSupervisor}.`,
      'DOCUMENT',
      newProject.projectGuideSupervisor
    );

    return res.status(201).json({
      success: true,
      message: 'Project report uploaded and archived successfully.',
      project: newProject,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error uploading project report' });
  }
});

// DELETE PROJECT REPORT
researchRouter.delete('/projects/:id', (req, res) => {
  try {
    const { id } = req.params;
    let deletedTitle = '';

    db.update((data) => {
      const idx = data.projectReports.findIndex((p) => p.id === id);
      if (idx !== -1) {
        deletedTitle = data.projectReports[idx].projectTitle;
        data.projectReports.splice(idx, 1);
      }
    });

    if (!deletedTitle) {
      return res.status(404).json({ success: false, message: 'Project report not found' });
    }

    return res.json({ success: true, message: 'Project report deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete project report' });
  }
});

/* ========================================================
   3. PPT PRESENTATIONS
   ======================================================== */

// GET ALL PPT PRESENTATIONS
researchRouter.get('/presentations', (req, res) => {
  try {
    const { department, search } = req.query;
    const data = db.get();
    let list = [...data.presentations];

    if (department && typeof department === 'string' && department !== 'ALL') {
      list = list.filter((p) => p.department === department);
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.presentationTitle.toLowerCase().includes(q) ||
          p.presenterName.toLowerCase().includes(q) ||
          p.presentationDomain.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      count: list.length,
      presentations: list,
      total: data.presentations.length,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch presentations' });
  }
});

// UPLOAD / CREATE PPT PRESENTATION
researchRouter.post('/presentations', upload.single('file'), (req, res) => {
  try {
    const {
      presentationTitle,
      presenterName,
      department,
      presentationDomain,
      presentationDate,
      registrationId,
    } = req.body;

    if (!presentationTitle || !presenterName || !department || !presentationDomain) {
      return res.status(400).json({
        success: false,
        message: 'Presentation Title, Presenter Name, Department, and Domain are required.',
      });
    }

    const now = new Date();
    const file = req.file;

    const newPpt: Presentation = {
      id: `ppt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      presentationTitle: presentationTitle.trim(),
      presenterName: presenterName.trim(),
      department: department.trim(),
      presentationDomain: presentationDomain.trim(),
      presentationDate: presentationDate || now.toISOString().split('T')[0],
      fileName: file ? file.filename : 'Presentation_Deck.pptx',
      fileUrl: file ? `/uploads/${file.filename}` : '/uploads/sample-presentation-1.pptx',
      fileSize: file ? file.size : 5200000,
      registrationId: registrationId ? String(registrationId).trim() : undefined,
      createdAt: now.toISOString(),
      createdAtIST: formatIST(now),
    };

    db.update((data) => {
      data.presentations.unshift(newPpt);
    });

    db.logActivity(
      'PRESENTATION_UPLOADED',
      `Presentation "${newPpt.presentationTitle}" uploaded by ${newPpt.presenterName}.`,
      'DOCUMENT',
      newPpt.presenterName
    );

    return res.status(201).json({
      success: true,
      message: 'Presentation deck uploaded and archived successfully.',
      presentation: newPpt,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Error uploading presentation' });
  }
});

// DELETE PPT PRESENTATION
researchRouter.delete('/presentations/:id', (req, res) => {
  try {
    const { id } = req.params;
    let deletedTitle = '';

    db.update((data) => {
      const idx = data.presentations.findIndex((p) => p.id === id);
      if (idx !== -1) {
        deletedTitle = data.presentations[idx].presentationTitle;
        data.presentations.splice(idx, 1);
      }
    });

    if (!deletedTitle) {
      return res.status(404).json({ success: false, message: 'Presentation not found' });
    }

    return res.json({ success: true, message: 'Presentation deleted' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to delete presentation' });
  }
});
