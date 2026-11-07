import React, { useEffect, useState } from 'react';
import {
  FileText,
  Upload,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Download,
  Trash2,
  X,
  Filter,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchPaper, CommunicationStatus } from '../types';

export const ResearchPapersPage: React.FC = () => {
  const [papers, setPapers] = useState<ResearchPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');

  // Summary counts
  const [summary, setSummary] = useState({ total: 0, communicated: 0, notCommunicated: 0 });

  // Upload modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [researcherName, setResearcherName] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [researchDomain, setResearchDomain] = useState('');
  const [description, setDescription] = useState('');
  const [communicationStatus, setCommunicationStatus] = useState<CommunicationStatus>('Not Communicated');
  const [communicationDate, setCommunicationDate] = useState('');
  const [journalConferenceName, setJournalConferenceName] = useState('');
  const [publicationStatus, setPublicationStatus] = useState('Under Review');
  const [doiOrPaperLink, setDoiOrPaperLink] = useState('');
  const [registrationId, setRegistrationId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Status toggle modal state
  const [editingPaper, setEditingPaper] = useState<ResearchPaper | null>(null);
  const [toggleStatus, setToggleStatus] = useState<CommunicationStatus>('Communicated');
  const [toggleJournal, setToggleJournal] = useState('');
  const [toggleDate, setToggleDate] = useState('');
  const [toggleDoi, setToggleDoi] = useState('');
  const [togglePubStatus, setTogglePubStatus] = useState('Under Review');

  const fetchPapers = async () => {
    try {
      setLoading(true);
      const res = await api.getResearchPapers({
        search,
        communicationStatus: statusFilter,
        department: departmentFilter,
      });
      if (res.success) {
        setPapers(res.papers);
        setSummary(res.summary);
      }
    } catch (e) {
      console.error('Error fetching papers:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPapers();
  }, [search, statusFilter, departmentFilter]);

  const handleFileUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleCreatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!title.trim() || !researcherName.trim() || !department.trim() || !researchDomain.trim()) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('researcherName', researcherName.trim());
      formData.append('department', department.trim());
      formData.append('researchDomain', researchDomain.trim());
      formData.append('description', description.trim());
      formData.append('communicationStatus', communicationStatus);
      if (communicationDate) formData.append('communicationDate', communicationDate);
      if (journalConferenceName) formData.append('journalConferenceName', journalConferenceName.trim());
      if (publicationStatus) formData.append('publicationStatus', publicationStatus.trim());
      if (doiOrPaperLink) formData.append('doiOrPaperLink', doiOrPaperLink.trim());
      if (registrationId) formData.append('registrationId', registrationId.trim());
      if (selectedFile) formData.append('file', selectedFile);

      const res = await api.uploadResearchPaper(formData);
      if (res.success) {
        setIsModalOpen(false);
        resetForm();
        fetchPapers();
      } else {
        setErrorMsg(res.message || 'Failed to upload paper.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server error uploading research paper.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setResearcherName('');
    setResearchDomain('');
    setDescription('');
    setCommunicationStatus('Not Communicated');
    setCommunicationDate('');
    setJournalConferenceName('');
    setPublicationStatus('Under Review');
    setDoiOrPaperLink('');
    setRegistrationId('');
    setSelectedFile(null);
    setErrorMsg(null);
  };

  const openStatusEditor = (paper: ResearchPaper) => {
    setEditingPaper(paper);
    setToggleStatus(paper.communicationStatus);
    setToggleJournal(paper.journalConferenceName || '');
    setToggleDate(paper.communicationDate || new Date().toISOString().split('T')[0]);
    setToggleDoi(paper.doiOrPaperLink || '');
    setTogglePubStatus(paper.publicationStatus || 'Under Review');
  };

  const handleSaveStatus = async () => {
    if (!editingPaper) return;
    try {
      const res = await api.updatePaperCommunicationStatus(editingPaper.id, {
        communicationStatus: toggleStatus,
        journalConferenceName: toggleJournal.trim(),
        communicationDate: toggleDate,
        doiOrPaperLink: toggleDoi.trim(),
        publicationStatus: togglePubStatus.trim(),
      });
      if (res.success) {
        setEditingPaper(null);
        fetchPapers();
      }
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  const handleDelete = async (id: string, paperTitle: string) => {
    if (!confirm(`Are you sure you want to delete paper "${paperTitle}"?`)) return;
    try {
      const res = await api.deleteResearchPaper(id);
      if (res.success) fetchPapers();
    } catch (e) {
      console.error('Error deleting paper:', e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Research Paper Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cataloging peer-reviewed manuscripts, tracking communication status to journals and conferences.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Research Paper</span>
        </button>
      </div>

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Total Cataloged Papers</div>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
            {summary.total}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Across all university faculties</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Communicated Papers</div>
          <div className="text-2xl font-bold text-emerald-600 font-mono tabular-nums mt-1">
            {summary.communicated}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Submitted to journals/conferences</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Not Communicated (Pre-Review)</div>
          <div className="text-2xl font-bold text-amber-600 font-mono tabular-nums mt-1">
            {summary.notCommunicated}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Internal drafts & peer revisions</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search papers by title, author, domain, or journal..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600"
          />
        </div>

        {/* Communication Status Filter Buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Papers
          </button>
          <button
            onClick={() => setStatusFilter('Communicated')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'Communicated' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Communicated
          </button>
          <button
            onClick={() => setStatusFilter('Not Communicated')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              statusFilter === 'Not Communicated' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Not Communicated
          </button>
        </div>
      </div>

      {/* Papers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">Loading research catalog...</div>
        ) : papers.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No research papers match your filter</h3>
            <p className="text-xs text-slate-500 mt-1">Upload a research manuscript or reset your search keywords.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Research Paper Details</th>
                  <th className="py-3 px-4">Researcher & Dept</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Communication Status</th>
                  <th className="py-3 px-4">Target Journal / Conf</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {papers.map((paper) => {
                  const isCommunicated = paper.communicationStatus === 'Communicated';
                  return (
                    <tr key={paper.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="font-semibold text-slate-900 leading-snug line-clamp-2">
                          {paper.title}
                        </div>
                        {paper.description && (
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {paper.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 font-mono">
                          <span>{paper.createdAtIST.split(',')[0]}</span>
                          {paper.doiOrPaperLink && (
                            <>
                              <span>·</span>
                              <a
                                href={paper.doiOrPaperLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline flex items-center gap-1"
                              >
                                DOI Link <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{paper.researcherName}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                          {paper.department}
                        </div>
                        {paper.registrationId && (
                          <div className="text-[10px] font-mono text-slate-400">
                            {paper.registrationId}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-slate-700 font-medium">{paper.researchDomain}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          onClick={() => openStatusEditor(paper)}
                          title="Click to toggle or update communication details"
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                            isCommunicated
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {isCommunicated ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                          )}
                          <span>{paper.communicationStatus}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-medium text-slate-800 truncate">
                          {paper.journalConferenceName || '—'}
                        </div>
                        {paper.publicationStatus && (
                          <div className="text-[11px] text-slate-500">
                            Status: {paper.publicationStatus}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={paper.fileUrl || '/uploads/sample-paper-1.pdf'}
                            download={paper.fileName || 'Research_Paper.pdf'}
                            title="Download PDF Manuscript"
                            className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(paper.id, paper.title)}
                            title="Delete paper"
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPLOAD PAPER MODAL (Module 3A Fields) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upload Research Paper Manuscript</h3>
                <p className="text-xs text-slate-500">Provide manuscript metadata and publication status</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePaper} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Research Paper Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scalable Distributed Inference Architectures for Multi-Modal LLMs"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              {/* Researcher & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Researcher Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Debadrito Chakraborty"
                    value={researcherName}
                    onChange={(e) => setResearcherName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science and Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Research Domain & Registration ID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Research Domain <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Computing, Bioinformatics"
                    value={researchDomain}
                    onChange={(e) => setResearchDomain(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Author Registration ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. LIB-2026-10024"
                    value={registrationId}
                    onChange={(e) => setRegistrationId(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-900 focus:outline-hidden focus:border-blue-600 uppercase"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Research Paper Abstract / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of methodology, experimental validation, and key findings..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              {/* Communication Status Toggle & Dependent Fields */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                    Communication Status <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setCommunicationStatus('Communicated')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        communicationStatus === 'Communicated'
                          ? 'bg-emerald-600 text-white font-semibold border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Communicated to Journal/Conf
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommunicationStatus('Not Communicated')}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        communicationStatus === 'Not Communicated'
                          ? 'bg-amber-600 text-white font-semibold border-amber-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Not Communicated (Pre-Review)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Journal / Conference Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. IEEE TPDS, ACM SIGCOMM"
                      value={journalConferenceName}
                      onChange={(e) => setJournalConferenceName(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Communication / Submission Date
                    </label>
                    <input
                      type="date"
                      value={communicationDate}
                      onChange={(e) => setCommunicationDate(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      Publication Status
                    </label>
                    <select
                      value={publicationStatus}
                      onChange={(e) => setPublicationStatus(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                    >
                      <option value="Under Review">Under Review</option>
                      <option value="Revision Requested">Revision Requested</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-700 mb-1">
                      DOI or Paper Link (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="https://doi.org/10.xxxx/..."
                      value={doiOrPaperLink}
                      onChange={(e) => setDoiOrPaperLink(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Upload PDF */}
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Upload Research Paper (PDF)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileUploadChange}
                    className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {selectedFile && (
                    <span className="text-xs text-emerald-600 font-medium truncate">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
                >
                  {isSubmitting ? 'Uploading...' : 'Save & Archive Paper'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK STATUS EDIT MODAL */}
      {editingPaper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Update Communication Status</h3>
              <button onClick={() => setEditingPaper(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs font-semibold text-slate-800 line-clamp-1">
              {editingPaper.title}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Status</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setToggleStatus('Communicated')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border ${
                      toggleStatus === 'Communicated'
                        ? 'bg-emerald-600 text-white font-semibold border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Communicated
                  </button>
                  <button
                    type="button"
                    onClick={() => setToggleStatus('Not Communicated')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg border ${
                      toggleStatus === 'Not Communicated'
                        ? 'bg-amber-600 text-white font-semibold border-amber-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Not Communicated
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Journal / Conference Name</label>
                <input
                  type="text"
                  value={toggleJournal}
                  onChange={(e) => setToggleJournal(e.target.value)}
                  placeholder="e.g. IEEE Access, Springer LNCS"
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={toggleDate}
                    onChange={(e) => setToggleDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Publication Status</label>
                  <select
                    value={togglePubStatus}
                    onChange={(e) => setTogglePubStatus(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Under Review">Under Review</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Published">Published</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">DOI Link</label>
                <input
                  type="text"
                  value={toggleDoi}
                  onChange={(e) => setToggleDoi(e.target.value)}
                  placeholder="https://doi.org/..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingPaper(null)}
                className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-lg text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStatus}
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white font-semibold rounded-lg text-xs shadow-xs"
              >
                Save Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
