import { useState } from 'react';
import { wordExplanation } from '../api/gaming.api';

export interface LearningContentItem {
  amharic: string;
  translation?: string;
}

export interface WordData {
  word: string;
  definition: string;
  phonetic?: string;
  learning_content?: LearningContentItem[];
}

export const useWordDetails = () => {
  const [explanation, setExplanation] = useState<WordData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExplanation = async (word: string, language: string = 'amharic') => {
    setLoading(true);
    setError(null);
    setExplanation(null);

    try {
      const data = await wordExplanation(word, language);
      if (!data || !data.definition) {
        throw new Error('Invalid response');
      }
      setExplanation(data as WordData);
      return data as WordData;
    } catch (err) {
      const msg = 'Could not find the meaning. Try another word!';
      setError(msg);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearExplanation = () => {
    setExplanation(null);
    setError(null);
  };

  return {
    fetchExplanation,
    explanation,
    loading,
    error,
    clearExplanation,
  };
};