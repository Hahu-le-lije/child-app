import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import React, { useMemo, useRef, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import GameLayout from "@/components/GameLayout";
import AudioButton from "@/components/AudioButton";
import { LISTEN_AND_FILL_CONTENT } from "./index";

type ListenQuestion = {
	sentenceTemplate: string;
	answer: string;
	options: string[];
	audioUrl?: string;
};

type SessionStats = {
	total: number;
	correct: number;
	wrong: number;
	times: number[];
};

const { width } = Dimensions.get("window");
const progressWidth = Math.max(width - 190, 120);

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const sortQuestionKeys = (keys: string[]) =>
	keys.sort(
		(a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, ""),
	));

const buildSentence = (template: string, answer: string, reveal: boolean) => {
	const displayWord = reveal ? answer : "_____";
	return template.includes("____")
		? template.replace("____", displayWord)
		: `${template} ${displayWord}`;
};

const ListenAndFillGame = () => {
	const { id } = useLocalSearchParams();
	const levelId = String(id);

	const level = useMemo(() => {
		const levels = LISTEN_AND_FILL_CONTENT.contents["listen and fill"].levels;
		const selected = levels[levelId] ?? levels.level_1;
		const keys = sortQuestionKeys(Object.keys(selected));

		const questions: ListenQuestion[] = keys.map((key) => selected[key]);

		return {
			id: levelId,
			title: `Listen and Fill ${levelId.toUpperCase()}`,
			questions,
		};
	}, [levelId]);

	const [currentIndex, setCurrentIndex] = useState(0);
	const [selectedWord, setSelectedWord] = useState<string | null>(null);
	const [feedback, setFeedback] = useState<{
		show: boolean;
		correct: boolean;
		message: string;
	}>({ show: false, correct: false, message: "" });
	const [completed, setCompleted] = useState(false);

	const [stats, setStats] = useState<SessionStats>({
		total: level.questions.length,
		correct: 0,
		wrong: 0,
		times: [],
	});

	const startRef = useRef(Date.now());
	const currentQuestion = level.questions[currentIndex];

	const accuracy = stats.total === 0 ? 0 : stats.correct / stats.total;
	const averageTime =
		stats.times.length === 0
			? 0
			: stats.times.reduce((sum, t) => sum + t, 0) / stats.times.length;
	const speed = clamp01((12 - averageTime) / 10);
	const finalScore = accuracy * 70 + speed * 30;

	const reset = () => {
		setCurrentIndex(0);
		setSelectedWord(null);
		setFeedback({ show: false, correct: false, message: "" });
		setCompleted(false);
		setStats({
			total: level.questions.length,
			correct: 0,
			wrong: 0,
			times: [],
		});
		startRef.current = Date.now();
	};

	const handleOptionPress = (word: string) => {
		if (!currentQuestion || feedback.show) return;

		const elapsed = (Date.now() - startRef.current) / 1000;
		const isCorrect = word.toLowerCase() === currentQuestion.answer.toLowerCase();

		setSelectedWord(word);

		if (isCorrect) {
			setStats((prev) => ({
				...prev,
				correct: prev.correct + 1,
				times: [...prev.times, elapsed],
			}));
			setFeedback({ show: true, correct: true, message: "Excellent! That fits perfectly." });

			setTimeout(() => {
				if (currentIndex >= level.questions.length - 1) {
					setCompleted(true);
					return;
				}

				setCurrentIndex((prev) => prev + 1);
				setSelectedWord(null);
				setFeedback({ show: false, correct: false, message: "" });
				startRef.current = Date.now();
			}, 900);
			return;
		}

		setStats((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
		setFeedback({ show: true, correct: false, message: "Nice try. Listen again and pick another word." });

		setTimeout(() => {
			setSelectedWord(null);
			setFeedback({ show: false, correct: false, message: "" });
		}, 700);
	};

	if (!currentQuestion && !completed) {
		return (
			<GameLayout title="Listen and Fill">
				<View style={styles.emptyWrap}>
					<Text style={styles.emptyText}>No questions available.</Text>
					<TouchableOpacity style={styles.primaryButton} onPress={() => router.back()}>
						<Text style={styles.primaryButtonText}>Back to Levels</Text>
					</TouchableOpacity>
				</View>
			</GameLayout>
		);
	}

	if (completed) {
		return (
			<GameLayout title="Level Complete">
				<View style={styles.completeWrap}>
					<LinearGradient
						colors={["#3A4CA8", "#5A67D8"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 1 }}
						style={styles.completeHero}
					>
						<MaterialCommunityIcons name="medal" size={72} color="#FFD86D" />
						<Text style={styles.completeTitle}>Great Listening!</Text>
						<Text style={styles.completeSubtitle}>{level.title} complete</Text>
					</LinearGradient>

					<View style={styles.metricsRow}>
						<View style={styles.metricCard}>
							<Text style={styles.metricValue}>{Math.round(finalScore)}</Text>
							<Text style={styles.metricLabel}>Score</Text>
						</View>
						<View style={styles.metricCard}>
							<Text style={styles.metricValue}>{Math.round(accuracy * 100)}%</Text>
							<Text style={styles.metricLabel}>Accuracy</Text>
						</View>
						<View style={styles.metricCard}>
							<Text style={styles.metricValue}>{averageTime.toFixed(1)}s</Text>
							<Text style={styles.metricLabel}>Avg Time</Text>
						</View>
					</View>

					<View style={styles.summaryCard}>
						<Text style={styles.summaryTitle}>Session Summary</Text>
						<Text style={styles.summaryLine}>Questions: {stats.total}</Text>
						<Text style={styles.summaryLine}>Correct: {stats.correct}</Text>
						<Text style={styles.summaryLine}>Wrong Attempts: {stats.wrong}</Text>
						<Text style={styles.summaryLine}>Speed Score: {Math.round(speed * 100)}%</Text>
					</View>

					<TouchableOpacity style={styles.primaryButton} onPress={reset}>
						<Text style={styles.primaryButtonText}>Play Again</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
						<Text style={styles.secondaryButtonText}>Back to Levels</Text>
					</TouchableOpacity>
				</View>
			</GameLayout>
		);
	}

	const revealedSentence = buildSentence(
		currentQuestion.sentenceTemplate,
		currentQuestion.answer,
		Boolean(feedback.show && feedback.correct),
	);

	return (
		<GameLayout title={level.title}>
			<View style={styles.container}>
				<LinearGradient
					colors={["#2E3760", "#222B4D"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					style={styles.topBar}
				>
					<View style={styles.progressWrap}>
						<Text style={styles.progressLabel}>
							Question {currentIndex + 1}/{level.questions.length}
						</Text>
						<Progress.Bar
							progress={(currentIndex + 1) / level.questions.length}
							width={progressWidth}
							color="#7FD1FF"
							unfilledColor="rgba(255,255,255,0.2)"
							borderWidth={0}
							borderRadius={999}
							height={10}
						/>
					</View>

					<View style={styles.scoreChip}>
						<MaterialCommunityIcons name="check-decagram" size={20} color="#A8FFBE" />
						<Text style={styles.scoreChipText}>{stats.correct}</Text>
					</View>
				</LinearGradient>

				<View style={styles.promptCard}>
					<Text style={styles.promptTitle}>Listen and complete the sentence</Text>
					<AudioButton uri={currentQuestion.audioUrl ?? null} label="Play Audio" style={styles.audioBtn} />
					<Text style={styles.sentence}>{revealedSentence}</Text>
				</View>

				<View style={styles.optionsWrap}>
					{currentQuestion.options.map((option) => {
						const picked = selectedWord === option;
						const isCorrect = option.toLowerCase() === currentQuestion.answer.toLowerCase();

						return (
							<TouchableOpacity
								key={option}
								onPress={() => handleOptionPress(option)}
								disabled={feedback.show}
								activeOpacity={0.88}
								style={[
									styles.option,
									feedback.show && picked && isCorrect && styles.optionGood,
									feedback.show && picked && !isCorrect && styles.optionBad,
								]}
							>
								<Text style={styles.optionText}>{option}</Text>
							</TouchableOpacity>
						);
					})}
				</View>

				{feedback.show && (
					<View style={[styles.feedbackBox, feedback.correct ? styles.feedbackGood : styles.feedbackBad]}>
						<Text style={styles.feedbackText}>{feedback.message}</Text>
					</View>
				)}

				<View style={styles.bottomRow}>
					<View style={styles.bottomCard}>
						<Text style={styles.bottomValue}>{stats.wrong}</Text>
						<Text style={styles.bottomLabel}>Wrong</Text>
					</View>
					<View style={styles.bottomCard}>
						<Text style={styles.bottomValue}>{stats.times.length}</Text>
						<Text style={styles.bottomLabel}>Answered</Text>
					</View>
					<View style={styles.bottomCard}>
						<Text style={styles.bottomValue}>{level.questions.length - currentIndex - 1}</Text>
						<Text style={styles.bottomLabel}>Left</Text>
					</View>
				</View>
			</View>
		</GameLayout>
	);
};

export default ListenAndFillGame;

const styles = StyleSheet.create({
	container: { flex: 1 },
	emptyWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
	emptyText: {
		color: "#fff",
		fontFamily: "Poppins-Medium",
		fontSize: 16,
		marginBottom: 12,
	},
	topBar: {
		borderRadius: 16,
		padding: 12,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 12,
	},
	progressWrap: { flex: 1 },
	progressLabel: {
		color: "#fff",
		marginBottom: 8,
		fontSize: 13,
		fontFamily: "Poppins-Medium",
	},
	scoreChip: {
		marginLeft: 8,
		backgroundColor: "rgba(255,255,255,0.13)",
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 6,
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	scoreChipText: { color: "#fff", fontFamily: "Poppins-Bold", fontSize: 17 },
	promptCard: {
		backgroundColor: "#2C345A",
		borderRadius: 18,
		padding: 14,
		alignItems: "center",
		marginBottom: 12,
	},
	promptTitle: {
		color: "#DEE5FF",
		fontFamily: "Poppins-SemiBold",
		fontSize: 14,
		marginBottom: 10,
	},
	audioBtn: {
		backgroundColor: "#5A67D8",
		paddingHorizontal: 16,
		marginBottom: 12,
	},
	sentence: {
		color: "#fff",
		fontFamily: "Poppins-Bold",
		fontSize: 22,
		textAlign: "center",
		lineHeight: 32,
	},
	optionsWrap: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "space-between",
		gap: 10,
	},
	option: {
		width: "48.5%",
		backgroundColor: "#2D355B",
		borderRadius: 14,
		borderWidth: 2,
		borderColor: "transparent",
		paddingVertical: 14,
		alignItems: "center",
	},
	optionGood: { borderColor: "#33CC73", backgroundColor: "#204A37" },
	optionBad: { borderColor: "#F36A67", backgroundColor: "#4A2D34" },
	optionText: { color: "#fff", fontFamily: "Poppins-SemiBold", fontSize: 16 },
	feedbackBox: {
		marginTop: 12,
		borderRadius: 12,
		paddingVertical: 10,
		alignItems: "center",
	},
	feedbackGood: { backgroundColor: "#2FA866" },
	feedbackBad: { backgroundColor: "#D25151" },
	feedbackText: { color: "#fff", fontFamily: "Poppins-SemiBold", fontSize: 14 },
	bottomRow: { marginTop: 12, flexDirection: "row", gap: 8 },
	bottomCard: {
		flex: 1,
		backgroundColor: "#2D3458",
		borderRadius: 14,
		alignItems: "center",
		paddingVertical: 10,
	},
	bottomValue: { color: "#fff", fontSize: 18, fontFamily: "Poppins-Bold" },
	bottomLabel: {
		color: "#BBC0DB",
		fontSize: 11,
		marginTop: 2,
		fontFamily: "Poppins-Regular",
	},
	completeWrap: { flex: 1, justifyContent: "center" },
	completeHero: {
		borderRadius: 20,
		alignItems: "center",
		paddingVertical: 20,
		marginBottom: 12,
	},
	completeTitle: {
		color: "#fff",
		fontFamily: "Poppins-Bold",
		fontSize: 30,
		marginTop: 8,
	},
	completeSubtitle: {
		color: "rgba(255,255,255,0.9)",
		fontFamily: "Poppins-Regular",
		fontSize: 14,
		marginTop: 3,
	},
	metricsRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
	metricCard: {
		flex: 1,
		backgroundColor: "#2D3458",
		borderRadius: 14,
		alignItems: "center",
		paddingVertical: 10,
	},
	metricValue: { color: "#fff", fontFamily: "Poppins-Bold", fontSize: 18 },
	metricLabel: {
		color: "#BBC0DB",
		fontFamily: "Poppins-Regular",
		fontSize: 11,
		marginTop: 2,
	},
	summaryCard: {
		backgroundColor: "#2D3458",
		borderRadius: 14,
		padding: 12,
		marginBottom: 12,
	},
	summaryTitle: {
		color: "#fff",
		fontFamily: "Poppins-SemiBold",
		fontSize: 14,
		marginBottom: 5,
	},
	summaryLine: {
		color: "#D3D7EA",
		fontFamily: "Poppins-Regular",
		fontSize: 13,
		marginBottom: 2,
	},
	primaryButton: {
		backgroundColor: "#5A76FF",
		borderRadius: 14,
		paddingVertical: 13,
		alignItems: "center",
		marginBottom: 8,
	},
	primaryButtonText: {
		color: "#fff",
		fontFamily: "Poppins-SemiBold",
		fontSize: 16,
	},
	secondaryButton: {
		borderRadius: 14,
		borderWidth: 1,
		borderColor: "#7E87B2",
		paddingVertical: 13,
		alignItems: "center",
	},
	secondaryButtonText: {
		color: "#D0D5EA",
		fontFamily: "Poppins-Medium",
		fontSize: 15,
	},
});
