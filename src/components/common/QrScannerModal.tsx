import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Upload, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (decodedText: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ isOpen, onClose, onScanResult }) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'file' | 'demo'>('camera');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const containerId = 'qr-camera-stream-box';

  useEffect(() => {
    isMountedRef.current = true;

    if (!isOpen) {
      safeStopCamera();
      setErrorMsg(null);
      setSuccessMsg(null);
      return;
    }

    if (activeTab === 'camera') {
      // Delay camera start slightly to ensure container is in DOM
      const timer = setTimeout(() => {
        if (isMountedRef.current && isOpen) {
          startCamera();
        }
      }, 100);
      return () => clearTimeout(timer);
    } else {
      safeStopCamera();
    }

    return () => {
      isMountedRef.current = false;
      safeStopCamera();
    };
  }, [isOpen, activeTab]);

  const safeStopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
      } catch (err) {
        // Suppress any stop/abort errors
      }
      try {
        html5QrCodeRef.current.clear();
      } catch (e) {
        // Suppress clear errors
      }
      html5QrCodeRef.current = null;
    }
    if (isMountedRef.current) {
      setIsScanning(false);
    }
  };

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      await safeStopCamera();

      const container = document.getElementById(containerId);
      if (!container) return;

      const scanner = new Html5Qrcode(containerId);
      html5QrCodeRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          handleDetected(decodedText);
        },
        () => {
          // Frame-by-frame ignore
        }
      );

      if (isMountedRef.current) {
        setIsScanning(true);
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      if (isMountedRef.current) {
        setIsScanning(false);
        setErrorMsg('Unable to access camera. Please allow camera permissions or use the Upload Image / Quick Test tab.');
      }
    }
  };

  const handleDetected = (text: string) => {
    if (!isMountedRef.current) return;
    setSuccessMsg(`QR Code Detected: ${text}`);
    safeStopCamera();
    setTimeout(() => {
      if (isMountedRef.current) {
        onScanResult(text);
        onClose();
      }
    }, 600);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSuccessMsg(null);

    // Create a temporary off-screen div completely outside React's fiber tree
    const tempId = `offscreen_qr_${Date.now()}`;
    const tempDiv = document.createElement('div');
    tempDiv.id = tempId;
    tempDiv.style.position = 'fixed';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    tempDiv.style.width = '100px';
    tempDiv.style.height = '100px';
    document.body.appendChild(tempDiv);

    try {
      const scanner = new Html5Qrcode(tempId);
      const result = await scanner.scanFile(file, true);
      try {
        scanner.clear();
      } catch (e) {}
      handleDetected(result);
    } catch (err: any) {
      if (isMountedRef.current) {
        setErrorMsg('No readable QR code found in this image. Please upload a clear QR code image.');
      }
    } finally {
      if (tempDiv.parentNode) {
        tempDiv.parentNode.removeChild(tempDiv);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Scan Permanent QR Code</h3>
            <p className="text-xs text-slate-500 mt-0.5">Use camera, upload a saved QR image, or simulate a reader scan</p>
          </div>
          <button
            onClick={() => {
              safeStopCamera();
              onClose();
            }}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 p-1">
          <button
            onClick={() => {
              safeStopCamera();
              setActiveTab('camera');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${
              activeTab === 'camera' ? 'bg-white text-blue-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4" />
            Live Camera
          </button>
          <button
            onClick={() => {
              safeStopCamera();
              setActiveTab('file');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${
              activeTab === 'file' ? 'bg-white text-blue-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </button>
          <button
            onClick={() => {
              safeStopCamera();
              setActiveTab('demo');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-md transition-all ${
              activeTab === 'demo' ? 'bg-white text-blue-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            Quick Test
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2.5 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span className="font-medium truncate">{successMsg}</span>
            </div>
          )}

          {/* Camera Viewport - Always mounted, hidden when not in camera tab to prevent fiber unmount collisions */}
          <div className={activeTab === 'camera' ? 'block' : 'hidden'}>
            <div className="relative w-full h-64 bg-slate-950 rounded-lg overflow-hidden border border-slate-300 flex items-center justify-center">
              {/* NOTE: Absolutely NO React children inside #qr-camera-stream-box */}
              <div id={containerId} className="w-full h-full" />
              
              {!isScanning && !errorMsg && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <span className="text-xs text-slate-400 bg-slate-900/80 px-3 py-1.5 rounded-md">
                    Initializing camera stream...
                  </span>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-3 text-center">
              Point your camera at QR Code 1 (Registration) or QR Code 2 (Library Login).
            </p>
          </div>

          {/* File Upload View */}
          {activeTab === 'file' && (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-8 hover:bg-slate-50/50 transition-colors">
              <Upload className="w-10 h-10 text-slate-400 mb-3" />
              <p className="text-sm font-medium text-slate-700 mb-1">Select or drop a QR image file</p>
              <p className="text-xs text-slate-500 mb-4 text-center">Supports PNG, JPG, or screenshot files</p>
              <label className="px-4 py-2 bg-blue-700 text-white text-xs font-semibold rounded-lg hover:bg-blue-800 transition-colors cursor-pointer shadow-xs">
                Choose Image File
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          {/* Quick Simulation View */}
          {activeTab === 'demo' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600 mb-2">
                Click any permanent static QR trigger below to test scanner redirection immediately:
              </p>
              <button
                type="button"
                onClick={() => handleDetected('/register')}
                className="w-full text-left p-3.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-900">
                    Simulate QR Code 1: Registration
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Redirects to Library Registration Page (/register)</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => handleDetected('/library-login')}
                className="w-full text-left p-3.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-blue-900">
                    Simulate QR Code 2: Library Login
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Redirects to Session Login Page (/library-login)</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </button>

              <button
                type="button"
                onClick={() => handleDetected('LIB-2026-10024')}
                className="w-full text-left p-3.5 rounded-lg border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-900">
                    Scan Sample Student ID (Debadrito Chakraborty)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 font-mono">LIB-2026-10024 · Computer Science</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
