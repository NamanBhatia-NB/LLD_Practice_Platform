export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface ProblemSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  difficulty: DifficultyLevel;
  expectedEntities: string[];
  expectedPatterns: string[];
}

export interface StarterTemplate {
  language: string;
  assumptions: string;
  classDiagramMermaid: string;
  sourceCode: string;
  patternJustification: string;
}

export interface RubricWeightConfig {
  singleResponsibility: number;
  openClosedExtensibility: number;
  interfaceSegregationDIP: number;
  patternAppropriateness: number;
  stateAndConcurrency: number;
  edgeCasesRobustness: number;
}

export interface ProblemDetail extends ProblemSummary {
  functionalRequirements: string[];
  nonFunctionalConstraints: string[];
  rubricWeights: RubricWeightConfig;
  starterTemplate: StarterTemplate;
  hints: string[];
}

export interface DesignSmell {
  id: string;
  name: string;
  severity: 'CRITICAL' | 'WARNING' | 'SUGGESTION';
  affectedComponent: string;
  violationPrinciple: string;
  explanation: string;
  recommendation: string;
}

export interface CriterionScore {
  criterion: string;
  dimension: 'SRP' | 'OCP' | 'LSP_ISP' | 'DIP' | 'PATTERNS' | 'CONCURRENCY';
  score: number;
  maxScore: number;
  feedback: string;
}

export interface RefactoredAlternative {
  title: string;
  description: string;
  beforeSnippet: string;
  afterSnippet: string;
  keyBenefits: string[];
}

export interface EvaluationReport {
  id: string;
  attemptId: string;
  overallScore: number;
  isPassing: boolean;
  criticalSmellCount: number;
  rubricScores: CriterionScore[];
  designSmells: DesignSmell[];
  strengths: string[];
  actionableAdvice: string[];
  refactoredAlternative: RefactoredAlternative;
  evaluatorEngine: string;
  generatedAt: string;
}

export interface AttemptData {
  id: string;
  problemId: string;
  userId: string;
  revisionNumber: number;
  status: 'DRAFT' | 'PENDING' | 'EVALUATING' | 'COMPLETED' | 'FAILED';
  submission: {
    language: string;
    assumptions: string;
    classDiagramMermaid: string;
    sourceCode: string;
    patternJustification: string;
    submittedAt: string;
  };
  report: EvaluationReport | null;
  failureReason: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface AttemptDiff {
  previousRevision: number;
  currentRevision: number;
  scoreDifference: number;
  resolvedSmells: string[];
  newSmells: string[];
  improvedDimensions: Array<{ dimension: string; change: number }>;
  summary: string;
}

export interface AttemptWithDiff {
  attempt: AttemptData;
  diffFromPrevious: AttemptDiff | null;
}
