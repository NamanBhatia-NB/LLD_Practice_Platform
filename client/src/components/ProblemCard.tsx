import React from 'react';
import { ProblemSummary } from '../types';
import { ArrowRight, Box, Compass } from 'lucide-react';

interface ProblemCardProps {
  problem: ProblemSummary;
  onSelect: (problem: ProblemSummary) => void;
}

export const ProblemCard: React.FC<ProblemCardProps> = ({ problem, onSelect }) => {
  return (
    <div className="problem-card" onClick={() => onSelect(problem)}>
      <div className="problem-header">
        <span className={`badge-difficulty ${problem.difficulty}`}>
          {problem.difficulty}
        </span>
        <span className="patterns-count">
          <Compass size={14} /> {problem.expectedPatterns.length} Patterns
        </span>
      </div>

      <h3 className="problem-title">{problem.title}</h3>
      <p className="problem-summary">{problem.summary}</p>

      <div className="entity-tags">
        {problem.expectedEntities.slice(0, 4).map((ent, idx) => (
          <span key={idx} className="entity-tag">
            {ent}
          </span>
        ))}
        {problem.expectedEntities.length > 4 && (
          <span className="entity-tag">+{problem.expectedEntities.length - 4} more</span>
        )}
      </div>

      <div className="card-footer">
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Box size={14} /> Low-Level Design
        </span>
        <button className="btn btn-primary" style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
          Start Attempt <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};
