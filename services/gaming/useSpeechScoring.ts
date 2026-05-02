import { useState } from 'react';
import { Audio } from 'expo-av';
import { audioPronouncation } from '../api/gaming.api';

export const useSpeechScoring = () => {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastScore, setLastScore] = useState<number | null>(null);

    
    const startRecording = async () => {
        try {
            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) return alert("Microphone permission required!");

            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            setRecording(recording);
        } catch (err) {
            console.error("Failed to start recording", err);
        }
    };

    
    const stopAndScore = async (targetWord: string) => {
        if (!recording) return;

        setRecording(null);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();

        if (uri) {
            setIsAnalyzing(true);
            try {
                const result = await audioPronouncation(uri, targetWord);
                setLastScore(result.score);
                return result;
            } catch (err) {
                alert("Check your connection!");
            } finally {
                setIsAnalyzing(false);
            }
        }
    };

    return { startRecording, stopAndScore, isAnalyzing, lastScore };
};