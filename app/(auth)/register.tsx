import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/firebase-config";

export default function RegisterScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailRegister = async () => {
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setModalVisible(false);
      setIsAuthenticated(true)
      Alert.alert("Success", "Account created successfully");
      router.replace("/home"); // Điều hướng sau khi đăng ký
    } catch (error: any) {
      console.error(error);
      Alert.alert("Register Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FEC7AD", "#C2D1E5"]} style={styles.gradient} />
      <Image
        source={require("../../assets/images/NewUI/Background1.png")}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.containerWrapper}>
        <Image source={require("../../assets/images/NewUI/newlogo.png")} style={styles.logoIcon} />
        <Text style={styles.title}>Create Your</Text>
        <Text style={styles.title}>Story Account</Text>
        <View style={styles.space} />
        <Text style={styles.subtitle}>Let the world know your story</Text>
        <View style={styles.space2} />
        <View style={styles.space3} />

        {/* Social Buttons */}
        {[
          {
            text: "Sign up with Google",
            icon: require("../../assets/images/NewUI/Googlelogo.png"),
          },
          {
            text: "Sign up with Facebook",
            icon: require("../../assets/images/NewUI/Vector.png"),
          },
          {
            text: "Sign up with Apple",
            icon: require("../../assets/images/NewUI/Vector(1).png"),
          },
        ].map(({ text, icon }, i) => (
          <TouchableOpacity
            key={i}
            style={styles.socialButton}
            onPress={() => Alert.alert("Coming Soon", `${text} will be available soon!`)}
          >
            <Image source={icon} style={styles.socialIcon} />
            <Text style={styles.buttonText}>{text}</Text>
          </TouchableOpacity>
        ))}

        {/* Email Sign-up */}
        <TouchableOpacity style={styles.socialButton} onPress={() => setModalVisible(true)}>
          <Image source={require("../../assets/images/NewUI/Vector(2).png")} style={styles.socialIcon} />
          <Text style={styles.buttonText}>Sign up with Email</Text>
        </TouchableOpacity>

        <Text style={styles.bottomText}>
          Already have an account?{" "}
          <Text style={styles.signUpLink} onPress={() => router.push("/login")}>
            Sign In
          </Text>
        </Text>
      </View>

      {/* Email Register Modal */}
      <Modal animationType="slide" transparent visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Email Sign Up</Text>
            <TextInput
              placeholder="Email"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              value={email}
            />
            <TextInput
              placeholder="Password"
              style={styles.input}
              secureTextEntry
              onChangeText={setPassword}
              value={password}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleEmailRegister} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalButtonText}>Register</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: "center",
  },
  containerWrapper: {
    flex: 1,
    alignItems: "center",
    zIndex: 2,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
    opacity: 0.9,
  },
  logoIcon: {},
  space: {
    marginBottom: 15,
  },
  space2: {
    marginBottom: 12,
  },
  space3: {
    marginBottom: 25,
  },
  title: {
    fontSize: 48,
    fontWeight: "bold",
    fontFamily: "Inika",
    color: "#333",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 20,
    color: "#555",
    fontFamily: "Montserrat",
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 22,
    padding: 12,
    marginVertical: 6,
    width: "100%",
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    resizeMode: "contain",
  },
  buttonText: {
    textAlign: "center",
    fontSize: 20,
    fontFamily: "Montserrat",
    width: "80%",
  },
  bottomText: {
    marginTop: 24,
    fontSize: 16,
    color: "#444",
  },
  signUpLink: {
    color: "#f24e1e",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 16,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  modalButton: {
    backgroundColor: "#f24e1e",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: 10,
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelText: {
    color: "#666",
    marginTop: 12,
  },
});
