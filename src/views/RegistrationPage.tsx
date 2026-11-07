import React, { useState } from 'react';
import {
  UserPlus,
  CheckCircle2,
  Copy,
  ArrowRight,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  Building2,
  UserCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { User, UserPosition } from '../types';

interface RegistrationPageProps {
  onNavigate: (view: string, extraData?: any) => void;
}

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology & Bioengineering',
  'Chemical Engineering',
  'Information Technology',
  'Physics & Quantum Materials',
  'Chemistry & Materials Science',
  'Mathematics & Computing',
  'Management Studies',
  'Library Sciences',
  'Other Department',
];

const POSITIONS: UserPosition[] = [
  'Student',
  'Research Scholar',
  'Faculty',
  'Professor',
  'Staff',
  'Other',
];

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ onNavigate }) => {
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [customDepartment, setCustomDepartment] = useState('');
  const [position, setPosition] = useState<UserPosition>('Student');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registeredUser, setRegisteredUser] = useState<User | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    const cleanName = fullName.trim();
    if (!cleanName || cleanName.length < 2) {
      setErrorMsg('Please enter your full official name (minimum 2 characters).');
      return;
    }

    const finalDepartment = department === 'Other Department' ? customDepartment.trim() : department;
    if (!finalDepartment) {
      setErrorMsg('Please select or specify your university department.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await api.registerUser({
        fullName: cleanName,
        department: finalDepartment,
        position,
        email: email.trim() || undefined,
        contactNumber: contactNumber.trim() || undefined,
      });

      if (res.success && res.user) {
        setRegisteredUser(res.user);
      } else {
        setErrorMsg(res.message || 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Server connection error during registration.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyId = () => {
    if (!registeredUser) return;
    navigator.clipboard.writeText(registeredUser.registrationId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleProceedToLogin = () => {
    if (registeredUser) {
      onNavigate('library-login', { prefilledRegId: registeredUser.registrationId });
    } else {
      onNavigate('library-login');
    }
  };

  const handleResetForm = () => {
    setRegisteredUser(null);
    setFullName('');
    setEmail('');
    setContactNumber('');
    setErrorMsg(null);
  };

  return (
    <div className="max-w-2xl mx-auto py-4">
      {/* Page Header */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold mb-2">
          <span>QR CODE 1 · OFFICIAL DESTINATION</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">University Library Registration</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
          Scan QR Code 1 at any library entrance to register. Your permanent Registration ID is valid across all reading rooms, research carrels, and documentation vaults.
        </p>
      </div>

      {/* Success View */}
      {registeredUser ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-lg space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">Registration Successful!</h2>
            <p className="text-xs text-slate-600 mt-1">
              Your record has been committed to the central library database under 24-hour cycle #{registeredUser.cycleNumber}.
            </p>
          </div>

          {/* Generated Registration ID Card */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-xl p-6 border border-slate-800 shadow-md max-w-md mx-auto">
            <div className="text-[10px] font-mono tracking-widest uppercase text-slate-400 mb-1">
              OFFICIAL REGISTRATION ID
            </div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-blue-300 tracking-wider my-2">
              {registeredUser.registrationId}
            </div>

            <div className="flex items-center justify-center gap-2 mt-3">
              <button
                onClick={handleCopyId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium rounded-md transition-colors text-slate-200 border border-slate-700"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedId ? 'Copied to Clipboard!' : 'Copy Registration ID'}</span>
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-left text-xs text-slate-300">
              <div>
                <span className="text-[10px] text-slate-400 block">Reader Name</span>
                <span className="font-semibold text-white truncate block">{registeredUser.fullName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Position</span>
                <span className="font-semibold text-white">{registeredUser.position}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 block">Academic Department</span>
                <span className="font-semibold text-white text-[11px] truncate block">{registeredUser.department}</span>
              </div>
            </div>
          </div>

          {/* Next Action: Proceed to Library Session Login */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleProceedToLogin}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <span>Proceed to Session Login (QR-2)</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetForm}
              className="w-full sm:w-auto px-4 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors"
            >
              Register Another Reader
            </button>
          </div>
        </div>
      ) : (
        /* Form View */
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-700">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Full Name */}
            <div>
              <label htmlFor="reg-fullname" className="block text-xs font-semibold text-slate-800 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="reg-fullname"
                  type="text"
                  required
                  placeholder="e.g. Debadrito Chakraborty"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-colors"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                As recorded on your official university identity card.
              </span>
            </div>

            {/* 2. Department */}
            <div>
              <label htmlFor="reg-department" className="block text-xs font-semibold text-slate-800 mb-1.5">
                Academic Department <span className="text-red-500">*</span>
              </label>
              <select
                id="reg-department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-colors"
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>

              {department === 'Other Department' && (
                <div className="mt-2.5">
                  <input
                    type="text"
                    required
                    placeholder="Enter custom department or center name"
                    value={customDepartment}
                    onChange={(e) => setCustomDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                  />
                </div>
              )}
            </div>

            {/* 3. Position */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-2">
                University Position / Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {POSITIONS.map((pos) => (
                  <button
                    type="button"
                    key={pos}
                    onClick={() => setPosition(pos)}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-all ${
                      position === pos
                        ? 'bg-blue-50 border-blue-600 text-blue-900 font-semibold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Optional Contact Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label htmlFor="reg-email" className="block text-xs font-medium text-slate-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="reg-phone" className="block text-xs font-medium text-slate-700 mb-1">
                  Phone Number (Optional)
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-semibold text-sm rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{isSubmitting ? 'Validating & Generating ID...' : 'Generate Registration ID & Save'}</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Pre-fill */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Testing the form?</span>
            <button
              type="button"
              onClick={() => {
                setFullName('Debadrito Chakraborty');
                setDepartment('Computer Science and Engineering');
                setPosition('Student');
                setEmail('debadritochakraborty9@gmail.com');
                setContactNumber('+91 98765 43210');
              }}
              className="text-blue-700 hover:text-blue-800 font-medium"
            >
              Fill Sample Student Data
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
