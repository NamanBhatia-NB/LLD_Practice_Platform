import { Problem } from '../domain/models/Problem.js';
import { IProblemRepository } from '../domain/repositories/IProblemRepository.js';
import { SEED_PROBLEMS } from '../data/seedProblems.js';

export class InMemoryProblemRepository implements IProblemRepository {
  private problems: Map<string, Problem> = new Map();

  constructor(initialProblems: Problem[] = SEED_PROBLEMS) {
    initialProblems.forEach(p => this.problems.set(p.id, p));
  }

  public async getAll(): Promise<Problem[]> {
    return Array.from(this.problems.values());
  }

  public async getById(id: string): Promise<Problem | null> {
    return this.problems.get(id) || null;
  }

  public async getBySlug(slug: string): Promise<Problem | null> {
    for (const p of this.problems.values()) {
      if (p.slug === slug) return p;
    }
    return null;
  }
}
