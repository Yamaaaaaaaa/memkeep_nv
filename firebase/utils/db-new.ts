import { getAuth } from "firebase/auth";
import {
    addDoc,
    collection,
    getDocs,
    query,
    where,
    orderBy,
    doc,
    getDoc,
} from "firebase/firestore";

import { db } from "@/firebase/firebase-config";

export const getStoriesByUser = async () => {
    try {
        const auth = getAuth();
        const userId = auth.currentUser?.uid;
        console.log("User Logging:", userId);

        if (!userId) {
            throw new Error("User not authenticated");
        }

        const storiesRef = collection(db, "stories");
        const q = query(storiesRef, where("owner", "==", userId));
        const querySnapshot = await getDocs(q);

        const stories = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return stories;
    } catch (error) {
        console.error("Error getting stories by user: ", error);
        return [];
    }
};

type Friend = {
    id: string;
    name: string;
    avatar: string;
};

export const getFriendsByUserId = async (userId: string): Promise<Friend[]> => {
    try {
        const userDocRef = doc(db, "users", userId);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const friendUids = userData["friends"] || [];

            if (friendUids.length > 0) {
                const friendsCollection = collection(db, "users");
                const friendQuery = query(friendsCollection, where("uid", "in", friendUids));
                const friendDocsSnap = await getDocs(friendQuery);

                const friendsData = friendDocsSnap.docs.map((doc) => {
                    const data = doc.data();
                    return {
                        id: data["uid"],
                        name: data["username"] || "Unknown User",
                        avatar:
                            data["profilePicture"] ||
                            "https://randomuser.me/api/portraits/lego/1.jpg",
                    };
                });
                return friendsData;
            } else {
                return []; // No friends found
            }
        } else {
            console.log("User document not found.");
            return [];
        }
    } catch (error) {
        console.error("Error fetching friends:", error);
        return [];
    }
};
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

export const getMessagesByConversationId = async (conversationId: string): Promise<Message[]> => {
    try {
        const messagesRef = collection(db, "conversations", conversationId, "messages");
        const q = query(messagesRef, orderBy("message_time"));
        const querySnapshot = await getDocs(q);
        const messages = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                text: data["speech"],
                type: data["speaker"] === "bot" ? "question" : "answer",
                speaker: data["speaker"],
            };
        });
        // console.log("messages", messages);
        return messages as unknown as Message[];
    } catch (error) {
        console.error("Error getting messages by conversation ID: ", error);
        return [];
    }
};



export const CreateNewStories_WITHBOT = async (messages: Message[], userId: string, title: string) => {
  try {
    // console.log("Starting to create story with messages:", messages.length)

    // 1. Tạo conversation mới
    const conversationRef = await addDoc(collection(db, "conversations"), {
      conversation_start_date: new Date(),
      participants: [userId, "bot"],
    })

    // console.log("Created conversation:", conversationRef.id)

    // 2. Tạo subcollection "messages" trong conversation
    const messagesRef = collection(db, "conversations", conversationRef.id, "messages")

    // 3. Lọc và chuẩn bị messages để lưu
    const validMessages = messages.filter((msg) => {
      // Chỉ lưu messages có text và đã được answered
      return msg.text && msg.text.trim() !== "" && msg.answered
    })

    // console.log("Valid messages to save:", validMessages.length)

    // 4. Lưu từng message vào subcollection - sử dụng Promise.all
    const messagePromises = validMessages.map(async (msg, index) => {
      const messageData = {
        message_time: new Date().toISOString(),
        speaker: msg.speaker || (msg.user._id === "bot" ? "bot" : "user"),
        speech: msg.text,
      }

    //   console.log(`Saving message ${index + 1}:`, messageData)
      return await addDoc(messagesRef, messageData)
    })

    await Promise.all(messagePromises)
    console.log("All messages saved successfully")

    // 5. Tạo story và liên kết với conversation
    const storyData = {
      conversation_id: conversationRef.id,
      owner: userId,
      related_users: [userId, "bot"],
      processing: 0, // 0 = chưa xử lý, 100 = đã xong
      title: title || "Untitled Story",
      story_generated_date: "", // Sẽ được cập nhật sau khi AI tạo story
      story_recited_date: "", // Sẽ được cập nhật sau khi user nghe story
    }

    const storyRef = await addDoc(collection(db, "stories"), storyData)
    // console.log("Created story:", storyRef.id)

    // console.log("✅ Conversation, messages và stories đã được tạo thành công!")
    return {
      conversationId: conversationRef.id,
      storyId: storyRef.id,
      messageCount: validMessages.length,
    }
  } catch (error) {
    console.error("❌ Lỗi khi tạo stories:", error)
    throw error
  }
}