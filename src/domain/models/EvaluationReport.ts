export type SmellSeverity = 'CRITICAL' | 'WARNING' | 'SUGGESTION';

export interface DesignSmell {
  id: string;
  name: string;
  severity: SmellSeverity;
  affectedComponent: string;
  violationPrinciple: string;
  explanation: string;
  recommendation: string;
}

export interface CriterionScore {
  criterion: string;
  dimension: 'SRP' | 'OCP' | 'LSP_ISP' | 'DIP' | 'PATTERNS' | 'CONCURRENCY';
  score: number;      // 0 - 100
  maxScore: number;   // weight
  feedback: string;
}

export interface RefactoredAlternative {
  title: string;
  description: string;
  beforeSnippet: string;
  afterSnippet: string;
  keyBenefits: string[];
}

export class EvaluationReport {
  constructor(
    public readonly id: string,
    public readonly attemptId: string,
    public readonly overallScore: number, // 0 - 100
    public readonly rubricScores: CriterionScore[],
    public readonly designSmells: DesignSmell[],
    public readonly strengths: string[],
    public readonly actionableAdvice: string[],
    public readonly refactoredAlternative: RefactoredAlternative,
    public readonly evaluatorEngine: string,
    public readonly generatedAt: Date = new Date()
  ) {}

  public get criticalSmellCount(): number {
    return this.designSmells.filter(s => s.severity === 'CRITICAL').length;
  }

  public get isPassing(): boolean {
    return this.overallScore >= 70 && this.criticalSmellCount === 0;
  }

  public toJSON() {
    return {
      id: this.id,
      attemptId: this.attemptId,
      overallScore: this.overallScore,
      isPassing: this.isPassing,
      criticalSmellCount: this.criticalSmellCount,
      rubricScores: this.rubricScores,
      designSmells: this.designSmells,
      strengths: this.strengths,
      actionableAdvice: this.actionableAdvice,
      refactoredAlternative: this.refactoredAlternative,
      evaluatorEngine: this.evaluatorEngine,
      generatedAt: this.generatedAt.toISOString()
    };
  }
}
