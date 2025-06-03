/* eslint-disable no-var */
import { router } from "expo-router";
import React, { useState } from "react";
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { validateEmail, validateUsername } from "@/utils/regex";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebase-config";

type Props = {
    visible: boolean;
    onClose: () => void;
    mode?: 'signin' | 'signup';
};

const EmailAuthModal = ({ visible, onClose, mode = 'signin' }: Props) => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);


    const handleEmailAuth = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Email and password are required.");
            return;
        }
        const isValidEmail = validateEmail(email);
        const isValidUsername = validateUsername(email);

        if (!(isValidEmail || isValidUsername)) {
            Alert.alert("Error", "Please enter a valid email or username.");
            return;
        }

        setIsLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            if (userCredential.user) {
                Alert.alert("Success", "Welcome to Memory Keepers!");
                router.replace('/(tabs)/home');
            }
        } catch (error: any) {
            let errorMessage = "An unexpected error occurred. Please try again.";
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                errorMessage = "Invalid email or password.";
            } else if (error.code === 'auth/too-many-requests') {
                errorMessage = "Too many failed attempts. Please try again later.";
            }
            Alert.alert("Error", errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal animationType="slide" transparent visible={visible}>
            <View style={styles.overlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>{mode === 'signin' ? 'Sign In' : 'Sign Up'} with Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        onChangeText={setEmail}
                        value={email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!isLoading}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        onChangeText={setPassword}
                        value={password}
                        secureTextEntry
                        editable={!isLoading}
                    />
                    <TouchableOpacity
                        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                        onPress={handleEmailAuth}
                        disabled={isLoading}
                    >
                        <Text style={styles.submitButtonText}>
                            {isLoading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onClose} disabled={isLoading}>
                        <Text style={styles.closeText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default EmailAuthModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "#000000aa",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        width: "90%",
        backgroundColor: "white",
        borderRadius: 20,
        padding: 20,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    submitButton: {
        backgroundColor: "#000a11",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    submitButtonDisabled: {
        backgroundColor: "#666",
        opacity: 0.7,
    },
    submitButtonText: {
        color: "white",
        fontWeight: "bold",
    },
    closeText: {
        textAlign: "center",
        color: "#555",
        marginTop: 15,
    },
});
