import { IEvaluatorStrategy, EvaluationResultChunk } from './IEvaluatorStrategy.js';
import { Problem } from '../domain/models/Problem.js';
import { Submission } from '../domain/models/Submission.js';
import { DesignSmell } from '../domain/models/EvaluationReport.js';

export class DeterministicStaticEvaluator implements IEvaluatorStrategy {
  public readonly name = 'DeterministicStaticEvaluator';
  public readonly description = 'Static structural analysis evaluating class cohesion, coupling, interface abstraction, and anti-pattern signatures across C++, Java, and Python.';

  public async evaluate(submission: Submission, problem: Problem): Promise<EvaluationResultChunk> {
    const code = submission.sourceCode || '';
    const mermaid = submission.classDiagramMermaid || '';
    const smells: DesignSmell[] = [];
    const strengths: string[] = [];

    // 1. Analyze Classes and Methods across C++, Java, and Python
    const classes = this.extractClasses(code);

    // Interface abstractions check
    const interfaceMatches = Array.from(code.matchAll(/(?:interface\s+([A-Za-z0-9_]+)|class\s+([A-Za-z0-9_]+)\s*\(\s*ABC\s*\)|class\s+(I[A-Za-z0-9_]+))/g));
    const hasPureVirtual = /virtual\s+.*=\s*0\s*;/i.test(code);
    const hasPythonAbstract = /@abstractmethod|\(ABC\)/i.test(code);
    const hasInterfaces = interfaceMatches.length > 0 || hasPureVirtual || hasPythonAbstract || /implements|extends|abstract/i.test(code);

    let maxMethodsInClass = 0;
    let godClassName = '';

    for (const cls of classes) {
      if (cls.methodCount > maxMethodsInClass) {
        maxMethodsInClass = cls.methodCount;
        godClassName = cls.name;
      }

      // Check for God Class Smell (6 or more methods indicates high cohesion risk)
      if (cls.methodCount >= 6) {
        smells.push({
          id: `smell-god-class-${cls.name.toLowerCase()}`,
          name: 'God Class / Monolithic Controller',
          severity: 'CRITICAL',
          affectedComponent: cls.name,
          violationPrinciple: 'Single Responsibility Principle (SRP)',
          explanation: `Class '${cls.name}' encapsulates ${cls.methodCount} distinct methods, likely handling storage, orchestration, and business logic simultaneously.`,
          recommendation: `Split '${cls.name}' into focused components (e.g. separating entity state from allocation strategy, fee calculation, and repository persistence).`
        });
      }
    }

    // 2. Check for Interface Abstraction (DIP / LSP_ISP)
    if (!hasInterfaces && classes.length >= 2) {
      smells.push({
        id: 'smell-missing-abstractions',
        name: 'Missing Interface Abstractions',
        severity: 'WARNING',
        affectedComponent: 'System Contracts',
        violationPrinciple: 'Dependency Inversion Principle (DIP)',
        explanation: 'Concrete classes reference each other directly without polymorphic interface abstractions.',
        recommendation: 'Introduce interfaces for polymorphic behaviors (e.g., pricing strategy, spot allocator, or state transitions) to decouple caller from implementation.'
      });
    } else if (hasInterfaces) {
      strengths.push('Employs explicit interface abstractions to promote polymorphic behavior and loose coupling.');
    }

    // 3. Check for Switch on Type / If-Else Ladder (OCP smell)
    const hasSwitchOnType = /switch\s*\([^)]*(type|kind|category)[^)]*\)|match\s+(?:self\.)?(?:vehicle_)?type:|if\s*\([^)]*(instanceof|===|==)\s*['"][A-Za-z]+['"]|elif\s+.*type\s*==/i.test(code);
    if (hasSwitchOnType) {
      smells.push({
        id: 'smell-switch-on-type',
        name: 'Type-Conditional Branching (OCP Violation)',
        severity: 'WARNING',
        affectedComponent: 'Control Flow',
        violationPrinciple: 'Open/Closed Principle (OCP)',
        explanation: 'Found branching control flow (switch/if-ladder) based on entity type. Adding a new type requires modifying existing control flow.',
        recommendation: 'Replace conditional logic with polymorphism or Strategy/Factory patterns so new types can be added without modifying existing code.'
      });
    }

    // 4. Check Mermaid Diagram structure
    const hasMermaidRelationships = /--|>|\*--|o--|\.\.|-->/g.test(mermaid);
    if (!hasMermaidRelationships && mermaid.length > 20) {
      smells.push({
        id: 'smell-weak-diagram-relationships',
        name: 'Unconnected Diagram Entities',
        severity: 'SUGGESTION',
        affectedComponent: 'Class Diagram',
        violationPrinciple: 'Object Relationships',
        explanation: 'The provided class diagram specifies entities but lacks explicit relationship arrows (composition, aggregation, or inheritance).',
        recommendation: 'Use Mermaid relationship syntax (e.g., `ClassA *-- ClassB` for composition or `Interface <|.. Class` for implementation).'
      });
    } else if (hasMermaidRelationships) {
      strengths.push('Visual class diagram clearly defines entity relationships and cardinality.');
    }

    // Calculate baseline scores
    let srpScore = maxMethodsInClass >= 6 ? 55 : maxMethodsInClass >= 4 ? 75 : 88;
    let ocpScore = hasSwitchOnType ? 60 : 85;
    let dipScore = hasInterfaces ? 85 : 55;
    let lspIspScore = hasInterfaces ? 85 : 60;

    return {
      strategyName: this.name,
      criterionScores: {
        SRP: {
          score: srpScore,
          feedback: maxMethodsInClass >= 6
            ? `Class '${godClassName}' violates SRP by accumulating ${maxMethodsInClass} responsibilities.`
            : `Class responsibilities appear reasonably focused.`
        },
        OCP: {
          score: ocpScore,
          feedback: hasSwitchOnType
            ? `Branching on type indicators hinders extensibility.`
            : `Design structure supports extension without altering core logic.`
        },
        DIP: {
          score: dipScore,
          feedback: hasInterfaces
            ? `Good usage of interface boundaries to invert dependencies.`
            : `Modules are tightly coupled to concrete class implementations.`
        },
        LSP_ISP: {
          score: lspIspScore,
          feedback: hasInterfaces
            ? `Interface contracts provide clean segregated boundaries.`
            : `Consider splitting coarse interfaces into lean, client-specific contracts.`
        }
      },
      detectedSmells: smells,
      strengths: strengths
    };
  }

  private extractClasses(code: string): Array<{ name: string; body: string; methodCount: number }> {
    const classes: Array<{ name: string; body: string; methodCount: number }> = [];

    // Check if code is Python (uses 'def ...:' or indentation rather than braces)
    const isPython = /def\s+[a-zA-Z0-9_]+\s*\(self/i.test(code) || /class\s+[a-zA-Z0-9_]+(?:\([^)]*\))?\s*:/m.test(code);

    if (isPython) {
      const lines = code.split('\n');
      let currentClass: { name: string; methodCount: number } | null = null;
      for (const line of lines) {
        const classMatch = line.match(/^class\s+([A-Za-z0-9_]+)/);
        if (classMatch) {
          if (currentClass) {
            classes.push({ name: currentClass.name, body: '', methodCount: currentClass.methodCount });
          }
          currentClass = { name: classMatch[1], methodCount: 0 };
        } else if (currentClass && /^\s+def\s+[a-zA-Z0-9_]+/.test(line)) {
          currentClass.methodCount++;
        }
      }
      if (currentClass) {
        classes.push({ name: currentClass.name, body: '', methodCount: currentClass.methodCount });
      }
      return classes;
    }

    // C++ and Java brace parser
    const classRegex = /(?:class|struct)\s+([A-Za-z0-9_]+)/g;
    let match;
    while ((match = classRegex.exec(code)) !== null) {
      const className = match[1];
      const startIndex = code.indexOf('{', match.index);
      if (startIndex === -1) continue;

      let braceCount = 1;
      let endIndex = startIndex + 1;
      while (endIndex < code.length && braceCount > 0) {
        if (code[endIndex] === '{') braceCount++;
        else if (code[endIndex] === '}') braceCount--;
        endIndex++;
      }

      const classBody = code.slice(startIndex + 1, endIndex - 1);
      // Matches C++, Java, and TypeScript method signatures (with or without return types/modifiers)
      const methodMatches = classBody.match(/(?:(?:public|private|protected|virtual|static|inline|explicit|async)\s+)?(?:[a-zA-Z0-9_<>\*&:]+\s+)*([a-zA-Z0-9_]+)\s*\([^)]*\)\s*(?:const\s*)?(?:=\s*0|override\s*)?[\s\n\r]*[{;]/g) || [];
      classes.push({
        name: className,
        body: classBody,
        methodCount: methodMatches.length
      });
    }
    return classes;
  }
}
