// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyA5ySYmw4m6tLdQtZ2Vp3baRWDdoXwkceQ",
    authDomain: "dreamrocket-login.firebaseapp.com",
    databaseURL: "https://dreamrocket-login-default-rtdb.firebaseio.com",
    projectId: "dreamrocket-login",
    storageBucket: "dreamrocket-login.firebasestorage.app",
    messagingSenderId: "938173998872",
    appId: "1:938173998872:web:b8e22b6ea657cb9285206d"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Exportar as instâncias
const auth = firebase.auth();
const database = firebase.database();