import { Request, Response } from 'express';
import Question from '../models/question.model.js';
import AptitudeAttempt from '../models/aptitudeAttempt.model.js';

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getPerformanceLevel(percentage: number): string {
  if (percentage >= 90) return 'Exceptional';
  if (percentage >= 75) return 'Excellent';
  if (percentage >= 60) return 'Good';
  if (percentage >= 40) return 'Average';
  return 'Needs Improvement';
}

function getMotivationalMessage(percentage: number): string {
  if (percentage >= 90) return 'Outstanding performance! You have mastered aptitude concepts.';
  if (percentage >= 75) return 'Great job! Keep practicing to reach excellence.';
  if (percentage >= 60) return 'Good effort! Focus on weak areas to improve further.';
  if (percentage >= 40) return 'Keep going! Regular practice will boost your score.';
  return 'Don\'t give up! Review the basics and try again with confidence.';
}

export const getQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, limit = '20' } = req.query;
    const limitNum = Math.min(Math.max(parseInt(limit as string) || 20, 1), 50);

    const matchStage: Record<string, unknown> = { isActive: true };
    if (category) {
      matchStage.category = category;
    }

    const questions = await Question.aggregate([
      { $match: matchStage },
      { $sample: { size: limitNum } },
      { $project: { __v: 0 } },
    ]);

    if (!questions.length) {
      res.status(404).json({
        success: false,
        message: category
          ? `No questions found for category: ${category}`
          : 'No questions available. Please contact admin.',
      });
      return;
    }

    const shuffledQuestions = questions.map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));

    res.status(200).json({ success: true, data: shuffledQuestions });
  } catch (error) {
    console.error('Get Questions Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching questions' });
  }
};

export const submitTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.id!;
    const { answers, timeTaken } = req.body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      res.status(400).json({ success: false, message: 'Answers array is required' });
      return;
    }

    const questionIds = answers.map((a: { questionId: string }) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let correctCount = 0;
    let wrongCount = 0;
    let unanswered = 0;

    const processedQuestions = answers.map(
      (a: { questionId: string; selectedOption: string | null }) => {
        const question = questionMap.get(a.questionId);
        if (!question) {
          unanswered++;
          return { questionId: a.questionId, selectedOption: a.selectedOption || null, isCorrect: null };
        }

        if (a.selectedOption === null || a.selectedOption === undefined) {
          unanswered++;
          return { questionId: a.questionId, selectedOption: null, isCorrect: null };
        }

        const isCorrect = question.correctAnswer === a.selectedOption;
        if (isCorrect) correctCount++;
        else wrongCount++;

        return { questionId: a.questionId, selectedOption: a.selectedOption, isCorrect };
      }
    );

    const totalQuestions = answers.length;
    const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const attempt = await AptitudeAttempt.create({
      userId,
      questions: processedQuestions,
      score: correctCount,
      totalQuestions,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unanswered,
      percentage,
      timeTaken: timeTaken || 0,
      status: 'completed',
      startedAt: new Date(Date.now() - (timeTaken || 0) * 1000),
      completedAt: new Date(),
    });

    const level = getPerformanceLevel(percentage);

    res.status(200).json({
      success: true,
      data: {
        attemptId: attempt._id,
        score: correctCount,
        total: totalQuestions,
        correct: correctCount,
        wrong: wrongCount,
        unanswered,
        percentage,
        performanceLevel: level,
        message: getMotivationalMessage(percentage),
      },
    });
  } catch (error) {
    console.error('Submit Test Error:', error);
    res.status(500).json({ success: false, message: 'Error submitting test' });
  }
};

export const getAttemptHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.id!;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [attempts, totalCount] = await Promise.all([
      AptitudeAttempt.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('score totalQuestions correctAnswers wrongAnswers percentage timeTaken status createdAt'),
      AptitudeAttempt.countDocuments({ userId }),
    ]);

    res.status(200).json({
      success: true,
      data: attempts,
      pagination: {
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        limit,
      },
    });
  } catch (error) {
    console.error('Get Attempt History Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching attempt history' });
  }
};

export const getAttemptById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const attempt = await AptitudeAttempt.findById(id)
      .populate('questions.questionId', 'questionText options correctAnswer difficulty category hint');

    if (!attempt) {
      res.status(404).json({ success: false, message: 'Attempt not found' });
      return;
    }

    if (attempt.userId.toString() !== req.id) {
      res.status(403).json({ success: false, message: 'Unauthorized' });
      return;
    }

    res.status(200).json({ success: true, data: attempt });
  } catch (error) {
    console.error('Get Attempt Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching attempt' });
  }
};
