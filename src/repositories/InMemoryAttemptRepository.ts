import { Attempt } from '../domain/models/Attempt.js';
import { IAttemptRepository } from '../domain/repositories/IAttemptRepository.js';

export class InMemoryAttemptRepository implements IAttemptRepository {
  private attempts: Map<string, Attempt> = new Map();

  public async save(attempt: Attempt): Promise<void> {
    this.attempts.set(attempt.id, attempt);
  }

  public async getById(id: string): Promise<Attempt | null> {
    return this.attempts.get(id) || null;
  }

  public async getByProblemAndUser(problemId: string, userId: string): Promise<Attempt[]> {
    const results: Attempt[] = [];
    for (const a of this.attempts.values()) {
      if (a.problemId === problemId && a.userId === userId) {
        results.push(a);
      }
    }
    return results.sort((a, b) => a.revisionNumber - b.revisionNumber);
  }

  public async getAllByUser(userId: string): Promise<Attempt[]> {
    const results: Attempt[] = [];
    for (const a of this.attempts.values()) {
      if (a.userId === userId) {
        results.push(a);
      }
    }
    return results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async getNextRevisionNumber(problemId: string, userId: string): Promise<number> {
    const existing = await this.getByProblemAndUser(problemId, userId);
    return existing.length + 1;
  }
}
