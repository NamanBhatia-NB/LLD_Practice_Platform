import { v4 as uuidv4 } from 'uuid';
import { IProblemRepository } from '../domain/repositories/IProblemRepository.js';
import { IAttemptRepository } from '../domain/repositories/IAttemptRepository.js';
import { EvaluationPipeline } from '../evaluator/EvaluationPipeline.js';
import { DeterministicStaticEvaluator } from '../evaluator/DeterministicStaticEvaluator.js';
import { DomainRubricRuleEvaluator } from '../evaluator/DomainRubricRuleEvaluator.js';
import { LLMReasoningEvaluator } from '../evaluator/LLMReasoningEvaluator.js';
import { Submission, SubmissionPayload } from '../domain/models/Submission.js';
import { Attempt } from '../domain/models/Attempt.js';
import { AttemptProgressionService, AttemptDiff } from './AttemptProgressionService.js';
import { Problem } from '../domain/models/Problem.js';

export interface AttemptWithDiff {
  attempt: ReturnType<Attempt['toJSON']>;
  diffFromPrevious: AttemptDiff | null;
}

export class PracticePlatformService {
  private pipeline: EvaluationPipeline;

  constructor(
    private problemRepo: IProblemRepository,
    private attemptRepo: IAttemptRepository,
    customPipeline?: EvaluationPipeline
  ) {
    if (customPipeline) {
      this.pipeline = customPipeline;
    } else {
      this.pipeline = new EvaluationPipeline([
        new DeterministicStaticEvaluator(),
        new DomainRubricRuleEvaluator(),
        new LLMReasoningEvaluator()
      ]);
    }
  }

  public async getProblems(): Promise<Problem[]> {
    return this.problemRepo.getAll();
  }

  public async getProblem(idOrSlug: string): Promise<Problem | null> {
    const byId = await this.problemRepo.getById(idOrSlug);
    if (byId) return byId;
    return this.problemRepo.getBySlug(idOrSlug);
  }

  public async submitAttempt(
    problemId: string,
    userId: string,
    payload: SubmissionPayload
  ): Promise<Attempt> {
    const problem = await this.problemRepo.getById(problemId);
    if (!problem) {
      throw new Error(`Problem with ID '${problemId}' not found.`);
    }

    const submission = Submission.fromPayload(problemId, payload);
    const revisionNumber = await this.attemptRepo.getNextRevisionNumber(problemId, userId);

    const attempt = new Attempt(
      uuidv4(),
      problemId,
      userId,
      revisionNumber,
      submission,
      'PENDING'
    );

    await this.attemptRepo.save(attempt);

    // Execute evaluation asynchronously
    // In our architecture, the pipeline evaluates and updates the attempt instance
    try {
      await this.pipeline.evaluateAttempt(attempt, problem);
      await this.attemptRepo.save(attempt);
    } catch (err: any) {
      console.error(`[PracticePlatformService] Evaluation failed for attempt ${attempt.id}:`, err);
      // Attempt status is updated to FAILED inside pipeline
      await this.attemptRepo.save(attempt);
    }

    return attempt;
  }

  public async getAttempt(attemptId: string): Promise<Attempt | null> {
    return this.attemptRepo.getById(attemptId);
  }

  public async getAttemptHistory(problemId: string, userId: string): Promise<AttemptWithDiff[]> {
    const attempts = await this.attemptRepo.getByProblemAndUser(problemId, userId);
    const result: AttemptWithDiff[] = [];

    for (let i = 0; i < attempts.length; i++) {
      const current = attempts[i];
      const previous = i > 0 ? attempts[i - 1] : null;
      const diff = previous ? AttemptProgressionService.computeDiff(previous, current) : null;

      result.push({
        attempt: current.toJSON(),
        diffFromPrevious: diff
      });
    }

    return result;
  }
}
