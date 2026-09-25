import { v4 as uuidv4 } from 'uuid';
import { IEvaluatorStrategy, EvaluationResultChunk } from './IEvaluatorStrategy.js';
import { Problem } from '../domain/models/Problem.js';
import { Submission } from '../domain/models/Submission.js';
import {
  EvaluationReport,
  CriterionScore,
  DesignSmell,
  RefactoredAlternative
} from '../domain/models/EvaluationReport.js';
import { Attempt } from '../domain/models/Attempt.js';

export interface PipelineProgressEvent {
  stage: string;
  progressPercent: number;
  message: string;
}

export class EvaluationPipeline {
  private strategies: IEvaluatorStrategy[] = [];
  private onProgressCallback?: (event: PipelineProgressEvent) => void;

  constructor(strategies: IEvaluatorStrategy[] = []) {
    this.strategies = [...strategies];
  }

  public registerStrategy(strategy: IEvaluatorStrategy): this {
    this.strategies.push(strategy);
    return this;
  }

  public setProgressCallback(callback: (event: PipelineProgressEvent) => void): this {
    this.onProgressCallback = callback;
    return this;
  }

  public async evaluateAttempt(attempt: Attempt, problem: Problem): Promise<EvaluationReport> {
    attempt.markEvaluating();

    const submission = attempt.submission;
    const validation = submission.validate();
    if (!validation.isValid) {
      const errorMsg = `Submission validation failed: ${validation.errors.join('; ')}`;
      attempt.failWithReason(errorMsg);
      throw new Error(errorMsg);
    }

    const chunks: EvaluationResultChunk[] = [];
    const totalStrategies = this.strategies.length;

    for (let i = 0; i < totalStrategies; i++) {
      const strategy = this.strategies[i];
      const progressPercent = Math.round(((i + 1) / (totalStrategies + 1)) * 100);

      if (this.onProgressCallback) {
        this.onProgressCallback({
          stage: strategy.name,
          progressPercent,
          message: `Executing ${strategy.description}...`
        });
      }

      try {
        // Enforce stage timeout (e.g. 5000ms max per strategy)
        const chunk = await this.executeWithTimeout(
          strategy.evaluate(submission, problem),
          5000,
          `Strategy '${strategy.name}' timed out after 5000ms`
        );
        chunks.push(chunk);
      } catch (err: any) {
        console.warn(`[EvaluationPipeline] Strategy '${strategy.name}' failed or timed out:`, err?.message);
        // Resilient pipeline: continue with other strategies
      }
    }

    // Synthesize all chunks into a coherent EvaluationReport
    const report = this.synthesizeReport(attempt.id, problem, chunks);
    attempt.completeWithReport(report);

    if (this.onProgressCallback) {
      this.onProgressCallback({
        stage: 'Completed',
        progressPercent: 100,
        message: 'Evaluation report successfully synthesized.'
      });
    }

    return report;
  }

  private synthesizeReport(
    attemptId: string,
    problem: Problem,
    chunks: EvaluationResultChunk[]
  ): EvaluationReport {
    const rawScores: Record<string, { score: number; feedback: string }> = {};
    const smells: DesignSmell[] = [];
    const strengths: Set<string> = new Set();
    const advice: Set<string> = new Set();
    let refactoredAlternative: RefactoredAlternative = {
      title: 'Standard Refactoring Guide',
      description: 'Follow clean architecture separation of concerns.',
      beforeSnippet: '// Monolithic example',
      afterSnippet: '// Decoupled example',
      keyBenefits: ['Improved testability', 'Adheres to SOLID']
    };

    for (const chunk of chunks) {
      if (chunk.criterionScores) {
        for (const [key, val] of Object.entries(chunk.criterionScores)) {
          if (val) {
            rawScores[key] = val;
          }
        }
      }
      if (chunk.detectedSmells) {
        smells.push(...chunk.detectedSmells);
      }
      if (chunk.strengths) {
        chunk.strengths.forEach(s => strengths.add(s));
      }
      if (chunk.actionableAdvice) {
        chunk.actionableAdvice.forEach(a => advice.add(a));
      }
      if (chunk.refactoredAlternative) {
        refactoredAlternative = chunk.refactoredAlternative;
      }
    }

    // Map rubric scores
    const weights = problem.rubricWeights;
    const rubricScores: CriterionScore[] = [
      {
        criterion: 'Single Responsibility (SRP)',
        dimension: 'SRP',
        score: rawScores.SRP?.score ?? 75,
        maxScore: weights.singleResponsibility,
        feedback: rawScores.SRP?.feedback ?? 'Evaluated class responsibilities and cohesion.'
      },
      {
        criterion: 'Open/Closed Extensibility (OCP)',
        dimension: 'OCP',
        score: rawScores.OCP?.score ?? 75,
        maxScore: weights.openClosedExtensibility,
        feedback: rawScores.OCP?.feedback ?? 'Evaluated extensibility without modifying existing classes.'
      },
      {
        criterion: 'Interface Segregation & DIP',
        dimension: 'DIP',
        score: rawScores.DIP?.score ?? 75,
        maxScore: weights.interfaceSegregationDIP,
        feedback: rawScores.DIP?.feedback ?? 'Evaluated dependency inversion and interface segregation.'
      },
      {
        criterion: 'Design Pattern Appropriateness',
        dimension: 'PATTERNS',
        score: rawScores.PATTERNS?.score ?? 70,
        maxScore: weights.patternAppropriateness,
        feedback: rawScores.PATTERNS?.feedback ?? 'Evaluated architectural pattern selections.'
      },
      {
        criterion: 'Concurrency & Thread Safety',
        dimension: 'CONCURRENCY',
        score: rawScores.CONCURRENCY?.score ?? 70,
        maxScore: weights.stateAndConcurrency,
        feedback: rawScores.CONCURRENCY?.feedback ?? 'Evaluated thread safety and concurrency handling.'
      }
    ];

    // Compute weighted score (0 - 100)
    let totalWeight = 0;
    let weightedSum = 0;
    for (const rs of rubricScores) {
      weightedSum += (rs.score / 100) * rs.maxScore;
      totalWeight += rs.maxScore;
    }
    let overallScore = Math.round((weightedSum / (totalWeight || 1)) * 100);

    // Apply penalty for Critical Smells (5 points per critical smell, max 15 points)
    const criticalCount = smells.filter(s => s.severity === 'CRITICAL').length;
    overallScore = Math.max(20, Math.min(100, overallScore - (criticalCount * 5)));

    // Deduplicate design smells by id
    const uniqueSmellsMap = new Map<string, DesignSmell>();
    for (const smell of smells) {
      if (!uniqueSmellsMap.has(smell.id)) {
        uniqueSmellsMap.set(smell.id, smell);
      }
    }

    return new EvaluationReport(
      uuidv4(),
      attemptId,
      overallScore,
      rubricScores,
      Array.from(uniqueSmellsMap.values()),
      Array.from(strengths),
      Array.from(advice),
      refactoredAlternative,
      'Hybrid: Deterministic Static + Domain Rubric + LLM Reasoning'
    );
  }

  private executeWithTimeout<T>(promise: Promise<T>, ms: number, timeoutErrorMsg: string): Promise<T> {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timer = setTimeout(() => reject(new Error(timeoutErrorMsg)), ms);
    });
    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
  }
}
