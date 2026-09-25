import { Attempt } from '../domain/models/Attempt.js';

export interface AttemptDiff {
  previousRevision: number;
  currentRevision: number;
  scoreDifference: number; // e.g. +18
  resolvedSmells: string[];
  newSmells: string[];
  improvedDimensions: Array<{ dimension: string; change: number }>;
  summary: string;
}

export class AttemptProgressionService {
  public static computeDiff(previousAttempt: Attempt, currentAttempt: Attempt): AttemptDiff | null {
    const prevReport = previousAttempt.report;
    const currReport = currentAttempt.report;

    if (!prevReport || !currReport) {
      return null;
    }

    const scoreDiff = currReport.overallScore - prevReport.overallScore;

    const prevSmellIds = new Set(prevReport.designSmells.map(s => s.id));
    const currSmellIds = new Set(currReport.designSmells.map(s => s.id));

    // Smells that were in previous but not in current
    const resolvedSmells = prevReport.designSmells
      .filter(s => !currSmellIds.has(s.id))
      .map(s => s.name);

    // Smells that are new in current
    const newSmells = currReport.designSmells
      .filter(s => !prevSmellIds.has(s.id))
      .map(s => s.name);

    // Dimension improvements
    const improvedDimensions: Array<{ dimension: string; change: number }> = [];
    for (const currScore of currReport.rubricScores) {
      const prevScore = prevReport.rubricScores.find(s => s.dimension === currScore.dimension);
      if (prevScore) {
        const delta = currScore.score - prevScore.score;
        if (delta !== 0) {
          improvedDimensions.push({
            dimension: currScore.dimension,
            change: delta
          });
        }
      }
    }

    let summary = '';
    if (scoreDiff > 0) {
      summary = `Attempt ${currentAttempt.revisionNumber} improved by +${scoreDiff} points over Attempt ${previousAttempt.revisionNumber}!`;
      if (resolvedSmells.length > 0) {
        summary += ` Successfully eliminated ${resolvedSmells.length} design smell(s): ${resolvedSmells.join(', ')}.`;
      }
    } else if (scoreDiff === 0) {
      summary = `Attempt ${currentAttempt.revisionNumber} maintained consistent quality score (${currReport.overallScore}/100).`;
    } else {
      summary = `Attempt ${currentAttempt.revisionNumber} scored ${Math.abs(scoreDiff)} points lower. Review newly introduced design smells.`;
    }

    return {
      previousRevision: previousAttempt.revisionNumber,
      currentRevision: currentAttempt.revisionNumber,
      scoreDifference: scoreDiff,
      resolvedSmells,
      newSmells,
      improvedDimensions,
      summary
    };
  }
}
