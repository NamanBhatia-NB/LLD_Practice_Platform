import React from 'react';
import { AttemptWithDiff } from '../types';
import { X, TrendingUp, CheckCircle, AlertTriangle, Calendar, Award } from 'lucide-react';

interface AttemptHistoryModalProps {
  history: AttemptWithDiff[];
  onClose: () => void;
  onSelectAttempt: (attemptId: string) => void;
  selectedAttemptId?: string;
}

export const AttemptHistoryModal: React.FC<AttemptHistoryModalProps> = ({
  history,
  onClose,
  onSelectAttempt,
  selectedAttemptId
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Practice Attempt History & Evolution</h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Track how your Low-Level Design evolved across iterations and smell resolutions.
            </p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
            No submitted attempts yet. Complete your first submission to start tracking revision history!
          </div>
        ) : (
          <div className="timeline">
            {history.map(({ attempt, diffFromPrevious }) => {
              const isSelected = attempt.id === selectedAttemptId;
              const score = attempt.report?.overallScore ?? 0;

              return (
                <div
                  key={attempt.id}
                  className="timeline-item"
                  style={{
                    borderColor: isSelected ? '#6366f1' : undefined,
                    cursor: 'pointer'
                  }}
                  onClick={() => onSelectAttempt(attempt.id)}
                >
                  <div className="timeline-dot"></div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>
                        Revision #{attempt.revisionNumber}
                      </span>
                      <span className={`badge-difficulty ${attempt.status}`}>
                        {attempt.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#38bdf8' }}>
                        {score} / 100
                      </span>
                    </div>
                  </div>

                  {/* Evolution Diff Summary */}
                  {diffFromPrevious && (
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        borderLeft: `3px solid ${diffFromPrevious.scoreDifference >= 0 ? '#10b981' : '#f43f5e'}`
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <TrendingUp size={14} color={diffFromPrevious.scoreDifference >= 0 ? '#10b981' : '#f43f5e'} />
                        <span className="diff-badge-positive" style={{ color: diffFromPrevious.scoreDifference >= 0 ? '#10b981' : '#f43f5e' }}>
                          {diffFromPrevious.scoreDifference >= 0 ? `+${diffFromPrevious.scoreDifference}` : diffFromPrevious.scoreDifference} Points
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          compared to Attempt #{diffFromPrevious.previousRevision}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                        {diffFromPrevious.summary}
                      </p>

                      {diffFromPrevious.resolvedSmells.length > 0 && (
                        <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <CheckCircle size={12} /> Resolved: {diffFromPrevious.resolvedSmells.join(', ')}
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={12} /> {new Date(attempt.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                    <button className="btn btn-outline" style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                      {isSelected ? 'Viewing This Revision' : 'Inspect Revision'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
