// js/firebase-config.js - Configuração Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Configuração do Firebase - ATUALIZE COM SEUS DADOS!
const firebaseConfig = {
    apiKey: "AIzaSyBHZwiOUBsdiJrvhmHNBSz6g5vHVp9vr4M",
    authDomain: "bellagi.firebaseapp.com",
    databaseURL: "https://bellagi-default-rtdb.firebaseio.com",
    projectId: "bellagi",
    storageBucket: "bellagi.firebasestorage.app",
    messagingSenderId: "527955034099",
    appId: "1:527955034099:web:85b48a5ab973b23e625c86"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);

export { app, database, auth };