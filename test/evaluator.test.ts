import { describe, it, expect } from 'vitest';
import { DeterministicStaticEvaluator } from '../src/evaluator/DeterministicStaticEvaluator.js';
import { DomainRubricRuleEvaluator } from '../src/evaluator/DomainRubricRuleEvaluator.js';
import { EvaluationPipeline } from '../src/evaluator/EvaluationPipeline.js';
import { Problem } from '../src/domain/models/Problem.js';
import { Submission } from '../src/domain/models/Submission.js';
import { Attempt } from '../src/domain/models/Attempt.js';
import { AttemptProgressionService } from '../src/services/AttemptProgressionService.js';
import { SEED_PROBLEMS } from '../src/data/seedProblems.js';
import { IEvaluatorStrategy, EvaluationResultChunk } from '../src/evaluator/IEvaluatorStrategy.js';

describe('LLD Domain Model & Evaluator Tests', () => {
  const parkingLotProblem = SEED_PROBLEMS[0];

  describe('Submission Validation', () => {
    it('should reject submissions with empty source code or assumptions', () => {
      const invalidSubmission = new Submission(
        'prob-parking-lot',
        'typescript',
        '', // empty assumptions
        'classDiagram',
        [],
        '', // empty code
        ''
      );

      const validation = invalidSubmission.validate();
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThanOrEqual(2);
    });

    it('should accept valid submissions meeting minimum length thresholds', () => {
      const validSubmission = Submission.fromPayload('prob-parking-lot', {
        language: 'typescript',
        assumptions: 'This is a multi-floor parking lot with 500 spots.',
        classDiagramMermaid: 'classDiagram\nVehicle <|-- Car',
        entities: [],
        sourceCode: 'export class Car extends Vehicle { public license: string; }',
        patternJustification: 'Strategy pattern for parking allocation.'
      });

      const validation = validSubmission.validate();
      expect(validation.isValid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });
  });

  describe('DeterministicStaticEvaluator', () => {
    const evaluator = new DeterministicStaticEvaluator();

    it('should detect God Class smell when a class has excessive methods', async () => {
      const monolithicCode = `
        export class MonolithicParkingManager {
          findSpot() {}
          parkVehicle() {}
          vacateSpot() {}
          calculateFee() {}
          processCreditCard() {}
          printReceipt() {}
          displayAvailableSpots() {}
        }
      `;

      const submission = Submission.fromPayload('prob-parking-lot', {
        language: 'typescript',
        assumptions: 'Valid assumption text with ample details.',
        classDiagramMermaid: 'classDiagram\nMonolithicParkingManager',
        entities: [],
        sourceCode: monolithicCode,
        patternJustification: 'No pattern used'
      });

      const result = await evaluator.evaluate(submission, parkingLotProblem);
      expect(result.detectedSmells).toBeDefined();

      const godClassSmell = result.detectedSmells?.find(s => s.name.includes('God Class'));
      expect(godClassSmell).toBeDefined();
      expect(godClassSmell?.severity).toBe('CRITICAL');
      expect(godClassSmell?.affectedComponent).toBe('MonolithicParkingManager');
      expect(result.criterionScores?.SRP?.score).toBeLessThanOrEqual(60);
    });

    it('should detect switch-on-type OCP violation', async () => {
      const ocpViolatingCode = `
        export class FeeCalculator {
          calculate(type: string) {
            switch (type) {
              case 'CAR': return 10;
              case 'TRUCK': return 20;
              default: return 5;
            }
          }
        }
      `;

      const submission = Submission.fromPayload('prob-parking-lot', {
        language: 'typescript',
        assumptions: 'Assumptions defined with proper scope bounds.',
        classDiagramMermaid: 'classDiagram\nFeeCalculator',
        entities: [],
        sourceCode: ocpViolatingCode,
        patternJustification: 'Standard switch dispatch'
      });

      const result = await evaluator.evaluate(submission, parkingLotProblem);
      const ocpSmell = result.detectedSmells?.find(s => s.name.includes('Type-Conditional Branching'));
      expect(ocpSmell).toBeDefined();
      expect(result.criterionScores?.OCP?.score).toBe(60);
    });

    it('should correctly evaluate C++ code with pure virtual interfaces', async () => {
      const cppCode = `
        class Vehicle { public: virtual ~Vehicle() = default; };
        class SpotAllocationStrategy {
        public:
            virtual ~SpotAllocationStrategy() = default;
            virtual void findSpot() = 0;
        };
        class ParkingLot {
        public:
            void park() {}
            void exit() {}
        };
      `;

      const submission = Submission.fromPayload('prob-parking-lot', {
        language: 'cpp',
        assumptions: 'Valid C++ assumptions for parking lot.',
        classDiagramMermaid: 'classDiagram\nParkingLot o-- SpotAllocationStrategy',
        entities: [],
        sourceCode: cppCode,
        patternJustification: 'Strategy pattern'
      });

      const result = await evaluator.evaluate(submission, parkingLotProblem);
      expect(result.criterionScores?.DIP?.score).toBe(85);
      expect(result.criterionScores?.SRP?.score).toBeGreaterThanOrEqual(75);
    });

    it('should correctly evaluate Python code with ABC and def methods', async () => {
      const pythonCode = `
from abc import ABC, abstractmethod

class SpotAllocationStrategy(ABC):
    @abstractmethod
    def find_spot(self):
        pass

class ParkingLot:
    def __init__(self):
        self.spots = []
    def park_vehicle(self, v):
        pass
    def exit_vehicle(self, t):
        pass
      `;

      const submission = Submission.fromPayload('prob-parking-lot', {
        language: 'python',
        assumptions: 'Python multi-floor parking lot.',
        classDiagramMermaid: 'classDiagram\nParkingLot o-- SpotAllocationStrategy',
        entities: [],
        sourceCode: pythonCode,
        patternJustification: 'Strategy pattern'
      });

      const result = await evaluator.evaluate(submission, parkingLotProblem);
      expect(result.criterionScores?.DIP?.score).toBe(85);
      expect(result.criterionScores?.SRP?.score).toBeGreaterThanOrEqual(75);
    });

    it('should correctly evaluate Java code with interfaces and classes', async () => {
      const javaCode = `
        interface SpotAllocationStrategy {
            void findSpot();
        }
        class ParkingLot {
            public void parkVehicle() {}
            public void processExit() {}
        }
      `;

      const submission = Submission.fromPayload('prob-parking-lot', {
        language: 'java',
        assumptions: 'Java multi-level parking lot.',
        classDiagramMermaid: 'classDiagram\nParkingLot o-- SpotAllocationStrategy',
        entities: [],
        sourceCode: javaCode,
        patternJustification: 'Strategy pattern'
      });

      const result = await evaluator.evaluate(submission, parkingLotProblem);
      expect(result.criterionScores?.DIP?.score).toBe(85);
      expect(result.criterionScores?.SRP?.score).toBeGreaterThanOrEqual(75);
    });
  });

  describe('DomainRubricRuleEvaluator', () => {
    const evaluator = new DomainRubricRuleEvaluator();

    it('should detect missing essential domain entities', async () => {
      const incompleteSubmission = Submission.fromPayload('prob-parking-lot', {
        language: 'typescript',
        assumptions: 'Assumptions text defined here for parking lot.',
        classDiagramMermaid: 'classDiagram\nCar',
        entities: [],
        sourceCode: 'export class Car { public id: string; }', // Missing Ticket, Spot, Gate, Payment
        patternJustification: 'None'
      });

      const result = await evaluator.evaluate(incompleteSubmission, parkingLotProblem);
      const missingEntitiesSmell = result.detectedSmells?.find(s => s.name.includes('Omission of Essential Domain Entities'));
      expect(missingEntitiesSmell).toBeDefined();
      expect(missingEntitiesSmell?.severity).toBe('CRITICAL');
    });

    it('should award high pattern score when expected patterns are present', async () => {
      const submissionWithPattern = Submission.fromPayload('prob-parking-lot', {
        language: 'typescript',
        assumptions: 'Assumptions and thread safety concurrency detailed.',
        classDiagramMermaid: 'classDiagram\nParkingLot o-- SpotAllocationStrategy',
        entities: [],
        sourceCode: `
          export interface SpotAllocationStrategy { findSpot(): void; }
          export class NearestSpotStrategy implements SpotAllocationStrategy { findSpot() {} }
        `,
        patternJustification: 'Used Strategy pattern to isolate allocation algorithm.'
      });

      const result = await evaluator.evaluate(submissionWithPattern, parkingLotProblem);
      expect(result.criterionScores?.PATTERNS?.score).toBeGreaterThanOrEqual(80);
      expect(result.criterionScores?.CONCURRENCY?.score).toBeGreaterThanOrEqual(80);
    });
  });

  describe('EvaluationPipeline Resilience & Fallback', () => {
    it('should gracefully continue pipeline execution even if one strategy throws an error', async () => {
      class FailingStrategy implements IEvaluatorStrategy {
        public readonly name = 'FailingStrategy';
        public readonly description = 'A faulty strategy that simulates network outage';
        async evaluate(): Promise<EvaluationResultChunk> {
          throw new Error('Simulated external service timeout / failure');
        }
      }

      const pipeline = new EvaluationPipeline([
        new FailingStrategy(),
        new DeterministicStaticEvaluator()
      ]);

      const submission = Submission.fromPayload('prob-parking-lot', {
        language: 'typescript',
        assumptions: 'Multi-level parking facility with standard vehicle allocation.',
        classDiagramMermaid: 'classDiagram\nParkingLot *-- ParkingSpot',
        entities: [],
        sourceCode: 'export class ParkingLot { private spots = []; }',
        patternJustification: 'Separation of concerns'
      });
      const attempt = new Attempt('att-test-1', 'prob-parking-lot', 'user-1', 1, submission);

      const report = await pipeline.evaluateAttempt(attempt, parkingLotProblem);

      expect(attempt.status).toBe('COMPLETED');
      expect(report).toBeDefined();
      expect(report.overallScore).toBeGreaterThan(0);
      expect(report.rubricScores.length).toBeGreaterThan(0);
    });
  });

  describe('AttemptProgressionService Evolution Diff', () => {
    it('should compute score progression and resolved smells between two attempts', () => {
      const submission1 = Submission.fromPayload('prob-parking-lot', {
        language: 'typescript',
        assumptions: 'Simple parking lot scope.',
        classDiagramMermaid: 'classDiagram',
        entities: [],
        sourceCode: `
          class MonolithicLot {
            m1(){} m2(){} m3(){} m4(){} m5(){} m6(){} m7(){}
          }
        `,
        patternJustification: ''
      });

      const attempt1 = new Attempt('att-1', 'prob-parking-lot', 'user-1', 1, submission1);
      const attempt2 = new Attempt('att-2', 'prob-parking-lot', 'user-1', 2, submission1);

      // Simulate Attempt 1 with God Class smell and lower score
      attempt1.completeWithReport({
        id: 'rep-1',
        attemptId: 'att-1',
        overallScore: 58,
        isPassing: false,
        criticalSmellCount: 1,
        rubricScores: [
          { criterion: 'SRP', dimension: 'SRP', score: 50, maxScore: 25, feedback: 'God Class detected' },
          { criterion: 'OCP', dimension: 'OCP', score: 60, maxScore: 25, feedback: 'Tight coupling' }
        ],
        designSmells: [
          {
            id: 'smell-god-class',
            name: 'God Class / Monolithic Controller',
            severity: 'CRITICAL',
            affectedComponent: 'MonolithicLot',
            violationPrinciple: 'SRP',
            explanation: 'Too many methods',
            recommendation: 'Break it down'
          }
        ],
        strengths: [],
        actionableAdvice: ['Refactor into separate classes'],
        refactoredAlternative: { title: '', description: '', beforeSnippet: '', afterSnippet: '', keyBenefits: [] },
        evaluatorEngine: 'Test',
        generatedAt: new Date(),
        toJSON: () => ({})
      } as any);

      // Simulate Attempt 2 refactored with no smells and higher score
      attempt2.completeWithReport({
        id: 'rep-2',
        attemptId: 'att-2',
        overallScore: 88,
        isPassing: true,
        criticalSmellCount: 0,
        rubricScores: [
          { criterion: 'SRP', dimension: 'SRP', score: 90, maxScore: 25, feedback: 'Well decoupled' },
          { criterion: 'OCP', dimension: 'OCP', score: 85, maxScore: 25, feedback: 'Extensible strategy' }
        ],
        designSmells: [],
        strengths: ['Great modularity'],
        actionableAdvice: [],
        refactoredAlternative: { title: '', description: '', beforeSnippet: '', afterSnippet: '', keyBenefits: [] },
        evaluatorEngine: 'Test',
        generatedAt: new Date(),
        toJSON: () => ({})
      } as any);

      const diff = AttemptProgressionService.computeDiff(attempt1, attempt2);

      expect(diff).not.toBeNull();
      expect(diff?.scoreDifference).toBe(30); // 88 - 58 = +30
      expect(diff?.resolvedSmells).toContain('God Class / Monolithic Controller');
      expect(diff?.newSmells).toHaveLength(0);
      expect(diff?.improvedDimensions).toHaveLength(2);
      expect(diff?.summary).toContain('improved by +30 points');
    });
  });
});
