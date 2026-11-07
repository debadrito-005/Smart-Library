import React, { useEffect, useState } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  Download,
  Trash2,
  X,
  AlertCircle,
  Calendar,
  UserCheck,
  Building2,
} from 'lucide-react';
import { api } from '../services/api';
import { ProjectReport } from '../types';

export const ProjectReportsPage: React.FC = () => {
  const [projects, setProjects] = useState<ProjectReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form
  const [projectTitle, setProjectTitle] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [projectDomain, setProjectDomain] = useState('');
  const [projectGuideSupervisor, setProjectGuideSupervisor] = useState('');
  const [submissionDate, setSubmissionDate] = useState(new Date().toISOString().split('T')[0]);
  const [registrationId, setRegistrationId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await api.getProjectReports({
        department: departmentFilter,
        search,
      });
      if (res.success) setProjects(res.projects);
    } catch (e) {
      console.error('Error fetching project reports:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, departmentFilter]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!projectTitle.trim() || !department.trim() || !projectDomain.trim() || !projectGuideSupervisor.trim()) {
      setErrorMsg('Please complete all mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('projectTitle', projectTitle.trim());
      formData.append('description', description.trim());
      formData.append('department', department.trim());
      formData.append('projectDomain', projectDomain.trim());
      formData.append('projectGuideSupervisor', projectGuideSupervisor.trim());
      formData.append('submissionDate', submissionDate);
      if (registrationId) formData.append('registrationId', registrationId.trim());
      if (selectedFile) formData.append('file', selectedFile);

      const res = await api.uploadProjectReport(formData);
      if (res.success) {
        setIsModalOpen(false);
        resetForm();
        fetchProjects();
      } else {
        setErrorMsg(res.message || 'Failed to upload report.');
      }
    } catch (err: any) {
      setErrorMsg('Server error uploading project report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setProjectTitle('');
    setDescription('');
    setProjectDomain('');
    setProjectGuideSupervisor('');
    setRegistrationId('');
    setSelectedFile(null);
    setErrorMsg(null);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete project report "${title}"?`)) return;
    try {
      const res = await api.deleteProjectReport(id);
      if (res.success) fetchProjects();
    } catch (e) {
      console.error('Error deleting project report:', e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Project Report Documentation</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Archiving B.Tech Capstone, M.Tech Theses, and Industry-Sponsored Project Dissertations.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload Project Report</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search projects by title, domain, or supervisor guide..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600"
          />
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">Loading project reports...</div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center">
            <FolderGit2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No project reports found</h3>
            <p className="text-xs text-slate-500 mt-1">Upload student or departmental project dissertations.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Project Title & Description</th>
                  <th className="py-3 px-4">Department & Domain</th>
                  <th className="py-3 px-4">Guide / Supervisor</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((proj) => (
                  <tr key={proj.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 line-clamp-2">
                        {proj.projectTitle}
                      </div>
                      {proj.description && (
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {proj.description}
                        </div>
                      )}
                      {proj.registrationId && (
                        <div className="text-[10px] font-mono text-slate-400 mt-1">
                          Author ID: {proj.registrationId}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{proj.department}</div>
                      <div className="text-[11px] text-slate-500">{proj.projectDomain}</div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-800 flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span>{proj.projectGuideSupervisor}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600">
                      {proj.submissionDate}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={proj.fileUrl || '/uploads/sample-project-1.pdf'}
                          download={proj.fileName || 'Project_Report.pdf'}
                          title="Download Report PDF"
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(proj.id, proj.projectTitle)}
                          title="Delete report"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UPLOAD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full border border-slate-200 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Upload Project Dissertation / Report</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Autonomous Solar-Powered Microgrid Monitoring"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Project Domain <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Renewable Energy, Embedded IoT"
                    value={projectDomain}
                    onChange={(e) => setProjectDomain(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Project Guide / Supervisor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. V. K. Ramanujan"
                    value={projectGuideSupervisor}
                    onChange={(e) => setProjectGuideSupervisor(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Submission Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={submissionDate}
                    onChange={(e) => setSubmissionDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Project Abstract / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Summary of project goals, hardware/software stack, and conclusions..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
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
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Upload Project Report (PDF)
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold rounded-lg text-xs shadow-xs"
                >
                  {isSubmitting ? 'Uploading...' : 'Save Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
