/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-duplicates */
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import { useState, useRef, useEffect } from "react";
import React from "react";
import {
    View,
    Text,
    ScrollView,
    StatusBar,
    StyleSheet,
    ActivityIndicator,
    Image,
    TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getMessagesByConversationId } from "@/firebase/utils/db-new";

type Message = {
    id: string;
    text: string;
    type: "question" | "answer";
    speaker: string;
};

export default function ChatDetail() {
    const auth = getAuth();
    const currentUserId = auth.currentUser?.uid;
    const { id } = useLocalSearchParams();

    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (!id || typeof id !== "string") {
            console.error("Invalid conversationId received.");
            setIsLoading(false);
            return;
        }

        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                const fetchedMessages = await getMessagesByConversationId(id);
                setMessages(fetchedMessages as unknown as Message[]);
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchMessages();
    }, [id]);

    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages.length]);

    // const getMessageAlignment = (speaker: string) => {
    //     if (speaker === "bot") {
    //         return "flex-start";
    //     } else if (speaker === currentUserId) {
    //         return "flex-end";
    //     } else {
    //         return "flex-start";
    //     }
    // };

    const renderMessage = (message: Message, index: number) => {
        const isBot = message.speaker === "bot";
        const isUser = message.speaker === currentUserId;

        if (isBot) {
            return (
                <View key={message.id} style={styles.messageContainer}>
                    <View style={styles.questionRow}>
                        <View style={styles.botAvatar}>
                            <Image
                                source={require("../../assets/images/NewUI/Group.png")}
                                style={styles.logoIconMini}
                            />
                        </View>
                        <View style={styles.questionContainer}>
                            <Text style={styles.questionText}>
                                {message.text}
                            </Text>
                        </View>
                    </View>
                </View>
            );
        } else {
            return (
                <View key={message.id} style={styles.messageContainer}>
                    <View style={styles.answerRow}>
                        <View style={styles.answerContainer}>
                            <Text style={styles.answerText}>
                                {message.text}
                            </Text>
                        </View>
                        <View style={styles.userAvatar}>
                            <Text style={styles.userAvatarText}>
                                {auth.currentUser?.displayName?.charAt(0) || "U"}
                            </Text>
                        </View>
                    </View>
                </View>
            );
        }
    };
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

            {/* Background */}
            <LinearGradient colors={["#FEC7AD", "#C2D1E5"]} style={styles.bggradient} />
            <Image
                source={require("../../assets/images/NewUI/Background1.png")}
                style={styles.bgimage}
                resizeMode="cover"
                onError={(error) => console.log("ImageBackground error:", error.nativeEvent.error)}
            />

            {/* Header Section */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/mystories')}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Image
                    source={require("../../assets/images/NewUI/newlogo.png")}
                    style={styles.logoIcon}
                    resizeMode="cover"
                />
                <View style={styles.headerTitle}>
                    <Text style={styles.headerTitleText}>Story Details</Text>
                </View>
                <View style={styles.headerActions}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="share-outline" size={20} color="#000" />
                    </TouchableOpacity>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {auth.currentUser?.displayName?.charAt(0) || "U"}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Content Container */}
            <View style={styles.contentContainer}>
                <Text style={styles.storyTitle}>Story Conversation</Text>

                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollViewContent}
                    showsVerticalScrollIndicator={false}
                >
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#66621C" />
                            <Text style={styles.loadingText}>Loading messages...</Text>
                        </View>
                    ) : messages.length > 0 ? (
                        messages.map((message, index) => renderMessage(message, index))
                    ) : (
                        <View style={styles.noMessagesContainer}>
                            <Text style={styles.noMessagesText}>
                                No messages found for this story.
                            </Text>
                        </View>
                    )}

                    <View style={styles.bottomSpace} />
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        zIndex: 2,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    logoIcon: {
        width: 40,
        height: 40,
        marginRight: 12,
    },
    logoIconMini: {
        width: 30,
        height: 30,
    },
    headerTitle: {
        flex: 1,
    },
    headerTitleText: {
        fontFamily: "Albert Sans",
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    headerActions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    iconButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
        backgroundColor: "#C2644F",
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    contentContainer: {
        flex: 1,
        zIndex: 2,
    },
    storyTitle: {
        fontFamily: "Albert Sans",
        fontSize: 28,
        fontWeight: "600",
        paddingHorizontal: 16,
        marginBottom: 20,
        textAlign: "center",
        color: "#333",
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 16,
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    messageContainer: {
        marginBottom: 24,
    },
    questionRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
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
    questionContainer: {
        backgroundColor: '#E8F4FD',
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        padding: 16,
        maxWidth: "82%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    questionText: {
        fontFamily: "Albert Sans",
        fontSize: 16,
        color: "#333",
        lineHeight: 22,
    },
    answerRow: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        gap: 12,
    },
    answerContainer: {
        backgroundColor: "#F0F8FF",
        borderRadius: 16,
        borderBottomRightRadius: 4,
        padding: 16,
        maxWidth: "82%",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
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
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    loadingText: {
        marginTop: 12,
        fontFamily: "Albert Sans",
        fontSize: 16,
        color: "#66621C",
    },
    noMessagesContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 40,
    },
    noMessagesText: {
        fontFamily: "Albert Sans",
        fontSize: 16,
        textAlign: "center",
        color: "#666",
        lineHeight: 24,
    },
    bottomSpace: {
        height: 40,
    },
});