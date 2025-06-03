import { getAuth } from "@firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCc3kdzQq8dOEC6yuulzC5ix46q13K_1rI",
  authDomain: "black-function-454609-h3.firebaseapp.com",
  projectId: "black-function-454609-h3",
  storageBucket: "black-function-454609-h3.appspot.com", // ✅ Sửa lỗi domain
  messagingSenderId: "446696233819",
  appId: "1:446696233819:web:2c0b64eb701c207c49187e",
  measurementId: "G-6VG89EERMH",
};

const app = initializeApp(firebaseConfig);

// 👇 Đây là cách khởi tạo auth đúng cho React Native
const auth = getAuth(app)
const db = getFirestore(app);
const functions = getFunctions(app);
const storage = getStorage(app);

export { auth, db, functions, storage };

