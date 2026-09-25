import { Attempt } from '../models/Attempt.js';

export interface IAttemptRepository {
  save(attempt: Attempt): Promise<void>;
  getById(id: string): Promise<Attempt | null>;
  getByProblemAndUser(problemId: string, userId: string): Promise<Attempt[]>;
  getAllByUser(userId: string): Promise<Attempt[]>;
  getNextRevisionNumber(problemId: string, userId: string): Promise<number>;
}
