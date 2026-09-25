
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { InMemoryProblemRepository } from './repositories/InMemoryProblemRepository.js';
import { InMemoryAttemptRepository } from './repositories/InMemoryAttemptRepository.js';
import { PracticePlatformService } from './services/PracticePlatformService.js';
import { SubmissionPayload } from './domain/models/Submission.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize Repositories and Application Service
const problemRepository = new InMemoryProblemRepository();
const attemptRepository = new InMemoryAttemptRepository();
const practiceService = new PracticePlatformService(problemRepository, attemptRepository);

const apiRouter = express.Router();

// Health check
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'LLD Practice Platform API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// List all problems
apiRouter.get('/problems', async (req: Request, res: Response) => {
  try {
    const problems = await practiceService.getProblems();
    res.json(problems.map(p => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      summary: p.summary,
      difficulty: p.difficulty,
      expectedEntities: p.expectedEntities,
      expectedPatterns: p.expectedPatterns
    })));
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get problem detail by ID or Slug
apiRouter.get('/problems/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const idOrSlug = Array.isArray(req.params.idOrSlug) ? req.params.idOrSlug[0] : req.params.idOrSlug;
    const problem = await practiceService.getProblem(idOrSlug);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.json(problem);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Submit a practice attempt
apiRouter.post('/problems/:id/attempts', async (req: Request, res: Response) => {
  try {
    const problemId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = (req.body.userId as string) || 'learner-default';
    const payload = req.body.submission as SubmissionPayload;

    if (!payload) {
      return res.status(400).json({ error: 'Submission payload is required' });
    }

    const attempt = await practiceService.submitAttempt(problemId, userId, payload);
    res.status(201).json(attempt.toJSON());
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get specific attempt details
apiRouter.get('/attempts/:id', async (req: Request, res: Response) => {
  try {
    const attemptId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const attempt = await practiceService.getAttempt(attemptId);
    if (!attempt) {
      return res.status(404).json({ error: 'Attempt not found' });
    }
    res.json(attempt.toJSON());
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get attempt history & evolution for a problem & user
apiRouter.get('/problems/:id/history', async (req: Request, res: Response) => {
  try {
    const problemId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const userId = (req.query.userId as string) || 'learner-default';
    const history = await practiceService.getAttemptHistory(problemId, userId);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mount on both /api and root to handle any serverless prefix behavior
app.use('/api', apiRouter);
app.use(apiRouter);


// Static serving of frontend for production deployment
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.join(__dirname, '../dist/client');

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

export { app, practiceService, problemRepository, attemptRepository };

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[LLD Platform Server] Running on http://localhost:${PORT}`);
  });
}
