"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native"
import { useEffect, useState } from "react"
import { SafeAreaView } from "react-native-safe-area-context"
import { auth, db } from "../../../firebase/firebase-config"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useNavigation } from "@react-navigation/native"
import { useRouter } from "expo-router"

interface User {
    uid: string
    username: string
    profilePicture?: string
}

interface Story {
    id: string
    owner: string
    thumbnail_url: string
    title?: string
    description?: string
    story_generated_date?: any
    isPrivate?: boolean
    conversation_id?: string
}

export default function MyStoriesScreen() {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [stories, setStories] = useState<Story[]>([])

    const navigation = useRouter()

    const handleChatNavigation = () => {
        navigation.navigate("ChatDetail" as never)
        // Or if you have a chat list screen: navigation.navigate('ChatList' as never)
    }

    const handleStoryPress = (story: Story) => {
        navigation.navigate(`/chatdetail/${story.conversation_id}` as never)
    }

    useEffect(() => {
        const fetchCurrentUser = async () => {
            const user = auth.currentUser
            if (user) {
                const userRef = doc(db, "users", user.uid)
                const userSnap = await getDoc(userRef)
                if (userSnap.exists()) {
                    setCurrentUser({ uid: user.uid, ...userSnap.data() } as User)
                }
            }
        }

        fetchCurrentUser()
    }, [])

    useEffect(() => {
        const fetchMyStories = async () => {
            if (currentUser) {
                const storiesQuery = query(collection(db, "stories"), where("owner", "==", currentUser.uid))
                const storyDocs = await getDocs(storiesQuery)
                const storiesList: Story[] = []

                storyDocs.forEach((doc) => {
                    const storyData = doc.data() as Story
                    const { id, ...restOfStoryData } = storyData
                    storiesList.push({ id: doc.id, ...restOfStoryData })
                })

                // Sort stories by date (newest first)
                storiesList.sort((a, b) => {
                    if (a.story_generated_date && b.story_generated_date) {
                        return b.story_generated_date.toDate() - a.story_generated_date.toDate()
                    }
                    return 0
                })

                setStories(storiesList)
            }
        }

        fetchMyStories()
    }, [currentUser])

    const handleCreateNewStory = () => {
        // Navigate to create story screen
        console.log("Navigate to create new story")
    }

    const handleTogglePrivacy = (storyId: string) => {
        // Toggle story privacy
        console.log("Toggle privacy for story:", storyId)
    }

    const handleShareStory = (storyId: string) => {
        // Share story
        console.log("Share story:", storyId)
    }

    return (
        <SafeAreaView style={styles.container}>
            <LinearGradient colors={["#FEC7AD", "#C2D1E5"]} style={styles.bggradient} />
            <Image
                source={require("../../../assets/images/NewUI/Background1.png")}
                style={styles.bgimage}
                resizeMode="cover"
                onError={(error) => console.log("ImageBackground error:", error.nativeEvent.error)}
            />

            {/* Header */}
            <View style={styles.header}>
                <Image source={require("../../../assets/images/NewUI/newlogo.png")} style={styles.logoIcon} />
                <View style={styles.searchBar}>
                    <Text style={styles.searchText}>search for author, key word...</Text>
                    <Ionicons name="search" size={18} color="#888" style={{ marginLeft: 15 }} />
                </View>
                <TouchableOpacity onPress={handleChatNavigation}>
                    <Ionicons name="chatbubble-outline" size={24} color="#000" />
                </TouchableOpacity>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>HJ</Text>
                </View>
            </View>

            {/* Page Title */}
            <View style={styles.titleSection}>
                <Text style={styles.pageTitle}>My stories</Text>
                <View style={styles.titleUnderline} />
            </View>

            {/* New Stories Section */}
            <TouchableOpacity style={styles.newStoriesSection} onPress={handleCreateNewStory}>
                <View style={styles.newStoriesContent}>
                    <View style={styles.starIcon}>
                        <Ionicons name="star" size={20} color="#FFD700" />
                    </View>
                    <Text style={styles.newStoriesText}>New stories</Text>
                </View>
                <View style={styles.newStoriesHint}>
                    <Text style={styles.hintText}>drag new</Text>
                    <Text style={styles.hintText}>stories into</Text>
                    <Text style={styles.hintText}>the right area</Text>
                    <Text style={styles.hintText}>to unlock</Text>
                    <View style={styles.hintIcon}>
                        <Text style={styles.hintIconText}>!</Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Stories List */}
            <ScrollView style={styles.storiesList} showsVerticalScrollIndicator={false}>
                {stories.map((story) => (
                    <TouchableOpacity
                        key={story.id}
                        style={styles.storyItem}
                        onPress={() => handleStoryPress(story)}
                        activeOpacity={0.8}
                    >
                        <Image source={{ uri: story.thumbnail_url }} style={styles.storyThumbnail} />
                        <View style={styles.storyContent}>
                            <Text style={styles.storyTitle}>{story.title || "Untitled"}</Text>
                            {story.description && (
                                <Text style={styles.storyDescription} numberOfLines={3}>
                                    {story.description}
                                </Text>
                            )}

                            {/* Action Buttons */}
                            <View style={styles.actionButtons}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.privateButton]}
                                    onPress={(e) => {
                                        e.stopPropagation()
                                        handleTogglePrivacy(story.id)
                                    }}
                                >
                                    <Text style={styles.privateButtonText}>{story.isPrivate ? "Private" : "Public"}</Text>
                                    <Ionicons
                                        name={story.isPrivate ? "lock-closed" : "globe-outline"}
                                        size={12}
                                        color="#666"
                                        style={styles.buttonIcon}
                                    />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.actionButton, styles.shareButton]}
                                    onPress={(e) => {
                                        e.stopPropagation()
                                        handleShareStory(story.id)
                                    }}
                                >
                                    <Text style={styles.shareButtonText}>Share</Text>
                                    <Ionicons name="share-outline" size={12} color="#007AFF" style={styles.buttonIcon} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}

                {/* Empty state */}
                {stories.length === 0 && (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>No stories yet</Text>
                        <Text style={styles.emptyStateSubtext}>Create your first story to get started!</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fcf0e8",
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
        marginBottom: 20,
        paddingHorizontal: 20,
        zIndex: 2,
    },
    logoIcon: {
        width: 50,
        height: 50,
        marginRight: 10,
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
    titleSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
        zIndex: 2,
    },
    pageTitle: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 8,
    },
    titleUnderline: {
        height: 2,
        backgroundColor: "#333",
        width: 120,
    },
    newStoriesSection: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginHorizontal: 20,
        marginBottom: 20,
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        borderRadius: 12,
        padding: 15,
        zIndex: 2,
    },
    newStoriesContent: {
        flexDirection: "row",
        alignItems: "center",
    },
    starIcon: {
        marginRight: 10,
    },
    newStoriesText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    newStoriesHint: {
        alignItems: "flex-end",
    },
    hintText: {
        fontSize: 10,
        color: "#666",
        lineHeight: 12,
    },
    hintIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#FF6B6B",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 2,
    },
    hintIconText: {
        color: "white",
        fontSize: 10,
        fontWeight: "bold",
    },
    storiesList: {
        paddingHorizontal: 20,
        zIndex: 2,
        flex: 1,
    },
    storyItem: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginBottom: 15,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    storyThumbnail: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: "#f0f0f0",
    },
    storyContent: {
        paddingHorizontal: 5,
    },
    storyTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 8,
        color: "#333",
    },
    storyDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 15,
    },
    actionButtons: {
        flexDirection: "row",
        justifyContent: "flex-start",
        gap: 10,
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1,
    },
    privateButton: {
        backgroundColor: "#f8f8f8",
        borderColor: "#ddd",
    },
    shareButton: {
        backgroundColor: "#f0f8ff",
        borderColor: "#007AFF",
    },
    privateButtonText: {
        fontSize: 12,
        color: "#666",
        marginRight: 4,
    },
    shareButtonText: {
        fontSize: 12,
        color: "#007AFF",
        marginRight: 4,
    },
    buttonIcon: {
        marginLeft: 2,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#666",
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: "#888",
        textAlign: "center",
    },
})
