import { Ionicons, MaterialIcons } from "@expo/vector-icons"
import axios from "axios"
import { LinearGradient } from "expo-linear-gradient"
import { getAuth } from "firebase/auth"
import { useState, useRef, useEffect } from "react"
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
    Alert,
    Image,
} from "react-native"

import { CreateNewStories_WITHBOT } from "@/firebase/utils/db-new"
import { OPENAI_API_KEY } from "@/config/env"
import { SafeAreaView } from "react-native-safe-area-context"

type Message = {
    _id: string
    text: string
    createdAt: Date
    user: {
        _id: string
        name: string
    }
    id?: number
    type?: "question" | "answer"
    answered?: boolean
    speaker?: string
}

const predefinedQuestions = [
    "What is this story about?",
    "Who are the people in this story?",
    "When did this story take place?",
    "Where did this story happen?",
    "Where did this story happen?",
]

export default function ChatAIScreen() {
    const auth = getAuth()
    const userId = auth.currentUser?.uid
    let err: any // Declare err variable

    const [messages, setMessages] = useState<Message[]>([
        {
            _id: "1",
            text: predefinedQuestions[0],
            createdAt: new Date(),
            user: {
                _id: "bot",
                name: "AI",
            },
            id: 1,
            type: "question",
            answered: true,
            speaker: "bot",
        },
        {
            _id: "2",
            text: "",
            createdAt: new Date(),
            user: {
                _id: userId || "user",
                name: "User",
            },
            id: 2,
            type: "answer",
            answered: false,
            speaker: "user",
        },
    ])

    const [title, setTitle] = useState("New Story Title")
    const [currentAnswer, setCurrentAnswer] = useState("")
    const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [inputMode, setInputMode] = useState<"type" | "speak">("type")
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [isAIMode, setIsAIMode] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [retryCount, setRetryCount] = useState(0)
    const [isSaving, setIsSaving] = useState(false)
    const scrollViewRef = useRef<ScrollView>(null)

    // Debug API key
    useEffect(() => {
        console.log("=== API KEY DEBUG ===")
        console.log("API Key exists:", !!OPENAI_API_KEY)
        console.log("API Key length:", OPENAI_API_KEY?.length || 0)
        console.log("API Key preview:", OPENAI_API_KEY?.substring(0, 20) + "...")

        if (!OPENAI_API_KEY) {
            Alert.alert("Configuration Error", "OpenAI API key not found. Please check your .env file.")
        }
    }, [])

    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true })
        }, 100)
    }, [messages.length])

    const handleAnswer = (messageId: string, mode: "type" | "speak" = "type") => {
        setEditingMessageId(messageId)
        setInputMode(mode)

        if (mode === "type") {
            setIsModalVisible(true)
            const message = messages.find((m) => m._id === messageId)
            if (message) {
                setCurrentAnswer(message.text)
            }
        } else {
            console.log("Speech input mode activated")
            setIsModalVisible(true)
        }
    }

    const fetchAIQuestion = async (attemptCount = 0) => {
        // Kiểm tra API key trước khi gọi API
        if (!OPENAI_API_KEY) {
            Alert.alert("Error", "OpenAI API key not configured")
            return
        }

        setIsLoading(true)
        setRetryCount(attemptCount)

        try {
            const answeredMessages = messages.filter((m) => m.answered && m.text.trim() !== "")
            const formattedMessages = answeredMessages.map((m) => ({
                role: m.user._id === "bot" ? "assistant" : "user",
                content: m.text,
            }))

            const limitedMessages = formattedMessages.slice(-5)

            const systemMessage = {
                role: "system",
                content: `You are an AI assistant helping users tell stories. 
                The user has answered basic questions about their story. 
                Your task is to ask follow-up questions to help them develop their story with more details.
                Ask short, specific, and easy-to-understand questions.
                Only ask one question at a time.
                Base your questions on their previous answers.
                Don't repeat questions that have already been asked.`,
            }

            console.log("Making API call with key:", OPENAI_API_KEY.substring(0, 20) + "...")

            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-3.5-turbo",
                    messages: [systemMessage, ...limitedMessages],
                    max_tokens: 50,
                    temperature: 0.7,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${OPENAI_API_KEY}`,
                    },
                    timeout: 10000,
                },
            )

            const aiQuestion = response.data.choices[0].message.content
            const questionId = (messages.length + 1).toString()
            const answerId = (messages.length + 2).toString()

            const newQuestion: Message = {
                _id: questionId,
                text: aiQuestion,
                createdAt: new Date(),
                user: {
                    _id: "bot",
                    name: "AI",
                },
                id: messages.length + 1,
                type: "question",
                answered: true,
                speaker: "bot",
            }

            const newAnswer: Message = {
                _id: answerId,
                text: "",
                createdAt: new Date(),
                user: {
                    _id: userId || "user",
                    name: "User",
                },
                id: messages.length + 2,
                type: "answer",
                answered: false,
                speaker: "user",
            }

            setMessages((prev) => [...prev, newQuestion, newAnswer])
            setRetryCount(0)
        } catch (error: any) {
            err = error // Assign error to err variable
            console.error("Error calling OpenAI API:", err)

            // Log chi tiết lỗi
            if (err.response) {
                console.log("Error status:", err.response.status)
                console.log("Error data:", err.response.data)
            }

            if (axios.isAxiosError(err) && err.response?.status === 429 && attemptCount < 5) {
                const delay = Math.pow(2, attemptCount) * 1000
                console.log(`Rate limited. Retrying in ${delay / 1000} seconds... (Attempt ${attemptCount + 1})`)

                setTimeout(() => {
                    fetchAIQuestion(attemptCount + 1)
                }, delay)
                return
            }

            if (attemptCount >= 5) {
                const errorId = (messages.length + 1).toString()
                const errorMessage: Message = {
                    _id: errorId,
                    text: "I'm having trouble connecting. Please try again later.",
                    createdAt: new Date(),
                    user: {
                        _id: "bot",
                        name: "AI",
                    },
                    id: messages.length + 1,
                    type: "question",
                    answered: true,
                    speaker: "bot",
                }
                setMessages((prev) => [...prev, errorMessage])
            }
        } finally {
            if (retryCount >= 5 || !axios.isAxiosError(err) || err?.response?.status !== 429) {
                setIsLoading(false)
            }
        }
    }

    const saveAnswer = async () => {
        if (currentAnswer.trim() && editingMessageId) {
            setMessages((prev) =>
                prev.map((msg) => (msg._id === editingMessageId ? { ...msg, text: currentAnswer, answered: true } : msg)),
            )

            setIsModalVisible(false)
            setCurrentAnswer("")
            setEditingMessageId(null)

            if (!isAIMode) {
                const nextQuestionIndex = currentQuestionIndex + 1
                if (nextQuestionIndex < predefinedQuestions.length) {
                    setTimeout(() => {
                        const questionId = (messages.length + 1).toString()
                        const answerId = (messages.length + 2).toString()

                        const newQuestion: Message = {
                            _id: questionId,
                            text: predefinedQuestions[nextQuestionIndex],
                            createdAt: new Date(),
                            user: {
                                _id: "bot",
                                name: "AI",
                            },
                            id: messages.length + 1,
                            type: "question",
                            answered: true,
                            speaker: "bot",
                        }

                        const newAnswer: Message = {
                            _id: answerId,
                            text: "",
                            createdAt: new Date(),
                            user: {
                                _id: userId || "user",
                                name: "User",
                            },
                            id: messages.length + 2,
                            type: "answer",
                            answered: false,
                            speaker: "user",
                        }

                        setMessages((prev) => [...prev, newQuestion, newAnswer])
                        setCurrentQuestionIndex(nextQuestionIndex)
                    }, 500)
                } else {
                    setIsAIMode(true)
                    setTimeout(() => {
                        fetchAIQuestion()
                    }, 1000)
                }
            } else {
                setTimeout(() => {
                    fetchAIQuestion()
                }, 1000)
            }
        }
    }

    const handleAnswerAgain = (messageId: string) => {
        handleAnswer(messageId)
    }

    const handleLetsStart = async () => {
        if (!userId) {
            Alert.alert("Error", "Please login first")
            return
        }

        setIsSaving(true)
        try {
            const result = await CreateNewStories_WITHBOT(messages, userId, title)
            console.log("Story created successfully:", result)
            Alert.alert(
                "Success",
                `Story created successfully!\nConversation ID: ${result.conversationId}\nMessages saved: ${result.messageCount}`,
                [
                    {
                        text: "OK",
                        onPress: () => {
                            // navigation.push("/choose-share-route");
                        },
                    },
                ],
            )
        } catch (error) {
            console.error("Error creating story:", error)
            Alert.alert("Error", "Failed to create story. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    const handleSkip = (messageId: string) => {
        setMessages((prev) =>
            prev.map((msg) => (msg._id === messageId ? { ...msg, text: "Skipped", answered: true } : msg)),
        )

        if (!isAIMode) {
            const nextQuestionIndex = currentQuestionIndex + 1
            if (nextQuestionIndex < predefinedQuestions.length) {
                setTimeout(() => {
                    const questionId = (messages.length + 1).toString()
                    const answerId = (messages.length + 2).toString()

                    const newQuestion: Message = {
                        _id: questionId,
                        text: predefinedQuestions[nextQuestionIndex],
                        createdAt: new Date(),
                        user: {
                            _id: "bot",
                            name: "AI",
                        },
                        id: messages.length + 1,
                        type: "question",
                        answered: true,
                        speaker: "bot",
                    }

                    const newAnswer: Message = {
                        _id: answerId,
                        text: "",
                        createdAt: new Date(),
                        user: {
                            _id: userId || "user",
                            name: "User",
                        },
                        id: messages.length + 2,
                        type: "answer",
                        answered: false,
                        speaker: "user",
                    }

                    setMessages((prev) => [...prev, newQuestion, newAnswer])
                    setCurrentQuestionIndex(nextQuestionIndex)
                }, 500)
            } else {
                setIsAIMode(true)
                setTimeout(() => {
                    fetchAIQuestion()
                }, 1000)
            }
        } else {
            setTimeout(() => {
                fetchAIQuestion()
            }, 1000)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Friend list and All option */}
            <LinearGradient colors={["#FEC7AD", "#C2D1E5"]} style={styles.bggradient} />
            <Image
                source={require("../../../assets/images/NewUI/Background1.png")}
                style={styles.bgimage}
                resizeMode="cover"
                onError={(error) => console.log("ImageBackground error:", error.nativeEvent.error)}
            />
            {/* Header Section */}
            <View style={styles.header}>
                <Image source={require("../../../assets/images/NewUI/newlogo.png")} style={styles.logoIcon} resizeMode="cover" />
                <View style={styles.searchBar}>
                    <Text style={styles.searchText}>search for author, key word...</Text>
                    <Ionicons name="search" size={18} color="#888" style={{ marginLeft: 15 }} />
                </View>
                <Ionicons name="chatbubble-outline" size={24} color="#000" />
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>HJ</Text>
                </View>
            </View>

            {/* Content Container */}
            <View style={styles.contentContainer}>
                <TextInput style={styles.titleInput} onChangeText={setTitle} value={title} />

                <ScrollView ref={scrollViewRef} style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
                    {messages.map((message, index) => {
                        if (message.type !== "question") return null

                        const answer = messages[index + 1]

                        return (
                            <View key={message._id} style={styles.messageContainer}>
                                {/* Question with bot avatar */}
                                <View style={styles.questionRow}>
                                    <View style={styles.botAvatar}>
                                        <Image source={require("../../../assets/images/NewUI/Group.png")} style={styles.logoIconMini} />

                                    </View>
                                    <View style={styles.questionContainer}>
                                        <Text style={styles.questionText}>
                                            {message.text}
                                        </Text>
                                    </View>
                                </View>

                                {/* Action buttons */}
                                {answer && !answer.answered && (
                                    <View style={styles.actionButtonsRow}>
                                        <TouchableOpacity
                                            style={styles.typeOutButton}
                                            onPress={() => handleAnswer(answer._id, "type")}
                                        >
                                            <MaterialIcons name="edit" size={16} color="#999" />
                                            <Text style={styles.actionButtonText}>Type out answer</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.narrateButton}
                                            onPress={() => handleAnswer(answer._id, "speak")}
                                        >
                                            <MaterialIcons name="mic" size={16} color="#999" />
                                            <Text style={styles.actionButtonText}>Narrate answer</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.speakerButton}>
                                            <MaterialIcons name="volume-up" size={16} color="#999" />
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Answer with user avatar */}
                                {answer && (
                                    <View style={styles.answerRow}>
                                        <TouchableOpacity
                                            onPress={() => handleAnswer(answer._id)}
                                            style={styles.answerContainer}
                                        >
                                            <Text style={styles.answerText}>
                                                {answer.answered ? answer.text : ""}
                                            </Text>
                                        </TouchableOpacity>
                                        <View style={styles.userAvatar}>
                                            <Text style={styles.userAvatarText}>HJ</Text>
                                        </View>
                                    </View>
                                )}

                                {/* Action buttons for answered */}
                                {answer && answer.answered && (
                                    <View style={styles.actionButtonsRow}>
                                        <TouchableOpacity
                                            style={styles.typeOutButton}
                                            onPress={() => handleAnswer(answer._id, "type")}
                                        >
                                            <MaterialIcons name="edit" size={16} color="#999" />
                                            <Text style={styles.actionButtonText}>Type out answer</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.narrateButton}
                                            onPress={() => handleAnswerAgain(answer._id)}
                                        >
                                            <MaterialIcons name="mic" size={16} color="#999" />
                                            <Text style={styles.actionButtonText}>Narrate answer</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.speakerButton}>
                                            <MaterialIcons name="volume-up" size={16} color="#999" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        )
                    })}

                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#66621C" />
                            <Text style={styles.loadingText}>
                                {retryCount > 0 ? `Retrying... (Attempt ${retryCount})` : "AI is thinking..."}
                            </Text>
                        </View>
                    )}

                    <View style={styles.bottomSpace} />
                </ScrollView>

                <View style={styles.bottomButtonContainer}>
                    <TouchableOpacity
                        onPress={handleLetsStart}
                        style={[styles.letsStartButton, isSaving && styles.disabledButton]}
                        disabled={isSaving}
                    >
                        <View style={styles.letsStartButtonContent}>
                            {isSaving ? (
                                <>
                                    <ActivityIndicator size="small" color="white" />
                                    <Text style={styles.letsStartText}>Saving...</Text>
                                </>
                            ) : (
                                <>
                                    <Text style={styles.letsStartText}>Let&apos;s start</Text>
                                    <MaterialIcons name="arrow-forward" size={20} color="white" />
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <Modal animationType="slide" transparent visible={isModalVisible} onRequestClose={() => setIsModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{inputMode === "type" ? "Type your answer" : "Speak your answer"}</Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder={inputMode === "type" ? "Type your answer here..." : "Speak or type your answer..."}
                            value={currentAnswer}
                            onChangeText={setCurrentAnswer}
                            multiline
                            textAlignVertical="top"
                        />

                        <View style={styles.modalButtonsContainer}>
                            <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.cancelButton}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={saveAnswer} style={styles.saveButton}>
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 12,
    },
    bggradient: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    bgimage: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
        opacity: 0.9,
    },
    contentContainer: {
        flex: 1,
        zIndex: 2,
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
        marginBottom: 32,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
        zIndex: 2,
    },
    logoIcon: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    logoIconMini: {
        width: 30,
        height: 30,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    searchBar: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginRight: 20,
    },
    searchText: {
        marginLeft: 6,
        color: "#888",
        fontSize: 14,
    },
    avatar: {
        width: 30,
        height: 30,
        backgroundColor: "#C2644F",
        borderRadius: 15,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
        marginLeft: 20,
    },
    avatarText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    iconButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconText: {
        fontFamily: "Albert Sans",
        fontSize: 14,
        fontWeight: 'bold',
        color: 'black',
    },
    questionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    botAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E8E8E8',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    botAvatarText: {
        fontSize: 20,
    },
    questionContainer: {
        backgroundColor: '#E8F4FD',
        borderRadius: 10,
        padding: 16,
        width: "82%",
    },
    questionText: {
        fontFamily: "Albert Sans",
        fontSize: 16,
        color: "#333",
        lineHeight: 22,
        width: "100%",
    },
    actionButtonsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingLeft: 52,
        gap: 16,
    },
    typeOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    narrateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    speakerButton: {
        padding: 4,
    },
    actionButtonText: {
        fontFamily: "Albert Sans",
        fontSize: 14,
        color: "#999",
    },
    answerRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        gap: 12,
        marginBottom: 12,
    },
    answerContainer: {
        backgroundColor: "#F0F8FF",
        borderRadius: 10,
        // borderBottomRightRadius: 8,
        padding: 16,
        minHeight: 60,
        width: "85%",
        justifyContent: 'center',
    },
    answerText: {
        fontFamily: "Albert Sans",
        fontSize: 16,
        color: "#333",
        lineHeight: 22,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#D2691E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    userAvatarText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
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
    disabledButton: {
        backgroundColor: "#666666",
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
        zIndex: 2,
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
})