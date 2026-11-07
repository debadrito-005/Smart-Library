import React, { useEffect, useState } from 'react';
import {
  Presentation as PresentationIcon,
  Plus,
  Search,
  Download,
  Trash2,
  X,
  AlertCircle,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { Presentation } from '../types';

export const PresentationsPage: React.FC = () => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form
  const [presentationTitle, setPresentationTitle] = useState('');
  const [presenterName, setPresenterName] = useState('');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [presentationDomain, setPresentationDomain] = useState('');
  const [presentationDate, setPresentationDate] = useState(new Date().toISOString().split('T')[0]);
  const [registrationId, setRegistrationId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchPresentations = async () => {
    try {
      setLoading(true);
      const res = await api.getPresentations({
        department: departmentFilter,
        search,
      });
      if (res.success) setPresentations(res.presentations);
    } catch (e) {
      console.error('Error fetching presentations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentations();
  }, [search, departmentFilter]);

  const handleCreatePresentation = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!presentationTitle.trim() || !presenterName.trim() || !department.trim() || !presentationDomain.trim()) {
      setErrorMsg('Please complete all mandatory fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('presentationTitle', presentationTitle.trim());
      formData.append('presenterName', presenterName.trim());
      formData.append('department', department.trim());
      formData.append('presentationDomain', presentationDomain.trim());
      formData.append('presentationDate', presentationDate);
      if (registrationId) formData.append('registrationId', registrationId.trim());
      if (selectedFile) formData.append('file', selectedFile);

      const res = await api.uploadPresentation(formData);
      if (res.success) {
        setIsModalOpen(false);
        resetForm();
        fetchPresentations();
      } else {
        setErrorMsg(res.message || 'Failed to upload presentation.');
      }
    } catch (err: any) {
      setErrorMsg('Server error uploading presentation deck.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setPresentationTitle('');
    setPresenterName('');
    setPresentationDomain('');
    setRegistrationId('');
    setSelectedFile(null);
    setErrorMsg(null);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete presentation "${title}"?`)) return;
    try {
      const res = await api.deletePresentation(id);
      if (res.success) fetchPresentations();
    } catch (e) {
      console.error('Error deleting presentation:', e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">PPT Presentation Vault</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Archiving Departmental Colloquia, Doctoral Defense Slides, and Keynote Presentation Decks.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Upload PPT Presentation</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search presentations by title, presenter name, or domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600"
          />
        </div>
      </div>

      {/* Presentations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500 font-mono">Loading presentation decks...</div>
        ) : presentations.length === 0 ? (
          <div className="p-12 text-center">
            <PresentationIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No presentation decks found</h3>
            <p className="text-xs text-slate-500 mt-1">Upload seminar, conference, or thesis defense slides.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Presentation Title</th>
                  <th className="py-3 px-4">Presenter Name & Dept</th>
                  <th className="py-3 px-4">Domain</th>
                  <th className="py-3 px-4">Presentation Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {presentations.map((ppt) => (
                  <tr key={ppt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 line-clamp-2">
                        {ppt.presentationTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Deck: {ppt.fileName || 'Presentation.pptx'}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">{ppt.presenterName}</div>
                      <div className="text-[11px] text-slate-500">{ppt.department}</div>
                      {ppt.registrationId && (
                        <div className="text-[10px] font-mono text-slate-400">
                          {ppt.registrationId}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-slate-700 font-medium">{ppt.presentationDomain}</span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-slate-600">
                      {ppt.presentationDate}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={ppt.fileUrl || '/uploads/sample-presentation-1.pptx'}
                          download={ppt.fileName || 'Presentation_Deck.pptx'}
                          title="Download PPT/PDF"
                          className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => handleDelete(ppt.id, ppt.presentationTitle)}
                          title="Delete presentation"
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
              <h3 className="text-base font-bold text-slate-900">Upload Presentation Deck (PPT/PPTX/PDF)</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePresentation} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Presentation Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Accelerating Transformer Attention Mechanisms with FlashDecoders"
                  value={presentationTitle}
                  onChange={(e) => setPresentationTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Presenter Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Debadrito Chakraborty"
                    value={presenterName}
                    onChange={(e) => setPresenterName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>

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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Presentation Domain <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Machine Learning Systems, VLSI Design"
                    value={presentationDomain}
                    onChange={(e) => setPresentationDomain(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    Presentation Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={presentationDate}
                    onChange={(e) => setPresentationDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Presenter Registration ID (Optional)
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
                  Upload PPT/PPTX/PDF Deck
                </label>
                <input
                  type="file"
                  accept=".ppt,.pptx,.pdf"
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
                  {isSubmitting ? 'Uploading...' : 'Save Presentation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
