/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Ionicons, FontAwesome5, Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            {/* Header */}
            <LinearGradient colors={["#FEC7AD", "#C2D1E5"]} style={styles.gradient} />
            <Image
                source={require("../../../assets/images/NewUI/Background1.png")}
                style={styles.image}
                resizeMode="cover"
                onError={(error) => console.log("ImageBackground error:", error.nativeEvent.error)}
            />
            <View style={styles.containerWrapper}>
                <View style={styles.header}>
                    <Image source={require("../../../assets/images/NewUI/newlogo.png")} style={styles.logoIcon} />
                    <View style={styles.searchBar}>
                        <Text style={styles.searchText}>search for author, key word...</Text>
                        <Ionicons name="search" size={18} color="#888" style={{ marginLeft: 15 }} />
                    </View>
                    <Ionicons name="chatbubble-outline" size={24} color="#000" />
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>HJ</Text>
                    </View>
                </View>

                <View style={styles.centerContainer}>
                    <View style={styles.grid}>
                        <MenuButton
                            title="My stories"
                            icon={<FontAwesome5 name="book" size={24} color="#333" />}
                            backgroundColor="#D6E1F0"
                            navigateTo="/(tabs)/mystories"
                        />
                        <MenuButton
                            title="Stories from Friends and Family"
                            icon={<Ionicons name="people-outline" size={24} color="#fff" />}
                            backgroundColor="#2C3E50"
                            textColor="#fff"
                            navigateTo="/(tabs)/friend-stories"
                        />
                        <MenuButton
                            title="Profile"
                            icon={<Feather name="bookmark" size={24} color="#333" />}
                            backgroundColor="#F5A27A"
                            navigateTo="/(tabs)/setting"
                        />
                        <MenuButton
                            title="Start a story"
                            icon={<Feather name="edit-3" size={24} color="#333" />}
                            backgroundColor="#E8DFF5"
                            navigateTo="/(tabs)/create_story"
                        />
                    </View>
                </View>
            </View>
        </View>
    );
};

const MenuButton = ({
    title,
    icon,
    backgroundColor,
    textColor = "#333",
    navigateTo,
}: {
    title: string;
    icon: React.ReactNode;
    backgroundColor: string;
    textColor?: string;
    navigateTo: string;
}) => {
    const navigation = useRouter();

    return (
        <TouchableOpacity
            style={[styles.menuButton, { backgroundColor }]}
            onPress={() => navigation.push(navigateTo)}
        >
            {icon}
            <Text style={[styles.menuText, { color: textColor }]}>{title}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FCE7DE",
    },
    logoIcon: {
        width: 50,
        height: 50,
        marginRight: 10,
    },
    containerWrapper: {
        flex: 1,
        alignItems: "center",
        zIndex: 2,
        paddingTop: 35,
    },
    gradient: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 0,
    },
    image: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 1,
        opacity: 0.9, // tuỳ chỉnh độ đậm nhạt
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
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
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 30,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },
    menuButton: {
        width: "44%",
        height: 140,
        borderRadius: 16,
        padding: 12,
        justifyContent: "center",
        alignItems: "center",
        elevation: 2,
    },
    menuText: {
        marginTop: 10,
        textAlign: "center",
        fontSize: 20,
        fontFamily: "Inika",
        fontWeight: "600",
    },
});

