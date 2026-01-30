import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getPlacementQuestions,
  applyPlacementResults,
  skipPlacementTest,
  needsPlacementTest,
  getPlacementTestResults,
  resetPlacementTest,
} from '../services/placementTestService.js';
import { ensureUserExists } from '../services/userService.js';
import prisma from '../lib/prisma.js';

const router = Router();

// Get placement test questions
router.get('/questions', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.userId;

    // Check if user already completed placement test
    const needsTest = await needsPlacementTest(prisma, userId);
    if (!needsTest) {
      res.status(400).json({ error: 'Placement test already completed' });
      return;
    }

    const questions = await getPlacementQuestions(prisma);

    if (questions.length === 0) {
      res.status(404).json({ error: 'No placement test questions found' });
      return;
    }

    res.json({
      totalQuestions: questions.length,
      questions: questions.map((q) => ({
        id: q.id,
        type: q.type,
        difficulty: q.difficulty,
        content: q.content,
        moduleName: q.module.name,
      })),
    });
  } catch (error) {
    console.error('Error fetching placement questions:', error);
    res.status(500).json({ error: 'Failed to fetch placement questions' });
  }
});

// Submit placement test answers
router.post('/submit', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.userId;
    const { answers } = req.body as {
      answers: Array<{ questionId: string; answer: string }>;
    };

    if (!answers || !Array.isArray(answers)) {
      res.status(400).json({ error: 'answers array is required' });
      return;
    }

    // Check if user already completed placement test
    const needsTest = await needsPlacementTest(prisma, userId);
    if (!needsTest) {
      res.status(400).json({ error: 'Placement test already completed' });
      return;
    }

    // Ensure user exists
    await ensureUserExists(userId);

    // Fetch all questions to validate answers
    const questions = await prisma.question.findMany({
      where: {
        id: { in: answers.map((a) => a.questionId) },
        isPlacementTest: true,
      },
    });

    if (questions.length !== answers.length) {
      res.status(400).json({ error: 'Invalid question IDs in answers' });
      return;
    }

    // Calculate score and prepare answer records
    const processedAnswers = answers.map((a) => {
      const question = questions.find((q) => q.id === a.questionId);
      const isCorrect =
        question &&
        a.answer.toString().toLowerCase() ===
          question.correctAnswer.toLowerCase();
      return {
        questionId: a.questionId,
        answer: a.answer,
        isCorrect: !!isCorrect,
      };
    });

    const score = processedAnswers.filter((a) => a.isCorrect).length;

    // Apply placement results
    const result = await applyPlacementResults(
      prisma,
      userId,
      score,
      processedAnswers
    );

    res.json({
      success: true,
      result: {
        score: result.score,
        totalQuestions: result.totalQuestions,
        percentage: Math.round((result.score / result.totalQuestions) * 100),
        level: result.level,
        xpGranted: result.xpGranted,
        modulesUnlocked: result.modulesUnlocked,
      },
      answers: processedAnswers.map((a) => {
        const question = questions.find((q) => q.id === a.questionId);
        const content = question?.content as Record<string, unknown> | undefined;
        return {
          questionId: a.questionId,
          userAnswer: a.answer,
          isCorrect: a.isCorrect,
          correctAnswer: question?.correctAnswer,
          explanation: question?.explanation,
          questionText: content?.question as string | undefined,
        };
      }),
    });
  } catch (error) {
    console.error('Error submitting placement test:', error);
    res.status(500).json({ error: 'Failed to submit placement test' });
  }
});

// Skip placement test (start as beginner)
router.post('/skip', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.userId;

    // Check if user already completed placement test
    const needsTest = await needsPlacementTest(prisma, userId);
    if (!needsTest) {
      res.status(400).json({ error: 'Placement test already completed' });
      return;
    }

    // Ensure user exists
    await ensureUserExists(userId);

    const result = await skipPlacementTest(prisma, userId);

    res.json({
      success: true,
      result: {
        score: 0,
        totalQuestions: 0,
        percentage: 0,
        level: result.level,
        xpGranted: result.xpGranted,
        modulesUnlocked: result.modulesUnlocked,
      },
    });
  } catch (error) {
    console.error('Error skipping placement test:', error);
    res.status(500).json({ error: 'Failed to skip placement test' });
  }
});

// Check if user needs placement test
router.get('/status', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.userId;
    const needsTest = await needsPlacementTest(prisma, userId);

    res.json({
      needsPlacementTest: needsTest,
    });
  } catch (error) {
    console.error('Error checking placement test status:', error);
    res.status(500).json({ error: 'Failed to check placement test status' });
  }
});

// Get past placement test results
router.get('/results', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.userId;
    const results = await getPlacementTestResults(prisma, userId);

    if (!results) {
      res.status(404).json({ error: 'No placement test results found' });
      return;
    }

    res.json(results);
  } catch (error) {
    console.error('Error fetching placement test results:', error);
    res.status(500).json({ error: 'Failed to fetch placement test results' });
  }
});

// Reset placement test (allows retaking)
router.post('/reset', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.auth!.userId;

    // Check if user has completed the test
    const needsTest = await needsPlacementTest(prisma, userId);
    if (needsTest) {
      res.status(400).json({ error: 'No placement test to reset' });
      return;
    }

    await resetPlacementTest(prisma, userId);

    res.json({ success: true, message: 'Placement test reset. You can now retake the test.' });
  } catch (error) {
    console.error('Error resetting placement test:', error);
    res.status(500).json({ error: 'Failed to reset placement test' });
  }
});

export default router;
