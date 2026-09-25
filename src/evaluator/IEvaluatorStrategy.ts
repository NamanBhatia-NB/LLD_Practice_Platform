import { Problem } from '../domain/models/Problem.js';
import { Submission } from '../domain/models/Submission.js';
import { CriterionScore, DesignSmell, RefactoredAlternative } from '../domain/models/EvaluationReport.js';

export interface EvaluationResultChunk {
  strategyName: string;
  criterionScores?: Partial<Record<'SRP' | 'OCP' | 'LSP_ISP' | 'DIP' | 'PATTERNS' | 'CONCURRENCY', { score: number; feedback: string }>>;
  detectedSmells?: DesignSmell[];
  strengths?: string[];
  actionableAdvice?: string[];
  refactoredAlternative?: RefactoredAlternative;
}

export interface IEvaluatorStrategy {
  readonly name: string;
  readonly description: string;
  evaluate(submission: Submission, problem: Problem): Promise<EvaluationResultChunk>;
}
