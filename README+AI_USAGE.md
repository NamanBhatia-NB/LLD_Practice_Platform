# ArchStudio — Low-Level Design (LLD) Practice Platform

**ArchStudio** is an interactive, learner-centric engineering platform designed to practice Low-Level Design (LLD) and Object-Oriented Architecture, submit multi-faceted solutions, and receive explainable, rubric-based feedback with detected design smells and concrete refactoring suggestions.

---

## 1. Practice Loop: The Learner Journey

Traditional platforms evaluate algorithms with pass/fail test cases. LLD requires a dedicated practice loop:

$$\text{Choose Problem} \longrightarrow \text{Model \& Diagram} \longrightarrow \text{Implement Contracts} \longrightarrow \text{Hybrid Evaluation} \longrightarrow \text{Refine \& Iterate}$$

1. **Problem Discovery**: Select curated domain challenges (*Smart Parking Lot*, *Elevator Controller*, *Vending Machine*, *Thread-Safe LRU Cache*).
2. **Multi-Faceted Design Workspace**:
   - **Tab 1: Assumptions & Invariants**: Scope bounds (capacity, gates, concurrency assumptions).
   - **Tab 2: Class Diagram**: Live Mermaid UML rendering of entities and relationships.
   - **Tab 3: Interface & Implementation Code**: Polymorphic contracts and concrete classes (C++ / Java / Python).
   - **Tab 4: Pattern Justifications**: Architectural trade-offs (e.g., why Strategy vs State).
3. **Hybrid Evaluation Pipeline**:
   - Executes static structural checks, domain rubric completeness, and semantic reasoning.
4. **Actionable Feedback & Smells**:
   - Multi-dimensional scorecards across SOLID principles.
   - Identified **Design Smells** (e.g. *God Class*, *Type-Conditional Branching*, *Missing Abstractions*).
   - Side-by-side **Refactoring Code Diffs** (Before vs After).
5. **Attempt Progression & Diffing**:
   - Submitting Attempt #2 shows an **Evolution Diff** highlighting score gains and resolved smells.

---

## 2. Platform Architecture & LLD Highlights

The platform itself exemplifies clean Low-Level Design and Design Patterns:

```
┌─────────────────────────────────────────────────────────────┐
│                       Client (Vite + React)                 │
│  - Problem Catalog   - Live Mermaid Visualizer              │
│  - Multi-Tab Workspace - Evaluation Dashboard & Diff Modal  │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST API
┌──────────────────────────────▼──────────────────────────────┐
│                    Express API Service Layer                │
│       (PracticePlatformService, AttemptProgressionService)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌─────────────────────────────┐         ┌─────────────────────────────┐
│    Domain Model (DDD)       │         │    Evaluator Subsystem      │
│  - Problem (Aggregate)      │         │  - IEvaluatorStrategy       │
│  - Submission (Value Obj)   │         │    * DeterministicStatic    │
│  - Attempt (Aggregate)      │         │    * DomainRubricRule       │
│  - EvaluationReport         │         │    * LLMReasoning (Resilient│
│  - Repositories (In-Memory) │         │      with Heuristic Fallback)
└─────────────────────────────┘         │  - EvaluationPipeline       │
                                        │    (Chain of Responsibility)│
                                        └─────────────────────────────┘
```

### Design Patterns Used in the Platform Codebase:
1. **Strategy Pattern (`IEvaluatorStrategy`)**: Pluggable evaluation strategies (`DeterministicStaticEvaluator`, `DomainRubricRuleEvaluator`, `LLMReasoningEvaluator`).
2. **Chain of Responsibility / Pipeline (`EvaluationPipeline`)**: Sequential evaluation with per-stage timeouts, partial fallback aggregation, and lifecycle state management.
3. **Repository Pattern (`IProblemRepository`, `IAttemptRepository`)**: In-memory and testable storage decoupling domain logic from persistence.
4. **Aggregate Root Pattern**: `Attempt` coordinates submission lifecycle transitions (`PENDING` $\to$ `EVALUATING` $\to$ `COMPLETED` / `FAILED`).

---

## 3. Quick Start & How to Run

