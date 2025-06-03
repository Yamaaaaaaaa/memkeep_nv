/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    Text,
    View,
    ScrollView,
    Image,
    TouchableOpacity,
    StatusBar,
    StyleSheet,
} from "react-native";

import { getStoriesByUser } from "@/firebase/utils/db-new";
import TabCard from "@/components/TabCard";

// type StoryPropType = {
//     time: string;
//     location: string;
//     imgFilepath: string;
//     description: string;
//     owner: string;
//     title: string;
// };

// type ConversationType = {
//     conversation_start_date: string;
//     conversation_end_date: string;
//     participants: Array<string>[];
//     messages: Array<MessageType>[];
// }

type StoryType = {
    title: string;
    owner: string;
    related_users: string[][];
    conversation_id: string;
    processing: number;
    story_generated_date: string;
    story_recited_date: string;
};
// type MessageType = {
//     message_time: string;
//     speaker: string;
//     speech: string;
// }
// y5IDLqAakZVHf3xFEd22HlrScTD3
// a9UJZjfiYxc6SSWjmJMr1hbyhjF2
// UpotqdlxPDXORUXUoa92j21YZbQ2
// q0qStdp2nCZlChexZQLuRkYJBpa2

// HjnP6LoDoRVrgPgWrpXT
// hME9mBRRQq8ZmMUjuxMh
export default function MyStories() {
    const navigation = useRouter();
    const [stories, setStories] = useState<StoryType[]>([]);

    useEffect(() => {
        const fetchStories = async () => {
            const storiess = await getStoriesByUser();
            console.log("Stories of User: ", storiess);
            setStories(storiess);
        };

        fetchStories().catch((error) => {
            console.error("Error fetching stories:", error);
        });
    }, []);

    return (
        <>
            {/* 430 x 932, pt: 246px */}
            <LinearGradient colors={["#FFDCD1", "#ECEBD0"]} style={styles.gradient}>
                {/* Viền ngoài */}
                <View style={styles.container}>
                    <View style={styles.contentContainer}>
                        <View style={styles.headerContainer}>
                            <Text style={styles.authorName}>Be author&apos;s name</Text>
                            <Text style={styles.storiesTitle}>Stories</Text>
                        </View>
                        {/* h:391 : Add:  contentContainerStyle={{ flexGrow: 1 }} to set fix height*/}
                        <View style={styles.scrollViewContainer}>
                            <ScrollView>
                                <View style={styles.storiesGrid}>
                                    {stories.map((story, index) => (
                                        <TabCard
                                            key={index}
                                            title={story.title}
                                            navigateTo={`/chatdetail/${story.conversation_id}`}
                                            processing={story.processing}
                                            conversationId={story.conversation_id}
                                        />
                                    ))}
                                </View>
                            </ScrollView>
                        </View>
                        <TouchableOpacity
                            onPress={() => navigation.push("/setting")}
                            style={styles.newStoriesButton}
                        >
                            <Text style={styles.newStoriesText}>New stories</Text>
                            <Image
                                source={require("../../../assets/images/NewUI/icon new stories.png")}
                                style={styles.newStoriesIcon}
                            />
                        </TouchableOpacity>
                    </View>
                </View>
            </LinearGradient>
        </>
    );
};

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
        paddingHorizontal: "9%",
    },
    contentContainer: {
        flex: 1,
        justifyContent: "center",
    },
    headerContainer: {
        marginBottom: "6.3%",
    },
    authorName: {
        fontFamily: "judson",
        fontSize: 24,
        color: "#000000",
        alignSelf: "center",
        marginBottom: "30%",
    },
    storiesTitle: {
        fontFamily: "alberts",
        fontSize: 28,
        alignSelf: "center",
    },
    scrollViewContainer: {
        height: 370,
    },
    storiesGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    newStoriesButton: {
        width: "60%",
        height: "10%",
        alignSelf: "center",
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        marginTop: "18%",
    },
    newStoriesText: {
        fontFamily: "alberts",
        fontSize: 22,
        marginBottom: 5,
    },
    newStoriesIcon: {
        width: 24,
        height: 24,
        borderRadius: 12,
        marginBottom: "3.3%",
    },
});

