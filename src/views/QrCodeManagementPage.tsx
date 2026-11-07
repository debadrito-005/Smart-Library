import React, { useEffect, useState } from 'react';
import {
  QrCode,
  Download,
  Printer,
  Camera,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  FileDown,
} from 'lucide-react';
import jsPDF from 'jspdf';
import { api } from '../services/api';
import { QrCodesResponse } from '../types';

interface QrCodeManagementPageProps {
  onOpenScanner: () => void;
  onNavigate: (view: string) => void;
}

export const QrCodeManagementPage: React.FC<QrCodeManagementPageProps> = ({
  onOpenScanner,
  onNavigate,
}) => {
  const [qrData, setQrData] = useState<QrCodesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        setLoading(true);
        const res = await api.getQrCodes();
        if (res.success) setQrData(res);
      } catch (e) {
        console.error('Error fetching static QR codes:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchCodes();
  }, []);

  const downloadPng = (dataUrl: string, filename: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
  };

  const downloadSvg = (svgString: string, filename: string) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate a printable official university PDF placard
  const generatePdfPlacard = (qrCodeNumber: 1 | 2) => {
    if (!qrData) return;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const isQr1 = qrCodeNumber === 1;
    const title = isQr1
      ? 'LIBRARY REGISTRATION DESK (QR CODE 1)'
      : 'LIBRARY SESSION & VERIFICATION DESK (QR CODE 2)';
    const subtitle = isQr1
      ? 'Scan this permanent QR code to register your scholar profile and receive a unique Registration ID.'
      : 'Scan this permanent QR code upon entering reading carrels to start your persistent study session.';
    const targetUrl = isQr1 ? qrData.qr1.targetUrl : qrData.qr2.targetUrl;
    const pngData = isQr1 ? qrData.qr1.pngDataUrl : qrData.qr2.pngDataUrl;

    // Header styling
    doc.setFillColor(15, 23, 42); // Navy 900
    doc.rect(0, 0, 210, 45, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('CENTRAL UNIVERSITY RESEARCH LIBRARY', 105, 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Smart QR-Based Research Registration & Session Management System', 105, 30, { align: 'center' });

    // Section title
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(title, 105, 65, { align: 'center' });

    // Instructions
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    doc.text(doc.splitTextToSize(subtitle, 160), 105, 75, { align: 'center' });

    // QR Image
    if (pngData) {
      doc.addImage(pngData, 'PNG', 55, 95, 100, 100);
    }

    // Border around QR
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.8);
    doc.rect(50, 90, 110, 110);

    // Target URL display
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(30, 215, 150, 18, 3, 3, 'F');
    doc.setTextColor(30, 41, 59);
    doc.setFont('courier', 'bold');
    doc.setFontSize(10);
    doc.text(`STATIC TARGET: ${targetUrl}`, 105, 226, { align: 'center' });

    // Footer notice
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.text('Permanent Static QR Code · Verified Asia/Kolkata 24-Hour Cycle Management', 105, 260, { align: 'center' });
    doc.text('Do not alter or replace. Valid indefinitely.', 105, 266, { align: 'center' });

    doc.save(isQr1 ? 'Library_Placard_QR1_Registration.pdf' : 'Library_Placard_QR2_Login.pdf');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Static QR Code Infrastructure</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            The two core permanent static QR codes governing user registration and reading session verification.
          </p>
        </div>

        <button
          onClick={onOpenScanner}
          className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors self-start sm:self-auto"
        >
          <Camera className="w-4 h-4" />
          <span>Launch Camera Scanner</span>
        </button>
      </div>

      {/* Permanence Assurance Banner */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-3 text-xs text-blue-900">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-bold">Permanent Project Lifecycle Contract</div>
          <p className="text-blue-800 leading-relaxed text-[11px]">
            Both QR codes remain 100% static and never change throughout the project lifecycle. They do not expire when daily registration cycles rollover. Mount them permanently on printed notices, entry acrylic stanchions, and library gate turnstiles.
          </p>
        </div>
      </div>

      {/* QR Codes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* QR 1: Registration */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                STATIC CODE 1
              </span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active & Verified</span>
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">Registration QR Code</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Routes new users, students, and research scholars to the official library registration form.
              </p>
            </div>

            {/* QR Preview Box */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200">
              {qrData?.qr1.pngDataUrl ? (
                <img
                  src={qrData.qr1.pngDataUrl}
                  alt="Registration QR Code"
                  className="w-48 h-48 bg-white p-3 rounded-xl border border-slate-300 shadow-xs"
                />
              ) : (
                <div className="w-48 h-48 bg-slate-200 rounded-xl animate-pulse" />
              )}
              <code className="mt-3 text-[11px] font-mono text-slate-700 bg-white px-3 py-1 rounded border border-slate-200 max-w-full truncate">
                {qrData?.qr1.targetUrl || '/register'}
              </code>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="font-semibold text-slate-900">Scanning Workflow:</div>
              <div>1. Scholar scans QR code at entrance kiosk</div>
              <div>2. Completes form (Name, Dept, Position)</div>
              <div>3. Receives unique Registration ID (e.g. LIB-2026-XXXXX)</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => qrData?.qr1 && downloadPng(qrData.qr1.pngDataUrl, 'Library_Registration_QR1.png')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>

              <button
                onClick={() => qrData?.qr1 && downloadSvg(qrData.qr1.svgString, 'Library_Registration_QR1.svg')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Vector SVG</span>
              </button>
            </div>

            <button
              onClick={() => generatePdfPlacard(1)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Download Printable Placard (PDF)</span>
            </button>

            <button
              onClick={() => onNavigate('register')}
              className="w-full text-center text-xs text-blue-700 hover:underline pt-1"
            >
              Open Live Target Page in Browser →
            </button>
          </div>
        </div>

        {/* QR 2: Library Login */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                STATIC CODE 2
              </span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active & Verified</span>
              </span>
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">Library Login & Session QR Code</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authenticates registered scholars, displays welcome message, and runs persistent countdown timer.
              </p>
            </div>

            {/* QR Preview Box */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-xl border border-slate-200">
              {qrData?.qr2.pngDataUrl ? (
                <img
                  src={qrData.qr2.pngDataUrl}
                  alt="Library Login QR Code"
                  className="w-48 h-48 bg-white p-3 rounded-xl border border-slate-300 shadow-xs"
                />
              ) : (
                <div className="w-48 h-48 bg-slate-200 rounded-xl animate-pulse" />
              )}
              <code className="mt-3 text-[11px] font-mono text-slate-700 bg-white px-3 py-1 rounded border border-slate-200 max-w-full truncate">
                {qrData?.qr2.targetUrl || '/library-login'}
              </code>
            </div>

            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div className="font-semibold text-slate-900">Scanning Workflow:</div>
              <div>1. Scholar enters reading hall and scans QR-2</div>
              <div>2. Enters Registration ID (e.g. LIB-2026-10024)</div>
              <div>3. Starts session timer (persists on reload) & ends on exit</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => qrData?.qr2 && downloadPng(qrData.qr2.pngDataUrl, 'Library_Login_Session_QR2.png')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>

              <button
                onClick={() => qrData?.qr2 && downloadSvg(qrData.qr2.svgString, 'Library_Login_Session_QR2.svg')}
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>Vector SVG</span>
              </button>
            </div>

            <button
              onClick={() => generatePdfPlacard(2)}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Download Printable Placard (PDF)</span>
            </button>

            <button
              onClick={() => onNavigate('library-login')}
              className="w-full text-center text-xs text-emerald-700 hover:underline pt-1"
            >
              Open Live Target Page in Browser →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
