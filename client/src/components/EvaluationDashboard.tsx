import React from 'react';
import { EvaluationReport } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  ArrowRight,
  Code2,
  ThumbsUp,
  Cpu
} from 'lucide-react';

interface EvaluationDashboardProps {
  report: EvaluationReport;
  revisionNumber: number;
  onIterate: () => void;
  onViewHistory: () => void;
}

export const EvaluationDashboard: React.FC<EvaluationDashboardProps> = ({
  report,
  revisionNumber,
  onIterate,
  onViewHistory
}) => {
  const scorePercent = `${report.overallScore}%`;

  return (
    <div className="evaluation-view-container">
      {/* Overview Banner */}
      <div className="score-overview-card">
        <div className="score-big-box">
          <div
            className="score-ring"
            style={{ ['--score-pct' as any]: scorePercent }}
          >
            <span className="score-number">{report.overallScore}</span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span className="hero-pill" style={{ margin: 0, padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}>
                Attempt #{revisionNumber}
              </span>
              <span
                className={`score-status-pill ${
                  report.isPassing ? 'pass' : 'needs-refactor'
                }`}
              >
                {report.isPassing ? (
                  <>
                    <CheckCircle2 size={14} /> Production-Ready Architecture
                  </>
                ) : (
                  <>
                    <AlertTriangle size={14} /> Refactoring Recommended
                  </>
                )}
              </span>
            </div>

            <h2 className="score-details-heading">
              {report.overallScore >= 80
                ? 'High-Quality Modular Architecture'
                : report.overallScore >= 65
                ? 'Solid Foundation with Cohesion Gaps'
                : 'Architectural Coupling Detected'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem', maxWidth: '620px' }}>
              {report.criticalSmellCount === 0
                ? 'Zero critical architectural smells detected. Clean separation of concerns and appropriate pattern abstractions.'
                : `Detected ${report.criticalSmellCount} critical design smell(s) requiring structural refactoring before production deployment.`}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button className="btn btn-secondary" onClick={onViewHistory}>
            Compare Revisions
          </button>
          <button className="btn btn-primary" onClick={onIterate}>
            Refine & Attempt #{revisionNumber + 1} <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Rubric Dimensions Grid */}
      <div>
        <h3 className="pane-section-title">
          <Cpu size={16} /> SOLID & Architectural Dimensions
        </h3>
        <div className="rubric-grid">
          {report.rubricScores.map((score, idx) => (
            <div key={idx} className="rubric-card">
              <div className="rubric-card-header">
                <span className="rubric-card-title">{score.criterion}</span>
                <span className="rubric-card-score">{score.score} / 100</span>
              </div>
              <div className="rubric-progress-bg">
                <div
                  className="rubric-progress-fill"
                  style={{ width: `${score.score}%` }}
                ></div>
              </div>
              <p className="rubric-card-feedback">{score.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detected Design Smells */}
      {report.designSmells.length > 0 && (
        <div>
          <h3 className="pane-section-title">
            <AlertOctagon size={16} /> Detected Design Smells ({report.designSmells.length})
          </h3>
          <div className="smells-list">
            {report.designSmells.map(smell => (
              <div key={smell.id} className={`smell-card ${smell.severity}`}>
                <div className="smell-header">
                  <div className="smell-title-box">
                    {smell.severity === 'CRITICAL' ? (
                      <AlertOctagon size={18} color="#f43f5e" />
                    ) : smell.severity === 'WARNING' ? (
                      <AlertTriangle size={18} color="#f59e0b" />
                    ) : (
                      <Sparkles size={18} color="#06b6d4" />
                    )}
                    <span className="smell-name">{smell.name}</span>
                    <span className={`badge-difficulty ${smell.severity}`}>
                      {smell.severity}
                    </span>
                  </div>
                  <span className="smell-principle">Component: {smell.affectedComponent}</span>
                </div>

                <p className="smell-explanation">
                  <strong>Why this matters: </strong>
                  {smell.explanation}
                </p>

                <div className="smell-rec-box">
                  <strong>Actionable Fix: </strong>
                  {smell.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Refactoring Before vs After Code Diff */}
      {report.refactoredAlternative && (
        <div>
          <h3 className="pane-section-title">
            <Code2 size={16} /> Architectural Refactoring Alternative
          </h3>
          <div className="refactor-diff-box">
            <div className="refactor-diff-header">
              <h4 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.25rem' }}>
                {report.refactoredAlternative.title}
              </h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                {report.refactoredAlternative.description}
              </p>
            </div>

            <div className="diff-split">
              <div className="diff-col before">
                <span className="diff-label bad">
                  <AlertOctagon size={14} /> Fragile / Monolithic Implementation
                </span>
                <pre className="diff-code">{report.refactoredAlternative.beforeSnippet}</pre>
              </div>

              <div className="diff-col after">
                <span className="diff-label good">
                  <CheckCircle2 size={14} /> Decoupled / Strategy-Based Alternative
                </span>
                <pre className="diff-code">{report.refactoredAlternative.afterSnippet}</pre>
              </div>
            </div>

            <div style={{ padding: '1rem 1.5rem', background: '#0a0e17' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase' }}>
                Key Architectural Benefits:
              </span>
              <ul style={{ marginTop: '0.4rem', paddingLeft: '1.2rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                {report.refactoredAlternative.keyBenefits.map((benefit, bIdx) => (
                  <li key={bIdx} style={{ marginBottom: '0.2rem' }}>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Strengths Identified */}
      {report.strengths.length > 0 && (
        <div style={{ background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="pane-section-title" style={{ color: '#10b981' }}>
            <ThumbsUp size={16} /> Strengths in Current Design
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {report.strengths.map((str, idx) => (
              <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>
                <CheckCircle2 size={16} color="#10b981" /> {str}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
