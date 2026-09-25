import { Submission } from './Submission.js';
import { EvaluationReport } from './EvaluationReport.js';

export type AttemptStatus = 'DRAFT' | 'PENDING' | 'EVALUATING' | 'COMPLETED' | 'FAILED';

export class Attempt {
  private _status: AttemptStatus;
  private _report: EvaluationReport | null = null;
  private _failureReason: string | null = null;
  private _completedAt: Date | null = null;

  constructor(
    public readonly id: string,
    public readonly problemId: string,
    public readonly userId: string,
    public readonly revisionNumber: number,
    public readonly submission: Submission,
    status: AttemptStatus = 'PENDING',
    report: EvaluationReport | null = null,
    failureReason: string | null = null,
    public readonly createdAt: Date = new Date(),
    completedAt: Date | null = null
  ) {
    this._status = status;
    this._report = report;
    this._failureReason = failureReason;
    this._completedAt = completedAt;
  }

  public get status(): AttemptStatus {
    return this._status;
  }

  public get report(): EvaluationReport | null {
    return this._report;
  }

  public get failureReason(): string | null {
    return this._failureReason;
  }

  public get completedAt(): Date | null {
    return this._completedAt;
  }

  public markEvaluating(): void {
    if (this._status === 'COMPLETED') {
      throw new Error(`Cannot transition from COMPLETED to EVALUATING`);
    }
    this._status = 'EVALUATING';
  }

  public completeWithReport(report: EvaluationReport): void {
    this._status = 'COMPLETED';
    this._report = report;
    this._completedAt = new Date();
  }

  public failWithReason(reason: string): void {
    this._status = 'FAILED';
    this._failureReason = reason;
    this._completedAt = new Date();
  }

  public toJSON() {
    return {
      id: this.id,
      problemId: this.problemId,
      userId: this.userId,
      revisionNumber: this.revisionNumber,
      status: this._status,
      submission: this.submission.toJSON(),
      report: this._report ? this._report.toJSON() : null,
      failureReason: this._failureReason,
      createdAt: this.createdAt.toISOString(),
      completedAt: this._completedAt ? this._completedAt.toISOString() : null
    };
  }
}