### Prerequisites
- Node.js (v18+ recommended; tested on v24.x)
- npm (v10+ recommended)

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Run the Full-Stack Application
Start both the backend API server and frontend client concurrently:
```bash
npm run dev
```
- **Backend API**: `http://localhost:4000`
- **Frontend Web UI**: `http://localhost:3000`

### 3. Run the Automated Test Suite
ArchStudio includes comprehensive unit and integration tests covering domain logic, static evaluators, pipeline fallbacks, and attempt progression:
```bash
npm test
```

---

## 4. Key Engineering Decisions & Answers to Design Questions

### Q1: What does a learner actually need to provide for an LLD attempt to be meaningful?
- **Assumptions**: Context defines correctness. A single-gate parking lot vs 10 automated gates requires different concurrency models.
- **Class Diagram (Mermaid)**: Structural relationships (composition vs aggregation).
- **Interface Code**: Method signatures, polymorphic contracts, and error handling.
- **Pattern Justifications**: Explicit trade-offs showing *why* a pattern was chosen.

### Q2: What makes feedback useful when there can be more than one valid solution?
- **Rubric Dimensions over Pass/Fail**: Evaluates against timeless design criteria (SRP, OCP, LSP/ISP, DIP, Patterns, Concurrency).
- **Named Design Smells**: Flags specific anti-patterns (e.g. *God Class*, *Feature Envy*) with severity badges.
- **Refactoring Diffs**: Provides concrete side-by-side code snippets showing how to decouple monolithic classes.

### Q3: Deterministic vs. LLM Division:
- **Deterministic**: AST/syntax checks, interface presence, cyclomatic/method count bounds, and missing domain entity checks. Zero cost, instantaneous, and zero hallucination.
- **LLM / Heuristic Reasoning**: High-level trade-off critique, pedagogical advice, and contextual synthesis. ArchStudio includes a high-fidelity deterministic heuristic engine that runs 100% offline out-of-the-box without requiring API keys.

### Q4: Extensibility to New Formats or Evaluators:
- Implement `IEvaluatorStrategy` and register it via `EvaluationPipeline.registerStrategy()`.
- Add new submission formats via adapter classes without altering core domain entities.

### Q5: Resilience & Timeouts:
- Each pipeline stage has an isolated timeout (5000ms). If an external evaluator times out or fails, the pipeline logs the failure and gracefully continues with the remaining strategies.

---

## 5. Project Deliverables

