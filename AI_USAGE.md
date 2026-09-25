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
