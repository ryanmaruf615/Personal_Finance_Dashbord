import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAccounts } from '../hooks/useAccounts';
import CsvUploader from '../components/import/CsvUploader';
import { Button } from '../components/shared';
import LoadingSpinner from '../components/LoadingSpinner';
import { transactionApi } from '../api/transactionApi';
import toast from 'react-hot-toast';

const STEPS = ['Upload', 'Preview', 'Done'];

const ImportPage = () => {
  const navigate = useNavigate();
  const { accounts } = useAccounts();

  const [step, setStep] = useState(0);
  const [file, setFile] = useState(null);
  const [accountId, setAccountId] = useState('');
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ─── Step 1 → Step 2: Preview ─────────────────────────────────────
  const handlePreview = useCallback(async () => {
    if (!file) { toast.error('Select a CSV file'); return; }
    if (!accountId) { toast.error('Select an account'); return; }

    setLoading(true);
    try {
      const data = await transactionApi.previewCsv(file);
      setPreview(data);
      setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to parse CSV');
    } finally {
      setLoading(false);
    }
  }, [file, accountId]);

  // ─── Step 2 → Step 3: Import ──────────────────────────────────────
  const handleImport = useCallback(async () => {
    if (!file || !accountId) return;

    setLoading(true);
    try {
      const data = await transactionApi.importCsv(file, Number(accountId));
      setResult(data);
      setStep(2);
      if (data.importedCount > 0) toast.success(`${data.importedCount} transactions imported!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    } finally {
      setLoading(false);
    }
  }, [file, accountId]);

  // ─── Reset ────────────────────────────────────────────────────────
  const handleReset = () => {
    setStep(0);
    setFile(null);
    setAccountId('');
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Transactions</h1>
        <p className="text-sm text-gray-500 mt-1">Upload a CSV file to import transactions in bulk</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              i < step ? 'bg-emerald-500 text-white'
              : i === step ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-500'
            }`}>
              {i < step ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-sm ${i === step ? 'font-medium text-gray-900' : 'text-gray-500'}`}>{label}</span>
            {i < STEPS.length - 1 && <div className="w-8 h-px bg-gray-300" />}
          </div>
        ))}
      </div>

      {/* ─── Step 1: Upload ──────────────────────────────────────── */}
      {step === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
          <CsvUploader file={file} onFileSelect={setFile} disabled={loading} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Import into Account</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              disabled={loading}
            >
              <option value="">Select account...</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
              ))}
            </select>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-600 mb-2">CSV Format</p>
            <code className="text-xs text-gray-500 block">date,description,amount,type,category</code>
            <code className="text-xs text-gray-400 block mt-1">2026-03-01,Monthly Salary,3500.00,INCOME,Salary</code>
            <code className="text-xs text-gray-400 block">2026-03-02,Grocery,-45.30,EXPENSE,Food</code>
          </div>

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handlePreview}
              loading={loading}
              disabled={!file || !accountId}
            >
              Preview Import
            </Button>
          </div>
        </div>
      )}

      {/* ─── Step 2: Preview ─────────────────────────────────────── */}
      {step === 1 && preview && (
        <div className="space-y-4">
          {/* Summary Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{preview.totalRows}</p>
              <p className="text-xs text-gray-500">Total Rows</p>
            </div>
            <div className="bg-white rounded-xl border border-emerald-200 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">{preview.validRows}</p>
              <p className="text-xs text-gray-500">Valid</p>
            </div>
            <div className="bg-white rounded-xl border border-red-200 p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{preview.errorRows}</p>
              <p className="text-xs text-gray-500">Errors</p>
            </div>
            <div className="bg-white rounded-xl border border-amber-200 p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">{preview.duplicateRows}</p>
              <p className="text-xs text-gray-500">Duplicates</p>
            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {preview.rows.map((row) => {
                    const bgClass = row.duplicate
                      ? 'bg-amber-50'
                      : !row.valid
                      ? 'bg-red-50'
                      : '';

                    return (
                      <tr key={row.rowNumber} className={bgClass}>
                        <td className="px-4 py-2.5 text-sm text-gray-500">{row.rowNumber}</td>
                        <td className="px-4 py-2.5 text-sm text-gray-900">{row.date}</td>
                        <td className="px-4 py-2.5 text-sm text-gray-900 max-w-[200px] truncate">{row.description}</td>
                        <td className="px-4 py-2.5 text-sm text-gray-900">{row.amount}</td>
                        <td className="px-4 py-2.5">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            row.type === 'INCOME' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            {row.type}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-sm text-gray-900">{row.category}</td>
                        <td className="px-4 py-2.5">
                          {row.duplicate ? (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Duplicate</span>
                          ) : row.valid ? (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Valid</span>
                          ) : (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700" title={row.errorMessage}>
                              Error
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="secondary" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              loading={loading}
              disabled={preview.validRows === 0}
            >
              Import {preview.validRows} Transaction{preview.validRows !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      )}

      {/* ─── Step 3: Result ──────────────────────────────────────── */}
      {step === 2 && result && (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Import Complete</h2>
          <p className="text-sm text-gray-500 mb-6">Your CSV has been processed successfully.</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-emerald-600">{result.importedCount}</p>
              <p className="text-xs text-gray-500">Imported</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-amber-600">{result.skippedCount}</p>
              <p className="text-xs text-gray-500">Skipped</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-2xl font-bold text-red-600">{result.errorCount}</p>
              <p className="text-xs text-gray-500">Failed</p>
            </div>
          </div>

          {result.errors && result.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium text-red-700 mb-2">Errors:</p>
              <ul className="text-xs text-red-600 space-y-1">
                {result.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>• {err}</li>
                ))}
                {result.errors.length > 5 && (
                  <li className="text-red-400">...and {result.errors.length - 5} more</li>
                )}
              </ul>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button variant="secondary" onClick={handleReset}>
              Import More
            </Button>
            <Button variant="primary" onClick={() => navigate('/transactions')}>
              View Transactions
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportPage;
