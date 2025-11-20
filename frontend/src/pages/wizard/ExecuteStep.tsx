// frontend/src/pages/wizard/ExecuteStep.tsx
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

interface MigrationProgress {
  phase: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  recordsProcessed: number;
  recordsTotal: number;
  startTime?: Date;
  endTime?: Date;
  errors: number;
}

export const ExecuteStep: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectId = searchParams.get('project');

  const [executing, setExecuting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [progress, setProgress] = useState<MigrationProgress[]>([]);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const phases = [
    'Extracting source data',
    'Transforming records',
    'Validating data quality',
    'Loading to target org',
    'Updating relationships',
    'Finalizing migration',
  ];

  const handleExecute = async () => {
    setExecuting(true);
    setLogs([]);

    // Initialize progress for all phases
    const initialProgress: MigrationProgress[] = phases.map((phase) => ({
      phase,
      status: 'pending',
      recordsProcessed: 0,
      recordsTotal: 1000,
      errors: 0,
    }));
    setProgress(initialProgress);

    // Simulate migration execution
    for (let i = 0; i < phases.length; i++) {
      setCurrentPhase(i);
      addLog(`Starting: ${phases[i]}...`);

      // Update status to running
      setProgress((prev) =>
        prev.map((p, idx) => (idx === i ? { ...p, status: 'running', startTime: new Date() } : p))
      );

      // Simulate progress
      for (let j = 0; j <= 100; j += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setProgress((prev) =>
          prev.map((p, idx) => (idx === i ? { ...p, recordsProcessed: (p.recordsTotal * j) / 100 } : p))
        );
      }

      // Complete phase
      setProgress((prev) =>
        prev.map((p, idx) =>
          idx === i
            ? { ...p, status: 'completed', endTime: new Date(), recordsProcessed: p.recordsTotal }
            : p
        )
      );
      addLog(`✓ Completed: ${phases[i]} (${initialProgress[i].recordsTotal} records)`);
    }

    addLog('\n🎉 Migration completed successfully!');
    setCompleted(true);
    setExecuting(false);
  };

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleViewReport = () => {
    navigate(`/wizard/report?project=${projectId}`);
  };

  const totalRecords = progress.reduce((sum, p) => sum + p.recordsTotal, 0);
  const processedRecords = progress.reduce((sum, p) => sum + p.recordsProcessed, 0);
  const overallProgress = totalRecords > 0 ? (processedRecords / totalRecords) * 100 : 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Execute Migration</h1>
        <p className="text-gray-600 mt-2">Start the data migration process</p>
      </div>

      {/* Pre-execution */}
      {!executing && !completed && (
        <div className="bg-white rounded-lg shadow p-8 text-center mb-6">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">🚀</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ready to Execute</h2>
            <p className="text-gray-600 mb-6">
              This will begin the migration process. All validations have passed and your configuration is ready.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Before you proceed:</h3>
              <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                <li>Backup your target org</li>
                <li>Notify stakeholders of the migration</li>
                <li>Monitor API limits during execution</li>
                <li>Keep this window open until completion</li>
              </ul>
            </div>
            <button
              onClick={handleExecute}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg font-medium"
            >
              Start Migration
            </button>
          </div>
        </div>
      )}

      {/* Execution in progress */}
      {(executing || completed) && (
        <>
          {/* Overall Progress */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {completed ? '✅ Migration Completed' : '⏳ Migration in Progress'}
              </h2>
              <span className="text-2xl font-bold text-blue-600">{Math.round(overallProgress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-green-500 h-full transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {processedRecords.toLocaleString()} of {totalRecords.toLocaleString()} records processed
            </p>
          </div>

          {/* Phase Progress */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Migration Phases</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {progress.map((phase, idx) => (
                <div key={idx} className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {phase.status === 'completed'
                          ? '✅'
                          : phase.status === 'running'
                          ? '⏳'
                          : phase.status === 'failed'
                          ? '❌'
                          : '⏸️'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{phase.phase}</p>
                        <p className="text-sm text-gray-600">
                          {phase.recordsProcessed.toLocaleString()} / {phase.recordsTotal.toLocaleString()} records
                        </p>
                      </div>
                    </div>
                    {phase.status === 'running' && (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        phase.status === 'completed'
                          ? 'bg-green-500'
                          : phase.status === 'running'
                          ? 'bg-blue-500'
                          : phase.status === 'failed'
                          ? 'bg-red-500'
                          : 'bg-gray-300'
                      }`}
                      style={{
                        width: `${(phase.recordsProcessed / phase.recordsTotal) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Execution Logs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Execution Log</h3>
            </div>
            <div className="p-4 bg-gray-900 rounded-b-lg">
              <div className="font-mono text-xs text-green-400 max-h-64 overflow-y-auto space-y-1">
                {logs.map((log, idx) => (
                  <div key={idx}>{log}</div>
                ))}
                {executing && (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>Processing...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <button
          onClick={() => navigate(`/wizard/validate?project=${projectId}`)}
          disabled={executing}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          ← Back to Validate
        </button>
        {completed && (
          <button
            onClick={handleViewReport}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            View Migration Report →
          </button>
        )}
      </div>
    </div>
  );
};
