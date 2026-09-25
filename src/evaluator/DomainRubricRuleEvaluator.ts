import { IEvaluatorStrategy, EvaluationResultChunk } from './IEvaluatorStrategy.js';
import { Problem } from '../domain/models/Problem.js';
import { Submission } from '../domain/models/Submission.js';
import { DesignSmell } from '../domain/models/EvaluationReport.js';

export class DomainRubricRuleEvaluator implements IEvaluatorStrategy {
  public readonly name = 'DomainRubricRuleEvaluator';
  public readonly description = 'Evaluates domain model completeness against problem-specific requirements, entity coverage, and design pattern selection.';

  public async evaluate(submission: Submission, problem: Problem): Promise<EvaluationResultChunk> {
    const code = (submission.sourceCode || '').toLowerCase();
    const mermaid = (submission.classDiagramMermaid || '').toLowerCase();
    const justification = (submission.patternJustification || '').toLowerCase();
    const combined = `${code} ${mermaid} ${justification}`;

    const smells: DesignSmell[] = [];
    const strengths: string[] = [];

    // 1. Check Missing Core Domain Entities
    const missingEntities: string[] = [];
    for (const expectedEntity of problem.expectedEntities) {
      const normalized = expectedEntity.toLowerCase().replace(/[^a-z0-9]/g, '');
      const regex = new RegExp(`\\b${normalized}\\b`, 'i');
      if (!regex.test(combined)) {
        missingEntities.push(expectedEntity);
      }
    }

    if (missingEntities.length > 0) {
      smells.push({
        id: `smell-missing-entities-${missingEntities[0].toLowerCase()}`,
        name: 'Omission of Essential Domain Entities',
        severity: missingEntities.length >= 2 ? 'CRITICAL' : 'WARNING',
        affectedComponent: missingEntities.join(', '),
        violationPrinciple: 'Domain Modeling Completeness',
        explanation: `The solution is missing domain abstractions for: ${missingEntities.join(', ')}. In ${problem.title}, these represent critical actors/invariants.`,
        recommendation: `Introduce explicit classes or interfaces for ${missingEntities.join(', ')} to separate state tracking and domain behaviors.`
      });
    } else {
      strengths.push(`Covers all essential domain entities (${problem.expectedEntities.join(', ')}).`);
    }

    // 2. Check Expected Design Patterns
    const detectedPatterns: string[] = [];
    const patternKeywords = ['strategy', 'factory', 'observer', 'state', 'command', 'decorator', 'singleton', 'adapter'];

    for (const pattern of problem.expectedPatterns) {
      const lower = pattern.toLowerCase();
      const matchedKeyword = patternKeywords.find(k => lower.includes(k) && combined.includes(k));
      const cleanPatternName = lower.replace(/\s*\(.*\)/g, '').replace(' pattern', '').trim();
      if (matchedKeyword || combined.includes(cleanPatternName) || combined.includes(lower)) {
        detectedPatterns.push(pattern);
      }
    }

    let patternScore = 65;
    if (detectedPatterns.length > 0) {
      patternScore = Math.min(100, 75 + detectedPatterns.length * 12);
      strengths.push(`Appropriately implements pattern(s): ${detectedPatterns.join(', ')}.`);
    } else {
      smells.push({
        id: 'smell-missing-pattern',
        name: 'Lack of Flexible Behavioral Patterns',
        severity: 'WARNING',
        affectedComponent: 'Design Patterns',
        violationPrinciple: 'Pattern Appropriateness',
        explanation: `Did not clearly employ relevant design patterns such as ${problem.expectedPatterns.join(' or ')}.`,
        recommendation: `Consider applying ${problem.expectedPatterns[0]} to decouple dynamic algorithms or state transitions from controller classes.`
      });
    }

    // 3. Concurrency & Thread-Safety Check
    const hasConcurrencyKeywords = /synchronized|lock|mutex|atomic|concurrent|volatile|reentrant|threadsafe|mutex/i.test(combined);
    const mentionsConcurrencyInAssumptions = /concurrent|thread|parallel|scale|simultaneous/i.test(submission.assumptions.toLowerCase());

    let concurrencyScore = 70;
    if (hasConcurrencyKeywords) {
      concurrencyScore = 92;
      strengths.push('Includes explicit thread-safety considerations (locks, synchronized, or atomic primitives).');
    } else if (mentionsConcurrencyInAssumptions) {
      concurrencyScore = 80;
      strengths.push('Acknowledged concurrency constraints in design scope/assumptions.');
    } else {
      concurrencyScore = 60;
      smells.push({
        id: 'smell-unhandled-concurrency',
        name: 'Unaddressed Concurrency & Race Conditions',
        severity: 'SUGGESTION',
        affectedComponent: 'State Management',
        violationPrinciple: 'Concurrency & Thread Safety',
        explanation: 'Shared mutable state (such as spot allocation, payment confirmation, or inventory) does not show synchronization mechanisms.',
        recommendation: 'Document synchronization strategy (e.g. synchronized methods, ReadWriteLock, or transactional database locks) for concurrent access.'
      });
    }

    return {
      strategyName: this.name,
      criterionScores: {
        PATTERNS: {
          score: patternScore,
          feedback: detectedPatterns.length > 0
            ? `Identified appropriate patterns: ${detectedPatterns.join(', ')}.`
            : `Could benefit from architectural patterns such as ${problem.expectedPatterns.join(', ')}.`
        },
        CONCURRENCY: {
          score: concurrencyScore,
          feedback: hasConcurrencyKeywords
            ? `Explicit synchronization/thread-safety protections detected.`
            : `Ensure concurrent state modifications are safely handled.`
        }
      },
      detectedSmells: smells,
      strengths: strengths
    };
  }
}
