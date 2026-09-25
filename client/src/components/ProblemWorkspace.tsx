import React, { useState } from 'react';
import { ProblemDetail, AttemptData, EvaluationReport } from '../types';
import { MermaidViewer } from './MermaidViewer';
import { EvaluationDashboard } from './EvaluationDashboard';
import { PROBLEM_TEMPLATES } from '../data/languageTemplates';
import {
  FileText,
  Network,
  Code,
  ShieldCheck,
  Send,
  RefreshCw,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Layers,
  BookOpen
} from 'lucide-react';

interface ProblemWorkspaceProps {
  problem: ProblemDetail;
  onBack: () => void;
  onSubmit: (payload: {
    language: string;
    assumptions: string;
    classDiagramMermaid: string;
    sourceCode: string;
    patternJustification: string;
  }) => Promise<AttemptData>;
  currentAttempt: AttemptData | null;
  isSubmitting: boolean;
  onOpenHistory: () => void;
}

type TabType = 'ASSUMPTIONS' | 'DIAGRAM' | 'CODE' | 'RATIONALE' | 'FEEDBACK';
type CodeMode = 'SKELETON' | 'REFERENCE' | 'BLANK';

export const ProblemWorkspace: React.FC<ProblemWorkspaceProps> = ({
  problem,
  onBack,
  onSubmit,
  currentAttempt,
  isSubmitting,
  onOpenHistory
}) => {
  // Start on Tab 1: Assumptions & Scope following the LLD practice loop
  const [activeTab, setActiveTab] = useState<TabType>('ASSUMPTIONS');
  const [showHints, setShowHints] = useState<boolean>(false);

  // All inputs default to a clean, blank canvas for genuine learner practice
  const [language, setLanguage] = useState<string>('cpp');
  const [assumptions, setAssumptions] = useState<string>('');
  const [mermaidCode, setMermaidCode] = useState<string>('classDiagram\n    %% Define classes and relationships here\n');
  const [sourceCode, setSourceCode] = useState<string>('');
  const [rationale, setRationale] = useState<string>('');

  const [formError, setFormError] = useState<string | null>(null);

  const handleLanguageChange = (newLang: string) => {
    const prevLang = language;
    setLanguage(newLang);

    // If the editor currently holds the skeleton of the previous language, switch it to the new language's skeleton
    const prevSkeleton = PROBLEM_TEMPLATES[problem.slug]?.[prevLang]?.skeleton?.trim();
    const currentCode = sourceCode.trim();

    if (currentCode && prevSkeleton && currentCode === prevSkeleton) {
      const newSkeleton = PROBLEM_TEMPLATES[problem.slug]?.[newLang]?.skeleton || '';
      setSourceCode(newSkeleton);
    }
  };

  const handleInsertSkeleton = () => {
    const slug = problem.slug;
    const skeleton = PROBLEM_TEMPLATES[slug]?.[language]?.skeleton;
    if (skeleton) {
      if (!sourceCode.trim() || confirm(`Insert ${language.toUpperCase()} starter scaffold? This will replace your current code.`)) {
        setSourceCode(skeleton);
      }
    }
  };

  const handleClearCode = () => {
    if (confirm('Clear the code editor?')) {
      setSourceCode('');
    }
  };

  const handleClearAll = () => {
    if (confirm('Clear the entire workspace to a blank canvas?')) {
      setAssumptions('');
      setMermaidCode('classDiagram\n    %% Define classes and relationships here\n');
      setSourceCode('');
      setRationale('');
    }
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!sourceCode.trim() || sourceCode.trim().length < 20) {
      setFormError('Please write meaningful class/interface definitions in the Code tab (min 20 characters).');
      setActiveTab('CODE');
      return;
    }
    if (!assumptions.trim() || assumptions.trim().length < 10) {
      setFormError('Please specify design scope & assumptions in the Assumptions tab (min 10 characters).');
      setActiveTab('ASSUMPTIONS');
      return;
    }
    if (!mermaidCode.trim() || mermaidCode.trim().length < 10) {
      setFormError('Please specify class relationships in the Class Diagram tab.');
      setActiveTab('DIAGRAM');
      return;
    }

    try {
      const attempt = await onSubmit({
        language,
        assumptions,
        classDiagramMermaid: mermaidCode,
        sourceCode,
        patternJustification: rationale
      });

      if (attempt.report) {
        setActiveTab('FEEDBACK');
      }
    } catch (err: any) {
      setFormError(err.message || 'Failed to evaluate attempt.');
    }
  };

  return (
    <div className="workspace-container">
      {/* Left Pane: Requirements, Rubric & Constraints */}
      <aside className="problem-pane">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
            <span className={`badge-difficulty ${problem.difficulty}`}>
              {problem.difficulty}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Rubric-Based Evaluation
            </span>
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>
            {problem.title}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: 1.5 }}>
            {problem.summary}
          </p>
        </div>

        {/* Functional Requirements */}
        <div>
          <h3 className="pane-section-title">
            <CheckCircle size={15} /> Functional Requirements
          </h3>
          <ul className="requirement-list">
            {problem.functionalRequirements.map((req, idx) => (
              <li key={idx} className="requirement-item">
                <span className="bullet-icon">•</span>
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Non-Functional Constraints */}
        <div>
          <h3 className="pane-section-title">
            <ShieldCheck size={15} /> Non-Functional Constraints
          </h3>
          <ul className="requirement-list">
            {problem.nonFunctionalConstraints.map((constraint, idx) => (
              <li key={idx} className="requirement-item">
                <span className="bullet-icon" style={{ color: '#f59e0b' }}>▲</span>
                <span>{constraint}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Expected Domain Concepts */}
        <div>
          <h3 className="pane-section-title">
            <Layers size={15} /> Expected Domain Entities
          </h3>
          <div className="entity-tags">
            {problem.expectedEntities.map((ent, idx) => (
              <span key={idx} className="entity-tag">
                {ent}
              </span>
            ))}
          </div>
        </div>

        {/* Rubric Weights */}
        <div>
          <h3 className="pane-section-title">
            <Sparkles size={15} /> Rubric Dimension Weights
          </h3>
          <div className="rubric-weights-grid">
            <div className="rubric-pill">
              <span className="dim-name">Single Responsibility</span>
              <span className="dim-weight">{problem.rubricWeights.singleResponsibility}%</span>
            </div>
            <div className="rubric-pill">
              <span className="dim-name">Open/Closed Extensibility</span>
              <span className="dim-weight">{problem.rubricWeights.openClosedExtensibility}%</span>
            </div>
            <div className="rubric-pill">
              <span className="dim-name">Interface & DIP</span>
              <span className="dim-weight">{problem.rubricWeights.interfaceSegregationDIP}%</span>
            </div>
            <div className="rubric-pill">
              <span className="dim-name">Patterns Appropriateness</span>
              <span className="dim-weight">{problem.rubricWeights.patternAppropriateness}%</span>
            </div>
            <div className="rubric-pill">
              <span className="dim-name">Concurrency / State</span>
              <span className="dim-weight">{problem.rubricWeights.stateAndConcurrency}%</span>
            </div>
            <div className="rubric-pill">
              <span className="dim-name">Robustness</span>
              <span className="dim-weight">{problem.rubricWeights.edgeCasesRobustness}%</span>
            </div>
          </div>
        </div>

        {/* Hints Accordion */}
        {problem.hints && problem.hints.length > 0 && (
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
            <button
              className="btn btn-outline"
              style={{ width: '100%', fontSize: '0.8rem' }}
              onClick={() => setShowHints(!showHints)}
            >
              <Lightbulb size={14} color="#f59e0b" />
              {showHints ? 'Hide Architectural Hints' : 'View Architectural Hints'}
            </button>
            {showHints && (
              <ul style={{ marginTop: '0.75rem', paddingLeft: '1.25rem', color: '#94a3b8', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {problem.hints.map((hint, hIdx) => (
                  <li key={hIdx}>{hint}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </aside>

      {/* Right Pane: Multi-Tab Design Workspace & Feedback */}
      <main className="editor-pane">
        {/* Editor Tabs Header */}
        <div className="editor-tabs-bar">
          <div className="tab-group">
            <button
              className={`editor-tab ${activeTab === 'ASSUMPTIONS' ? 'active' : ''}`}
              onClick={() => setActiveTab('ASSUMPTIONS')}
            >
              <FileText size={15} /> 1. Assumptions & Scope
            </button>

            <button
              className={`editor-tab ${activeTab === 'DIAGRAM' ? 'active' : ''}`}
              onClick={() => setActiveTab('DIAGRAM')}
            >
              <Network size={15} /> 2. Class Diagram
            </button>

            <button
              className={`editor-tab ${activeTab === 'CODE' ? 'active' : ''}`}
              onClick={() => setActiveTab('CODE')}
            >
              <Code size={15} /> 3. Code & Interfaces
            </button>

            <button
              className={`editor-tab ${activeTab === 'RATIONALE' ? 'active' : ''}`}
              onClick={() => setActiveTab('RATIONALE')}
            >
              <ShieldCheck size={15} /> 4. Pattern Justifications
            </button>

            {currentAttempt?.report && (
              <button
                className={`editor-tab ${activeTab === 'FEEDBACK' ? 'active' : ''}`}
                onClick={() => setActiveTab('FEEDBACK')}
                style={{ color: '#38bdf8' }}
              >
                <Sparkles size={15} /> 5. Evaluation Feedback
                <span className="tab-badge">
                  {currentAttempt.report.overallScore}/100
                </span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className="btn btn-outline"
              onClick={handleClearAll}
              title="Clear all tabs to start fresh on a blank canvas"
              style={{ fontSize: '0.775rem', padding: '0.4rem 0.75rem' }}
            >
              <RefreshCw size={13} /> Clear Canvas
            </button>

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{ padding: '0.45rem 1.1rem' }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={15} className="animate-spin" /> Evaluating Architecture...
                </>
              ) : (
                <>
                  <Send size={15} /> Submit for Evaluation
                </>
              )}
            </button>
          </div>
        </div>

        {/* Validation Error Banner */}
        {formError && (
          <div style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', padding: '0.75rem 1.5rem', borderBottom: '1px solid rgba(244, 63, 94, 0.3)', fontSize: '0.85rem' }}>
            <strong>Validation Error:</strong> {formError}
          </div>
        )}

        {/* Tab Content Area */}
        <div className="tab-content-area">
          {/* TAB 1: Assumptions */}
          {activeTab === 'ASSUMPTIONS' && (
            <div className="form-group" style={{ height: '100%' }}>
              <div className="form-label">
                <span>Design Scope, Invariants & Assumptions</span>
                <span className="form-helper">Clarify capacity, single vs multi-gate, concurrency assumptions</span>
              </div>
              <textarea
                className="text-textarea"
                style={{ flexGrow: 1 }}
                value={assumptions}
                onChange={e => setAssumptions(e.target.value)}
                placeholder="Define your system scope, boundaries, and assumptions here...&#10;• Capacity and scale bounds (e.g. 500 spots, 4 elevators)&#10;• Single entry vs multiple concurrent gates&#10;• State transitions and failure boundaries"
              />
            </div>
          )}

          {/* TAB 2: Class Diagram */}
          {activeTab === 'DIAGRAM' && (
            <div className="mermaid-split-view">
              <div className="form-group" style={{ height: '100%', marginBottom: 0 }}>
                <div className="form-label">
                  <span>Mermaid Class Diagram Code</span>
                  <span className="form-helper">Use standard Mermaid classDiagram syntax</span>
                </div>
                <textarea
                  className="code-textarea"
                  style={{ height: 'calc(100% - 30px)' }}
                  value={mermaidCode}
                  onChange={e => setMermaidCode(e.target.value)}
                  placeholder="classDiagram&#10;    %% Define your classes and relationships&#10;    class Vehicle&#10;    class ParkingLot&#10;    ParkingLot *-- ParkingSpot"
                />
              </div>

              <div className="form-group" style={{ height: '100%', marginBottom: 0 }}>
                <div className="form-label">
                  <span>Live UML Visualizer</span>
                  <span className="form-helper">Auto-renders entity relationships</span>
                </div>
                <div className="mermaid-preview-panel">
                  <MermaidViewer chart={mermaidCode} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Source Code & Interfaces */}
          {activeTab === 'CODE' && (
            <div className="form-group" style={{ height: '100%', marginBottom: 0 }}>
              <div className="form-label">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700 }}>Implementation Code</span>
                  
                  {/* Language Selector */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Language:</span>
                    <select
                      value={language}
                      onChange={e => handleLanguageChange(e.target.value)}
                      style={{
                        background: '#182238',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.15)',
                        padding: '0.25rem 0.6rem',
                        borderRadius: 6,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      <option value="cpp">C++</option>
                      <option value="java">Java</option>
                      <option value="python">Python</option>
                    </select>
                  </div>

                  {/* Optional Skeleton Scaffold & Clear Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={handleInsertSkeleton}
                      className="btn btn-outline"
                      style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                      title="Optionally insert starting class and interface stubs"
                    >
                      <Code size={13} /> Insert Starter Scaffold
                    </button>
                    {sourceCode && (
                      <button
                        type="button"
                        onClick={handleClearCode}
                        className="btn btn-outline"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                        title="Clear code editor"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <span className="form-helper">
                  Write your classes, interfaces, and methods. Click "Insert Starter Scaffold" if you want basic stubs.
                </span>
              </div>
              <textarea
                className="code-textarea"
                style={{ flexGrow: 1 }}
                value={sourceCode}
                onChange={e => setSourceCode(e.target.value)}
                placeholder={`// Write your ${language === 'cpp' ? 'C++' : language.toUpperCase()} classes, interfaces, and design patterns here...\n// Click "Insert Starter Scaffold" above if you would like starting stubs.`}
              />
            </div>
          )}

          {/* TAB 4: Pattern Justifications */}
          {activeTab === 'RATIONALE' && (
            <div className="form-group" style={{ height: '100%' }}>
              <div className="form-label">
                <span>Pattern & Architectural Trade-off Justification</span>
                <span className="form-helper">Why did you pick this pattern? What were the trade-offs?</span>
              </div>
              <textarea
                className="text-textarea"
                style={{ flexGrow: 1 }}
                value={rationale}
                onChange={e => setRationale(e.target.value)}
                placeholder="Explain why you selected particular design patterns (e.g. Strategy vs State) and how your solution satisfies SOLID principles...&#10;• Why did you choose this pattern over alternatives?&#10;• How does it enable future extensibility (Open/Closed Principle)?"
              />
            </div>
          )}

          {/* TAB 5: Feedback */}
          {activeTab === 'FEEDBACK' && currentAttempt?.report && (
            <EvaluationDashboard
              report={currentAttempt.report}
              revisionNumber={currentAttempt.revisionNumber}
              onIterate={() => setActiveTab('CODE')}
              onViewHistory={onOpenHistory}
            />
          )}
        </div>
      </main>
    </div>
  );
};
