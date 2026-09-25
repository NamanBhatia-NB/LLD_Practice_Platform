import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ProblemCard } from './components/ProblemCard';
import { ProblemWorkspace } from './components/ProblemWorkspace';
import { AttemptHistoryModal } from './components/AttemptHistoryModal';
import { ProblemSummary, ProblemDetail, AttemptData, AttemptWithDiff } from './types';
import { Sparkles, ArrowRight, CheckCircle2, Shield, Layers, RefreshCw } from 'lucide-react';

export const App: React.FC = () => {
  const [problems, setProblems] = useState<ProblemSummary[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<ProblemDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentAttempt, setCurrentAttempt] = useState<AttemptData | null>(null);
  const [attemptHistory, setAttemptHistory] = useState<AttemptWithDiff[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(1);

  const userId = 'learner-naman';

  // Load problem catalog
  useEffect(() => {
    fetch('/api/problems')
      .then(res => res.json())
      .then(data => {
        setProblems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load problems:', err);
        setLoading(false);
      });
  }, []);

  const handleSelectProblem = async (summary: ProblemSummary) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/problems/${summary.id}`);
      const detail: ProblemDetail = await res.json();
      setSelectedProblem(detail);

      // Load history for this problem
      const historyRes = await fetch(`/api/problems/${summary.id}/history?userId=${userId}`);
      const historyData: AttemptWithDiff[] = await historyRes.json();
      setAttemptHistory(historyData);

      // If learner already has a previous attempt, populate the latest one
      if (historyData.length > 0) {
        setCurrentAttempt(historyData[historyData.length - 1].attempt);
      } else {
        setCurrentAttempt(null);
      }
      setActiveStep(2);
    } catch (err) {
      console.error('Failed to load problem detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateHome = () => {
    setSelectedProblem(null);
    setCurrentAttempt(null);
    setAttemptHistory([]);
    setActiveStep(1);
  };

  const handleSubmitSolution = async (submissionPayload: any): Promise<AttemptData> => {
    if (!selectedProblem) throw new Error('No problem selected');
    setIsSubmitting(true);
    setActiveStep(4);

    try {
      const res = await fetch(`/api/problems/${selectedProblem.id}/attempts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          submission: submissionPayload
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Submission failed');
      }

      const attempt: AttemptData = await res.json();
      setCurrentAttempt(attempt);

      // Refresh history
      const historyRes = await fetch(`/api/problems/${selectedProblem.id}/history?userId=${userId}`);
      const historyData: AttemptWithDiff[] = await historyRes.json();
      setAttemptHistory(historyData);
      setActiveStep(5);

      return attempt;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectHistoricalAttempt = (attemptId: string) => {
    const found = attemptHistory.find(h => h.attempt.id === attemptId);
    if (found) {
      setCurrentAttempt(found.attempt);
      setShowHistoryModal(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar
        currentView={selectedProblem ? 'WORKSPACE' : 'PROBLEMS'}
        onNavigateHome={handleNavigateHome}
        onOpenHistory={() => setShowHistoryModal(true)}
        hasAttempts={attemptHistory.length > 0}
      />

      {/* PROBLEM SELECTION VIEW */}
      {!selectedProblem && (
        <main>
          {/* Hero Banner */}
          <section className="hero-banner">
            <div className="hero-pill">
              <Sparkles size={14} color="#818cf8" /> Interactive LLD Practice & Explainable Rubrics
            </div>
            <h1 className="hero-title">
              Master Low-Level Design Through Iteration
            </h1>
            <p className="hero-subtitle">
              Move beyond passive reading. Design core entities, verify interfaces, receive explainable SOLID rubrics, identify design smells, and track your revision progress.
            </p>

            {/* Practice Loop Visualizer */}
            <div className="practice-loop-bar">
              <div className={`loop-step ${activeStep >= 1 ? 'active' : ''}`}>
                1. Choose Problem
              </div>
              <span className="loop-arrow">→</span>
              <div className={`loop-step ${activeStep >= 2 ? 'active' : ''}`}>
                2. Model & Diagram
              </div>
              <span className="loop-arrow">→</span>
              <div className={`loop-step ${activeStep >= 3 ? 'active' : ''}`}>
                3. Implement Interfaces
              </div>
              <span className="loop-arrow">→</span>
              <div className={`loop-step ${activeStep >= 4 ? 'active' : ''}`}>
                4. Hybrid Evaluation
              </div>
              <span className="loop-arrow">→</span>
              <div className={`loop-step ${activeStep >= 5 ? 'active' : ''}`}>
                5. Review Smells & Refine
              </div>
            </div>
          </section>

          {/* Catalog Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#94a3b8' }}>
              <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 1rem' }} />
              <p>Loading curated LLD problem sets...</p>
            </div>
          ) : (
            <section className="problems-grid">
              {problems.map(p => (
                <ProblemCard
                  key={p.id}
                  problem={p}
                  onSelect={handleSelectProblem}
                />
              ))}
            </section>
          )}
        </main>
      )}

      {/* WORKSPACE VIEW */}
      {selectedProblem && (
        <ProblemWorkspace
          key={selectedProblem.id}
          problem={selectedProblem}
          onBack={handleNavigateHome}
          onSubmit={handleSubmitSolution}
          currentAttempt={currentAttempt}
          isSubmitting={isSubmitting}
          onOpenHistory={() => setShowHistoryModal(true)}
        />
      )}

      {/* REVISION HISTORY MODAL */}
      {showHistoryModal && (
        <AttemptHistoryModal
          history={attemptHistory}
          onClose={() => setShowHistoryModal(false)}
          onSelectAttempt={handleSelectHistoricalAttempt}
          selectedAttemptId={currentAttempt?.id}
        />
      )}
    </div>
  );
};
