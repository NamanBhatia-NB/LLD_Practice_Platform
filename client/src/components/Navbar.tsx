import React from 'react';
import { Layers, History, Award, BookOpen } from 'lucide-react';

interface NavbarProps {
  currentView: 'PROBLEMS' | 'WORKSPACE';
  onNavigateHome: () => void;
  onOpenHistory?: () => void;
  hasAttempts?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigateHome,
  onOpenHistory,
  hasAttempts
}) => {
  return (
    <header className="navbar">
      <div className="nav-brand" onClick={onNavigateHome}>
        <div className="brand-icon-box">
          <Layers size={22} />
        </div>
        <div>
          <span className="brand-title">ArchStudio</span>
          <span className="brand-tag" style={{ marginLeft: '0.6rem' }}>LLD Practice</span>
        </div>
      </div>

      <div className="nav-actions">
        {currentView === 'WORKSPACE' && (
          <>
            <button
              className="btn btn-outline"
              onClick={onNavigateHome}
              title="Return to Problem Catalog"
            >
              <BookOpen size={16} /> Catalog
            </button>

            {onOpenHistory && (
              <button
                className="btn btn-secondary"
                onClick={onOpenHistory}
                title="View previous attempt history & diffs"
              >
                <History size={16} /> Revisions {hasAttempts && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }}></span>}
              </button>
            )}
          </>
        )}

        <div className="user-badge">
          <span className="user-dot"></span>
          <span>Learner Workspace</span>
        </div>
      </div>
    </header>
  );
};
