import { useState } from 'react';
import { wordExplanation } from '../api/gaming.api';

interface WordData {
    meaning: string;
    example?: string;
    phonetic?: string;
}

export const useWordDetails = () => {
    const [explanation, setExplanation] = useState<WordData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchExplanation = async (word: string, language: string = 'am') => {
        setLoading(true);
        setError(null);
        
        try {
            const data = await wordExplanation(word, language);
            setExplanation(data);
            return data;
        } catch (err) {
            const msg = "Could not find the meaning. Try another word!";
            setError(msg);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const clearExplanation = () => setExplanation(null);

    return { 
        fetchExplanation, 
        explanation, 
        loading, 
        error, 
        clearExplanation 
    };
};