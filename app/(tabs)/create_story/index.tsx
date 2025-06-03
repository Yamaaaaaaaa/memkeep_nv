import { MaterialIcons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { getAuth } from "firebase/auth";
import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    StatusBar,
    Modal,
    ActivityIndicator,
    StyleSheet,
} from "react-native";

import { CreateNewStories_WITHBOT } from "@/firebase/utils/db-new";

// Replace with your API key
// In a real environment, you should store API keys in environment variables or use a backend
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
type Message = {
    id: number;
    text: string;
    type: "question" | "answer";
    answered: boolean;
    speaker: string;
};

const predefinedQuestions = [
    "What is this story about?",
    "Who are the people in this story?",
    "When did this story take place?",
    "Where did this story happen?",
];

export default function ChatAIScreen() {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    // Start with only the first question
    const [messages, setMessages] = useState<Message[]>([
        {
            _id: "1",
            text: predefinedQuestions[0] + "",
            createdAt: new Date(),
            user: {
                _id: "bot",
                name: "AI",
            },
        },
        {
            _id: "2",
            text: "",
            createdAt: new Date(),
            user: {
                _id: userId + "",
                name: "User",
            },
        },
    ]);
    const [title, setTitle] = useState("New Story Title");
    const [currentAnswer, setCurrentAnswer] = useState("");
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [inputMode, setInputMode] = useState<"type" | "speak">("type");
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isAIMode, setIsAIMode] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);

    // Scroll to bottom when new messages are added
    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages.length]);

    const handleAnswer = (messageId: number, mode: "type" | "speak" = "type") => {
        setEditingMessageId(messageId);
        setInputMode(mode);

        if (mode === "type") {
            setIsModalVisible(true);

            // Find the message being edited to pre-fill the input
            const message = messages.find((m) => m._id === messageId.toString());
            if (message) {
                setCurrentAnswer(message.text);
            }
        } else {
            // Handle speech input
            // This would be implemented with a speech recognition API
            console.log("Speech input mode activated");
            // For now, we'll just show the modal as a placeholder
            setIsModalVisible(true);
        }
    };

    // Function to call OpenAI API with retry logic
    const fetchAIQuestion = async (attemptCount = 0) => {
        setIsLoading(true);
        setRetryCount(attemptCount);
        let error;

        try {
            // Convert messages to OpenAI API format
            const formattedMessages = messages
                .filter((m) => m.answered || m.user._id === "bot")
                .map((m) => ({
                    role: m.user._id === "bot" ? "assistant" : "user",
                    content: m.text,
                }));

            // Limit the number of messages to save tokens
            const limitedMessages = formattedMessages.slice(-5);

            // Add system message to guide the AI
            const systemMessage = {
                role: "system",
                content: `You are an AI assistant helping users tell stories. 
        The user has answered basic questions about their story. 
        Your task is to ask follow-up questions to help them develop their story with more details.
        Ask short, specific, and easy-to-understand questions.
        Only ask one question at a time.
        Base your questions on their previous answers.
        Don't repeat questions that have already been asked.`,
            };

            // Call OpenAI API
            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-3.5-turbo", // Use gpt-3.5-turbo to save costs
                    messages: [systemMessage, ...limitedMessages],
                    max_tokens: 50, // Reduce max_tokens to save costs
                    temperature: 0.7,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    },
                    timeout: 10000, // Add timeout to avoid waiting too long
                },
            );

            // Get question from AI
            const aiQuestion = response.data.choices[0].message.content;

            // Add AI question to messages
            const newId = messages.length + 1;
            const newMessage: Message = {
                _id: newId.toString(),
                text: aiQuestion,
                createdAt: new Date(),
                user: {
                    _id: "bot",
                    name: "AI",
                },
                id: newId,
                type: "answer",
                answered: true,
                speaker: "bot",
            };
            setMessages((prev) => [...prev, newMessage]);

            // Reset retry count on success
            setRetryCount(0);
        } catch (e) {
            error = e;
            console.error("Error calling OpenAI API:", error);

            // Check if it's a 429 error and we can retry
            if (axios.isAxiosError(error) && error.response?.status === 429 && attemptCount < 5) {
                // Calculate exponential backoff delay: 2^attemptCount * 1000ms
                const delay = Math.pow(2, attemptCount) * 1000;
                console.log(
                    `Rate limited. Retrying in ${delay / 1000} seconds... (Attempt ${attemptCount + 1})`,
                );

                // Wait before retrying
                setTimeout(() => {
                    fetchAIQuestion(attemptCount + 1);
                }, delay);
                return;
            }

            // If we can't retry or max retries reached, show error message
            if (attemptCount >= 5) {
                // After max retries, add a message indicating the issue
                const newId = messages.length + 1;
                const errorMessage: Message = {
                    _id: newId.toString(),
                    text: "I'm having trouble connecting. Please try again later.",
                    createdAt: new Date(),
                    user: {
                        _id: "bot",
                        name: "AI",
                    },
                    id: newId,
                    type: "answer",
                    answered: true,
                    speaker: "bot",
                };
                setMessages((prev) => [...prev, errorMessage]);
            }
        } finally {
            // Only set loading to false if we're not retrying
            if (retryCount >= 5 || !axios.isAxiosError(error) || error.response?.status !== 429) {
                setIsLoading(false);
            }
        }
    };

    const saveAnswer = async () => {
        if (currentAnswer.trim() && editingMessageId) {
            // Update the answer
            setMessages(prev => {
                const updatedMessages = prev.map(msg =>
                    msg._id === editingMessageId.toString()
                        ? { ...msg, text: currentAnswer, answered: true } as any
                        : msg
                );

                // Create the new answer message (adjusting type)
                const newMessage: Message = {
                    _id: editingMessageId.toString(),
                    text: currentAnswer,
                    createdAt: new Date() as any,
                    user: { _id: "bot", name: "AI" } as any,
                    id: parseInt(editingMessageId.toString(), 10),
                    type: "answer",
                    answered: true,
                    speaker: "bot",
                };

                return [...updatedMessages, newMessage];
            });

            setIsModalVisible(false);
            setCurrentAnswer("");
            setEditingMessageId(null);

            // Check if we're in predefined questions mode or AI mode
            if (!isAIMode) {
                // Check if we need to add the next predefined question
                const nextQuestionIndex = currentQuestionIndex + 1;
                if (nextQuestionIndex < predefinedQuestions.length) {
                    // Add the next question and its answer placeholder after a short delay
                    setTimeout(() => {
                        const newId = messages.length + 1;
                        const newQuestion: Message = {
                            _id: newId.toString(),
                            text: predefinedQuestions[nextQuestionIndex],
                            createdAt: new Date(),
                            user: {
                                _id: "bot",
                                name: "AI",
                            },
                            id: newId,
                            type: "question",
                            answered: false,
                            speaker: "bot",
                        };
                        setMessages((prev) => [...prev, newQuestion]);
                        setCurrentQuestionIndex(nextQuestionIndex);
                    }, 500);
                } else {
                    // We've finished the predefined questions, switch to AI mode
                    setIsAIMode(true);
                    // Get the first AI question
                    setTimeout(() => {
                        fetchAIQuestion();
                    }, 1000);
                }
            } else {
                // We're in AI mode, get the next AI question
                setTimeout(() => {
                    fetchAIQuestion();
                }, 1000);
            }
        }
    };

    const handleAnswerAgain = (messageId: number) => {
        handleAnswer(messageId);
    };

    const handleLetsStart = async () => {
        await CreateNewStories_WITHBOT(messages, userId + "", title);

        console.log("Let's start pressed");
        // navigation.push("/choose-share-route");
    };

    return (
        <>
            <StatusBar translucent backgroundColor="#FFDCD1" barStyle="dark-content" />
            <LinearGradient colors={["#FFDCD1", "#ECEBD0"]} style={styles.gradient}>
                {/* Outer border */}
                <View style={styles.container}>
                    <View style={styles.contentContainer}>
                        {/* Header */}
                        <TextInput
                            style={styles.titleInput}
                            onChangeText={setTitle}
                            value={title}
                        />

                        {/* Messages ScrollView */}
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.scrollView}
                            contentContainerStyle={styles.scrollViewContent}
                        >
                            {messages.map((message, index) => {
                                // Skip rendering answers directly, they'll be handled with their questions
                                if (message.user._id === "bot") return null;

                                // Find the corresponding answer for this question
                                const answer = messages[index + 1];

                                return (
                                    <View key={message._id} style={styles.messageContainer}>
                                        {/* Question */}
                                        <View style={styles.questionContainer}>
                                            <Text style={styles.questionText}>
                                                {isAIMode && index >= predefinedQuestions.length * 2
                                                    ? "AI: "
                                                    : ""}
                                                {message.text}
                                            </Text>
                                        </View>

                                        {/* Answer */}
                                        {answer && (
                                            <View style={styles.answerWrapper}>
                                                <TouchableOpacity
                                                    onPress={() => handleAnswer(answer._id)}
                                                    style={styles.answerContainer}
                                                >
                                                    <Text style={styles.answerText}>
                                                        {answer.answered ? answer.text : "Answer"}
                                                    </Text>
                                                </TouchableOpacity>

                                                {answer.answered ? (
                                                    <View style={styles.answerAgainContainer}>
                                                        <TouchableOpacity
                                                            onPress={() =>
                                                                handleAnswerAgain(answer._id)
                                                            }
                                                            style={styles.answerAgainButton}
                                                        >
                                                            <Text style={styles.answerAgainText}>
                                                                Answer again
                                                            </Text>
                                                            <MaterialIcons
                                                                name="refresh"
                                                                size={16}
                                                                color="black"
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                ) : (
                                                    <>
                                                        <View style={styles.actionButtonsContainer}>
                                                            <TouchableOpacity
                                                                style={styles.typeButton}
                                                                onPress={() =>
                                                                    handleAnswer(answer._id, "type")
                                                                }
                                                            >
                                                                <Text
                                                                    style={styles.actionButtonText}
                                                                >
                                                                    Type
                                                                </Text>
                                                                <MaterialIcons
                                                                    name="edit"
                                                                    size={20}
                                                                    color="black"
                                                                />
                                                            </TouchableOpacity>

                                                            <TouchableOpacity
                                                                style={styles.speakButton}
                                                                onPress={() =>
                                                                    handleAnswer(answer._id, "speak")
                                                                }
                                                            >
                                                                <Text
                                                                    style={styles.actionButtonText}
                                                                >
                                                                    Speak
                                                                </Text>
                                                                <MaterialIcons
                                                                    name="mic"
                                                                    size={20}
                                                                    color="black"
                                                                />
                                                            </TouchableOpacity>
                                                        </View>
                                                        <View style={styles.actionButtonsContainer}>
                                                            <TouchableOpacity
                                                                style={styles.eraseButton}
                                                                onPress={() =>
                                                                    handleAnswer(answer._id, "type")
                                                                }
                                                            >
                                                                <Text
                                                                    style={styles.actionButtonText}
                                                                >
                                                                    Erase
                                                                </Text>
                                                                <MaterialIcons
                                                                    name="edit"
                                                                    size={20}
                                                                    color="black"
                                                                />
                                                            </TouchableOpacity>

                                                            <TouchableOpacity
                                                                style={styles.nextButton}
                                                                onPress={() =>
                                                                    handleAnswer(answer._id, "speak")
                                                                }
                                                            >
                                                                <Text
                                                                    style={styles.actionButtonText}
                                                                >
                                                                    Next
                                                                </Text>
                                                                <MaterialIcons
                                                                    name="mic"
                                                                    size={20}
                                                                    color="black"
                                                                />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </>
                                                )}
                                            </View>
                                        )}
                                    </View>
                                );
                            })}

                            {/* Loading indicator for AI response */}
                            {isLoading && (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#66621C" />
                                    <Text style={styles.loadingText}>
                                        {retryCount > 0
                                            ? `Retrying... (Attempt ${retryCount})`
                                            : "AI is thinking..."}
                                    </Text>
                                </View>
                            )}

                            {/* Add some extra space at the bottom of the ScrollView */}
                            <View style={styles.bottomSpace} />
                        </ScrollView>

                        {/* Bottom Button - Fixed at bottom */}
                        <View style={styles.bottomButtonContainer}>
                            <TouchableOpacity
                                onPress={handleLetsStart}
                                style={styles.letsStartButton}
                            >
                                <View style={styles.letsStartButtonContent}>
                                    <Text style={styles.letsStartText}>Let's start</Text>
                                    <MaterialIcons name="arrow-forward" size={20} color="white" />
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Answer Input Modal */}
            <Modal
                animationType="slide"
                transparent
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {inputMode === "type" ? "Type your answer" : "Speak your answer"}
                        </Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder={
                                inputMode === "type"
                                    ? "Type your answer here..."
                                    : "Speak or type your answer..."
                            }
                            value={currentAnswer}
                            onChangeText={setCurrentAnswer}
                            multiline
                            textAlignVertical="top"
                        />

                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity
                                onPress={() => setIsModalVisible(false)}
                                style={styles.cancelButton}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={saveAnswer} style={styles.saveButton}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        justifyContent: "center",
        width: "100%",
        padding: 10,
        paddingBottom: 20,
    },
    container: {
        width: "100%",
        flex: 1,
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 12,
    },
    contentContainer: {
        flex: 1,
        paddingTop: 40,
    },
    titleInput: {
        fontFamily: "Albert Sans",
        fontSize: 36,
        paddingHorizontal: 16,
        marginBottom: 16,
        textAlign: "center",
        fontWeight: "normal",
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
        marginBottom: 16,
        maxHeight: "72%",
    },
    scrollViewContent: {
        flexGrow: 1,
    },
    messageContainer: {
        marginBottom: 40,
    },
    questionContainer: {
        backgroundColor: "#66621C",
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        borderBottomLeftRadius: 1,
        borderBottomRightRadius: 12,
        padding: 15,
        alignSelf: "flex-start",
        maxWidth: "80%",
    },
    questionText: {
        fontFamily: "Albert Sans",
        fontSize: 18,
        color: "#FEF4F6",
    },
    answerWrapper: {
        marginLeft: 20,
        marginTop: 20,
    },
    answerContainer: {
        backgroundColor: "#FFFEDD",
        borderRadius: 12,
        borderBottomRightRadius: 1,
        padding: 20,
        paddingTop: 40,
        paddingBottom: 40,
        alignSelf: "flex-start",
        width: "100%",
    },
    answerText: {
        fontFamily: "Albert Sans",
        fontSize: 18,
        color: "black",
        textAlign: "center",
    },
    answerAgainContainer: {
        alignItems: "flex-end",
        marginTop: 8,
    },
    answerAgainButton: {
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 9999,
        paddingHorizontal: 16,
        paddingVertical: 8,
        flexDirection: "row",
        alignItems: "center",
    },
    answerAgainText: {
        fontFamily: "Albert Sans",
        fontSize: 22,
        marginRight: 8,
    },
    actionButtonsContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 8,
        gap: 16,
    },
    typeButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
        backgroundColor: "#FEA3664D",
    },
    speakButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: "black",
    },
    eraseButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
        backgroundColor: "#FEA3664D",
    },
    nextButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: "black",
    },
    actionButtonText: {
        fontFamily: "Albert Sans",
        fontSize: 22,
        marginRight: 8,
    },
    loadingContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 16,
    },
    loadingText: {
        marginTop: 8,
        fontFamily: "Albert Sans",
        fontSize: 16,
        color: "#66621C",
    },
    bottomSpace: {
        height: 80,
    },
    bottomButtonContainer: {
        paddingBottom: 16,
        alignItems: "center",
    },
    letsStartButton: {
        backgroundColor: "#333333",
        borderRadius: 9999,
        paddingHorizontal: 48,
        paddingVertical: 16,
        width: "60%",
    },
    letsStartButtonContent: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    letsStartText: {
        color: "white",
        fontFamily: "Albert Sans",
        fontSize: 18,
        marginRight: 8,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContainer: {
        backgroundColor: "white",
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
    },
    modalInput: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        minHeight: 100,
    },
    modalButtonsContainer: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
    cancelButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#D1D5DB",
    },
    cancelButtonText: {
        color: "black",
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: "#FEA366",
    },
    saveButtonText: {
        color: "white",
    },
});
