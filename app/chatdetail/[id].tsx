/* eslint-disable import/no-duplicates */
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { getAuth } from "firebase/auth";
import { useState, useRef, useEffect } from "react";
import React from "react";
import { View, Text, ScrollView, StatusBar, StyleSheet, ActivityIndicator } from "react-native";

import { getMessagesByConversationId } from "@/firebase/utils/db-new"; // Assuming a function to fetch messages by conversation ID

type Message = {
    id: string; // Assuming message IDs are strings
    text: string;
    type: "question" | "answer";
    speaker: string; // Can be 'user' or 'bot' or a user ID
};

export default function ChatDetail() {
    const auth = getAuth();
    const currentUserId = auth.currentUser?.uid;
    const { id } = useLocalSearchParams(); // Get conversationId from navigation parameters

    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollViewRef = useRef<ScrollView>(null);
    console.log("ConverID", id);

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
                setMessages(fetchedMessages);
            } catch (error) {
                console.error("Error fetching messages:", error);
            } finally {
                setIsLoading(false);
            }
        };

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fetchMessages();
    }, [id]); // Refetch messages if conversationId changes

    // Scroll to bottom when messages are loaded or updated
    useEffect(() => {
        setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
    }, [messages.length]);

    // Helper to determine message alignment based on speaker
    const getMessageAlignment = (speaker: string) => {
        // Assuming 'bot' is the AI and currentUserId is the logged-in user
        if (speaker === "bot") {
            return "flex-start";
        } else if (speaker === currentUserId) {
            return "flex-end";
        } else {
            // Handle other speakers if necessary
            return "flex-start"; // Default alignment
        }
    };

    return (
        <>
            <StatusBar translucent backgroundColor="#FFDCD1" barStyle="dark-content" />
            <LinearGradient colors={["#FFDCD1", "#ECEBD0"]} style={styles.gradient}>
                <View style={styles.container}>
                    <View style={styles.contentContainer}>
                        <Text style={styles.storyTitle}>Story Title Here</Text>
                        {/* Placeholder for story title */}
                        <ScrollView
                            ref={scrollViewRef}
                            style={styles.messagesContainer}
                            contentContainerStyle={styles.messagesContent}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="large" color="#0000ff" />
                            ) : messages.length > 0 ? (
                                messages.map((message) => (
                                    <View
                                        key={message.id}
                                        style={[
                                            styles.messageWrapper,
                                            {
                                                alignSelf: getMessageAlignment(message.speaker),
                                                backgroundColor:
                                                    message.speaker === "bot"
                                                        ? "#F0F0F0"
                                                        : "#E3F2FD",
                                            },
                                        ]}
                                    >
                                        <Text style={styles.messageText}>{message.text}</Text>
                                    </View>
                                ))
                            ) : (
                                <Text style={styles.noMessagesText}>
                                    No messages found for this story.
                                </Text>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </LinearGradient>
        </>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        justifyContent: "center",
        width: "100%",
        height: "100%",
        padding: 10,
        paddingBottom: 20,
    },
    container: {
        width: "100%",
        height: "100%",
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 12,
    },
    contentContainer: {
        flex: 1,
        paddingTop: 10,
    },
    storyTitle: {
        fontFamily: "alberts",
        fontSize: 24,
        paddingHorizontal: 16,
        marginBottom: 16,
        textAlign: "center",
    },
    messagesContainer: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
    },
    messageWrapper: {
        marginBottom: 16,
        padding: 12,
        borderRadius: 8,
        maxWidth: "80%",
    },
    messageText: {
        fontSize: 16,
    },
    noMessagesText: {
        fontSize: 16,
        textAlign: "center",
        marginTop: 20,
    },
}); 