| Deliverable | Location | Description |
| :--- | :--- | :--- |
| **Research Note** | [`RESEARCH_NOTE.md`](file:///e:/10-04-25/Desktop/Naman/B.Tech/Internships%20Application%20Assignments/Cypher%20Schools/RESEARCH_NOTE.md) | 1–2 pages on the learner problem, existing tools analysis, critical gaps, and product thesis. |
| **Design Note** | [`DESIGN_NOTE.md`](file:///e:/10-04-25/Desktop/Naman/B.Tech/Internships%20Application%20Assignments/Cypher%20Schools/DESIGN_NOTE.md) | Architectural specification, domain classes, design patterns, and answers to design questions. |
| **AI Usage Note** | [`AI_USAGE.md`](file:///e:/10-04-25/Desktop/Naman/B.Tech/Internships%20Application%20Assignments/Cypher%20Schools/AI_USAGE.md) | 4 key architectural decisions contrasting AI recommendations with human engineering judgement. |
| **Automated Tests** | [`test/evaluator.test.ts`](file:///e:/10-04-25/Desktop/Naman/B.Tech/Internships%20Application%20Assignments/Cypher%20Schools/test/evaluator.test.ts) | 8 unit/integration tests verifying domain rules, smells, pipeline resilience, and attempt diffs. |
| **Working Prototype** | [`src/`](file:///e:/10-04-25/Desktop/Naman/B.Tech/Internships%20Application%20Assignments/Cypher%20Schools/src/) & [`client/`](file:///e:/10-04-25/Desktop/Naman/B.Tech/Internships%20Application%20Assignments/Cypher%20Schools/client/) | Complete runnable full-stack application. |

---
---

# AI Usage Note: Engineering Decisions & Human Judgement

**Assignment**: Cypher Schools LLD Practice Platform  
**Purpose**: Documenting 3–5 meaningful AI-assisted decisions, contrasting AI suggestions against human architectural judgement, and explaining the rationale for accepted or rejected choices.

---

### Decision 1: Submission Input Format (Freeform Canvas vs. Structured Multi-Modal Submission)

- **What the AI Suggested**:
  The AI initially suggested supporting an open-ended interactive drag-and-drop canvas where learners place boxes, draw arrows with a mouse, and write freeform notes, mimicking Miro or Excalidraw.
- **What Was Accepted / Rejected**:
  **Rejected the open-ended drawing canvas**. Instead, opted for a **structured multi-faceted submission model** consisting of four distinct facets: Assumptions/Requirements, Declarative Entities & Class Diagram (via Mermaid.js), Skeleton Code/Interfaces, and Design Pattern Justifications.
- **Why**:
  Evaluating freehand mouse strokes or disorganized freeform sticky notes requires heavy computer vision or arbitrary NLP parsing, leading to high false-positive rates and ambiguous feedback. A structured schema models real software engineering: an engineer must specify scope, define interface contracts, express relationships in readable UML, and explain trade-offs. Furthermore, text-based Mermaid diagrams are version-controllable, diffable between attempts, and deterministically parseable.

---

### Decision 2: Evaluator Pipeline Architecture & Resilience Strategy

- **What the AI Suggested**:
  The AI suggested directly routing all submissions to a single external OpenAI/Claude LLM prompt with a system prompt instructing it to "Output JSON with scores for SOLID principles".
- **What Was Accepted / Rejected**:
  **Rejected single-point external LLM dependency**. Accepted a **multi-stage Evaluation Pipeline (Chain of Responsibility / Strategy Pattern)** combining:
  1. *Deterministic Static Evaluator* (AST / structural heuristic checks, class metrics, cyclic detection)
  2. *Domain Rubric Rule Evaluator* (Problem-specific essential entity verification)
  3. *Semantic Reasoning Evaluator* with an **offline heuristic fallback engine** plus optional live LLM API passthrough.
- **Why**:
  Relying solely on external LLMs introduces critical points of failure: rate limits, API key requirements for evaluators, network latency (10-20s delays), nondeterministic scoring swings, and hallucinated scores. The hybrid pipeline ensures immediate sub-second feedback, deterministic consistency on structural invariants, and 100% offline out-of-the-box operation for assignment evaluators without needing API credits.

---

### Decision 3: Feedback Model — Scalar Score vs. Multi-Dimensional Rubric + Design Smells

- **What the AI Suggested**:
  The AI proposed outputting an overall percentage grade (e.g., "78/100") with a generic summary paragraph and bullet points.
- **What Was Accepted / Rejected**:
  **Rejected a single monolithic grade**. Adopted a **multi-dimensional rubric (SRP, OCP, LSP/ISP, DIP, Patterns, Concurrency)** accompanied by concrete **Design Smells** (e.g., God Class, Tight Coupling, Anemic Domain Model) with severity tags and side-by-side **Refactoring Snippets**.
- **Why**:
  In Low-Level Design, a scalar number like "78/100" is completely unhelpful to a learner because there is no single "correct" solution. What matters to a learner is *why* their design has high coupling, *which* class is violating SRP, and *how* to refactor it using an established design pattern. Naming concrete design smells and providing code diffs creates actionable pedagogical value.

---

### Decision 4: Attempt History & Progression Tracking

- **What the AI Suggested**:
  The AI initially treated each submission as a standalone record in a flat database table, simply displaying a timestamped list of past submissions.
- **What Was Accepted / Rejected**:
  **Rejected flat isolated submissions**. Accepted an **Iterative Attempt Aggregate Model** with an automated **Revision Diff Engine**.
- **Why**:
  The core value proposition of an LLD practice platform is the learning loop: *Try → Feedback → Refine → Progress*. By modeling submissions as sequential revisions of an `Attempt`, the platform can compute differential insights (e.g., *"Attempt 2 resolved the 'God Class' smell from Attempt 1 and improved OCP from 60 to 88"*). This validates whether the learner actually absorbed the feedback.
