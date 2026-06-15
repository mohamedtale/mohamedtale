'use client';

import { useRef, useState, useCallback } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { importApi } from '@/lib/api';

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
  message: string;
}

interface ImportWellsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ImportWellsModal({ isOpen, onClose, onSuccess }: ImportWellsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const acceptFile = (f: File) => {
    if (!f.name.endsWith('.xls') && !f.name.endsWith('.xlsx')) {
      setError('يُقبل فقط ملفات Excel بامتداد .xls أو .xlsx');
      return;
    }
    setError(null);
    setResult(null);
    setFile(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      acceptFile(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      acceptFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleImport = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await importApi.importWells(file);
      setResult(res.data);
      if (res.data.imported > 0 && onSuccess) {
        onSuccess();
      }
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message_ar?: string; error?: string } }; message?: string };
      setError(
        axiosErr.response?.data?.message_ar ||
        axiosErr.response?.data?.error ||
        axiosErr.message ||
        'حدث خطأ أثناء الاستيراد'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="استيراد بيانات الآبار من Excel" size="md">
      <div className="p-6 space-y-5">
        {/* Drop zone */}
        {!result && (
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragging
                ? 'border-ministry-500 bg-ministry-50'
                : file
                ? 'border-green-400 bg-green-50'
                : 'border-gray-300 hover:border-ministry-400 hover:bg-gray-50'
            }`}
            onClick={() => inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xls,.xlsx"
              className="hidden"
              onChange={handleFileChange}
            />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium text-gray-800">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB — انقر لتغيير الملف</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-medium text-gray-700">اسحب ملف Excel هنا أو انقر للاختيار</p>
                <p className="text-xs text-gray-400">يُقبل .xls و .xlsx — الحجم الأقصى 10 ميجابايت</p>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-3">
            <div className={`rounded-lg p-4 ${result.imported > 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`font-semibold text-sm ${result.imported > 0 ? 'text-green-800' : 'text-yellow-800'}`}>
                {result.message}
              </p>
              <div className="mt-2 flex gap-4 text-sm">
                <span className="text-green-700">تم الاستيراد: <strong>{result.imported}</strong></span>
                {result.skipped > 0 && (
                  <span className="text-yellow-700">تم التخطي: <strong>{result.skipped}</strong></span>
                )}
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-red-700 mb-2">أخطاء ({result.errors.length}):</p>
                <ul className="space-y-1 max-h-40 overflow-y-auto">
                  {result.errors.map((e, i) => (
                    <li key={i} className="text-xs text-red-600">• {e}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {!result ? (
            <>
              <Button
                onClick={handleImport}
                disabled={!file || loading}
                className="flex-1"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    جاري الاستيراد...
                  </span>
                ) : (
                  'استيراد'
                )}
              </Button>
              <Button variant="outline" onClick={handleClose} disabled={loading} className="flex-1">
                إلغاء
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={handleClose} className="flex-1">
              إغلاق
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
