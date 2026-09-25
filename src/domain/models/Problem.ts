export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface StarterTemplate {
  language: string;
  assumptions: string;
  classDiagramMermaid: string;
  sourceCode: string;
  patternJustification: string;
}

export interface RubricWeightConfig {
  singleResponsibility: number;     // e.g. 20
  openClosedExtensibility: number;   // e.g. 20
  interfaceSegregationDIP: number;   // e.g. 15
  patternAppropriateness: number;    // e.g. 20
  stateAndConcurrency: number;       // e.g. 15
  edgeCasesRobustness: number;       // e.g. 10
}

export class Problem {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly title: string,
    public readonly summary: string,
    public readonly difficulty: DifficultyLevel,
    public readonly functionalRequirements: string[],
    public readonly nonFunctionalConstraints: string[],
    public readonly expectedEntities: string[],
    public readonly expectedPatterns: string[],
    public readonly rubricWeights: RubricWeightConfig,
    public readonly starterTemplate: StarterTemplate,
    public readonly hints: string[] = []
  ) {}

  public matchesExpectedEntity(entityName: string): boolean {
    const normalized = entityName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return this.expectedEntities.some(
      expected => expected.toLowerCase().replace(/[^a-z0-9]/g, '') === normalized
    );
  }
}
