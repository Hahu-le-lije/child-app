const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

export const normalizeTimeScore = (
  avgSeconds: number,
  fastSeconds: number,
  slowSeconds: number
) => {
  if (slowSeconds <= fastSeconds) return 0;
  return clamp01((slowSeconds - avgSeconds) / (slowSeconds - fastSeconds));
};

export type StorySessionScoreInput = {
  pagesRead: number;
  totalPages: number;
  keywordsClicked: number;
  totalKeywords: number;
  correctAnswers: number;
  totalQuestions: number;
};

export const scoreStorySession = (input: StorySessionScoreInput) => {
  const readingCompletion =
    input.totalPages > 0 ? clamp01(input.pagesRead / input.totalPages) : 0;
  const comprehension =
    input.totalQuestions > 0
      ? clamp01(input.correctAnswers / input.totalQuestions)
      : 0;
  const vocabularyInterest =
    input.totalKeywords > 0
      ? clamp01(input.keywordsClicked / input.totalKeywords)
      : 0;

  const readingScore = readingCompletion * 30;
  const quizScore = comprehension * 50;
  const engagementScore = vocabularyInterest * 20;

  return {
    finalScore: Math.round(readingScore + quizScore + engagementScore),
    skills: { reading_completion: readingCompletion, comprehension, vocabulary_interest: vocabularyInterest },
  };
};

export type PictureToWordScoreInput = {
  totalQuestions: number;
  correctAnswers: number;
  avgQuestionTime: number;
};

export const scorePictureToWord = (input: PictureToWordScoreInput) => {
  const accuracy =
    input.totalQuestions > 0
      ? clamp01(input.correctAnswers / input.totalQuestions)
      : 0;
  const speed = normalizeTimeScore(input.avgQuestionTime, 2, 12);
  return {
    finalScore: Math.round(accuracy * 70 + speed * 30),
    skills: {
      visual_recognition: clamp01(accuracy * 0.75 + speed * 0.25),
      word_association: accuracy,
      decision_speed: speed,
    },
  };
};

export type TracingScoreInput = {
  strokeAccuracy: number;
  eraserUsedCount: number;
  retries: number;
  timeTakenSeconds: number;
};

export const scoreTracing = (input: TracingScoreInput) => {
  const accuracy = clamp01(input.strokeAccuracy);
  const eraserUsageRatio = clamp01(input.eraserUsedCount / 10);
  const retriesPenalty = clamp01(input.retries / 5) * 0.1;
  const neatnessBase = clamp01(1 - eraserUsageRatio - retriesPenalty);
  const speedNorm = normalizeTimeScore(input.timeTakenSeconds, 8, 40);

  return {
    finalScore: Math.round(accuracy * 60 + neatnessBase * 20 + speedNorm * 20),
    skills: {
      motor_skills: clamp01(neatnessBase * 0.6 + speedNorm * 0.4),
      letter_form_accuracy: accuracy,
      writing_confidence: clamp01(accuracy * 0.5 + neatnessBase * 0.3 + speedNorm * 0.2),
    },
  };
};

export type WordBuilderScoreInput = {
  wordsFound: number;
  totalPossibleWords: number;
  wrongAttempts: number;
  hintsUsed: number;
  timeTakenSeconds: number;
};

export const scoreWordBuilder = (input: WordBuilderScoreInput) => {
  const completion =
    input.totalPossibleWords > 0
      ? clamp01(input.wordsFound / input.totalPossibleWords)
      : 0;
  const wrongAttemptsRatio =
    input.totalPossibleWords > 0
      ? clamp01(input.wrongAttempts / input.totalPossibleWords)
      : 0;
  const hintsUsedRatio =
    input.totalPossibleWords > 0
      ? clamp01(input.hintsUsed / input.totalPossibleWords)
      : 0;
  const speed = normalizeTimeScore(input.timeTakenSeconds, 20, 180);

  const finalScore =
    completion * 50 +
    (1 - wrongAttemptsRatio) * 20 +
    (1 - hintsUsedRatio) * 20 +
    speed * 10;

  return {
    finalScore: Math.round(finalScore),
    skills: {
      spelling: completion,
      pattern_recognition: clamp01(completion * 0.7 + (1 - wrongAttemptsRatio) * 0.3),
      vocabulary: clamp01(completion * 0.8 + (1 - hintsUsedRatio) * 0.2),
      problem_solving: clamp01((1 - wrongAttemptsRatio) * 0.4 + (1 - hintsUsedRatio) * 0.4 + speed * 0.2),
    },
  };
};

export type FillBlankScoreInput = {
  blanksTotal: number;
  correctFills: number;
  wrongAttempts: number;
  dragAttempts: number;
  timeTakenSeconds: number;
};

export const scoreFillBlank = (input: FillBlankScoreInput) => {
  const accuracy =
    input.blanksTotal > 0 ? clamp01(input.correctFills / input.blanksTotal) : 0;
  const wrongAttemptsRatio =
    input.blanksTotal > 0 ? clamp01(input.wrongAttempts / input.blanksTotal) : 0;
  const speed = normalizeTimeScore(input.timeTakenSeconds, 10, 120);
  const dragPenalty = clamp01(input.dragAttempts / Math.max(1, input.blanksTotal * 3));

  return {
    finalScore: Math.round(accuracy * 60 + (1 - wrongAttemptsRatio) * 20 + speed * 20),
    skills: {
      grammar: accuracy,
      sentence_understanding: clamp01(accuracy * 0.7 + (1 - wrongAttemptsRatio) * 0.3),
      listening_comprehension: clamp01(accuracy * 0.6 + speed * 0.2 + (1 - dragPenalty) * 0.2),
    },
  };
};

export type PronunciationScoreInput = {
  pronunciationScore: number;
  attempts: number;
  clarityScore?: number;
};

export const scorePronunciation = (input: PronunciationScoreInput) => {
  const pronunciationNorm = clamp01(input.pronunciationScore / 100);
  const attemptsNorm = clamp01(1 / Math.max(1, input.attempts));
  const clarityNorm =
    typeof input.clarityScore === "number"
      ? clamp01(input.clarityScore / 100)
      : pronunciationNorm;
  const finalScore = pronunciationNorm * 80 + attemptsNorm * 20;
  return {
    finalScore: Math.round(finalScore),
    skills: {
      pronunciation: pronunciationNorm,
      phonetic_accuracy: clarityNorm,
      speaking_confidence: clamp01(attemptsNorm * 0.5 + pronunciationNorm * 0.5),
    },
  };
};

export type VoiceMatchScoreInput = {
  totalQuestions: number;
  correctAnswers: number;
  replayCount: number;
  maxReplays: number;
};

export const scoreVoiceMatch = (input: VoiceMatchScoreInput) => {
  const accuracy =
    input.totalQuestions > 0
      ? clamp01(input.correctAnswers / input.totalQuestions)
      : 0;
  const listeningEfficiency =
    input.maxReplays > 0
      ? clamp01(1 - input.replayCount / input.maxReplays)
      : 0;
  const finalScore = accuracy * 70 + listeningEfficiency * 30;
  return {
    finalScore: Math.round(finalScore),
    skills: {
      listening_skills: accuracy,
      phoneme_recognition: clamp01(accuracy * 0.6 + listeningEfficiency * 0.4),
      word_mapping: accuracy,
    },
  };
};
