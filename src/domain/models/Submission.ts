export interface EntityDefinition {
  name: string;
  type: 'class' | 'interface' | 'abstract_class' | 'enum';
  methods?: string[];
  fields?: string[];
  responsibilities?: string;
}

export interface SubmissionPayload {
  language: string;
  assumptions: string;
  classDiagramMermaid: string;
  entities: EntityDefinition[];
  sourceCode: string;
  patternJustification: string;
}

export class Submission {
  public readonly submittedAt: Date;

  constructor(
    public readonly problemId: string,
    public readonly language: string,
    public readonly assumptions: string,
    public readonly classDiagramMermaid: string,
    public readonly entities: EntityDefinition[],
    public readonly sourceCode: string,
    public readonly patternJustification: string,
    submittedAt?: Date
  ) {
    this.submittedAt = submittedAt || new Date();
  }

  public validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!this.problemId || this.problemId.trim() === '') {
      errors.push('Problem ID is required.');
    }
    if (!this.sourceCode || this.sourceCode.trim().length < 20) {
      errors.push('Source code must be provided with meaningful class/interface definitions (minimum 20 characters).');
    }
    if (!this.assumptions || this.assumptions.trim().length < 10) {
      errors.push('Design assumptions and scope boundary clarifications are required (minimum 10 characters).');
    }
    if (!this.classDiagramMermaid || this.classDiagramMermaid.trim().length < 10) {
      errors.push('Class diagram (Mermaid) is required to represent relationships.');
    }
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public toJSON() {
    return {
      problemId: this.problemId,
      language: this.language,
      assumptions: this.assumptions,
      classDiagramMermaid: this.classDiagramMermaid,
      entities: this.entities,
      sourceCode: this.sourceCode,
      patternJustification: this.patternJustification,
      submittedAt: this.submittedAt.toISOString()
    };
  }

  public static fromPayload(problemId: string, payload: SubmissionPayload): Submission {
    return new Submission(
      problemId,
      payload.language || 'typescript',
      payload.assumptions || '',
      payload.classDiagramMermaid || '',
      payload.entities || [],
      payload.sourceCode || '',
      payload.patternJustification || ''
    );
  }
}
