import { Problem } from '../models/Problem.js';

export interface IProblemRepository {
  getAll(): Promise<Problem[]>;
  getById(id: string): Promise<Problem | null>;
  getBySlug(slug: string): Promise<Problem | null>;
}
