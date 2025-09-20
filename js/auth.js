import { 
    signInWithEmailAndPassword, 
    sendPasswordResetEmail,
    signOut 
} from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { ref, get, query, orderByChild, equalTo } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-database.js";
import { auth, database } from "./firebase-config.js";

// Variável global para armazenar dados do usuário
let usuarioAtual = null;
let idAtual = null;

// Verifica ID quando o campo perde o foco
document.getElementById('userId').addEventListener('blur', async (e) => {
    await verificarID(e.target.value);
});

// Também verifica quando o usuário digita Enter no campo ID
document.getElementById('userId').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        await verificarID(e.target.value);
    }
});

// Função para verificar o ID e buscar dados
async function verificarID(id) {
    const errorMessage = document.getElementById('errorMessage');
    const resetMessage = document.getElementById('resetMessage');
    const loading = document.getElementById('loading');
    const passwordInput = document.getElementById('password');
    const accessBtn = document.getElementById('accessBtn');
    const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
    
    errorMessage.textContent = '';
    resetMessage.classList.add('hidden');
    idAtual = id;
    
    if (!id || id.length < 3) {
        passwordInput.disabled = true;
        accessBtn.disabled = true;
        resetMessage.classList.add('hidden');
        return;
    }
    
    loading.classList.remove('hidden');
    passwordInput.disabled = true;
    accessBtn.disabled = true;
    resetMessage.classList.add('hidden');
    
    try {
        // Primeiro busca no users_login para verificar reset de senha
        const loginSnapshot = await get(ref(database, `users_login/${id}`));
        
        if (!loginSnapshot.exists()) {
            errorMessage.textContent = 'ID não encontrado.';
            loading.classList.add('hidden');
            return;
        }
        
        usuarioAtual = loginSnapshot.val();
        
        // Agora busca os dados completos no nó users
        const usersQuery = query(ref(database, 'users'), orderByChild('id'), equalTo(id));
        const usersSnapshot = await get(usersQuery);
        
        if (usersSnapshot.exists()) {
            usersSnapshot.forEach((childSnapshot) => {
                const userData = childSnapshot.val();
                // Combina dados do users_login com users
                usuarioAtual = { ...usuarioAtual, ...userData };
                return true;
            });
        }
        
        // Mostra os campos apropriados
        if (usuarioAtual.resetPassword === true) {
            // Precisa resetar senha
            passwordInput.disabled = true;
            accessBtn.disabled = true;
            resetMessage.classList.remove('hidden');
            forgotPasswordBtn.disabled = false;
        } else {
            // Login normal
            passwordInput.disabled = false;
            accessBtn.disabled = false;
            resetMessage.classList.add('hidden');
            forgotPasswordBtn.disabled = false;
        }
        
    } catch (error) {
        console.error('Erro ao verificar usuário:', error);
        
        if (error.code === 'permission_denied') {
            errorMessage.textContent = 'Permissão negada. Entre em contato com o administrador.';
        } else {
            errorMessage.textContent = 'Erro ao buscar dados do ID.';
        }
    } finally {
        loading.classList.add('hidden');
    }
}

// Login normal
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const loading = document.getElementById('loading');
    
    errorMessage.textContent = '';
    loading.classList.remove('hidden');
    
    try {
        if (!usuarioAtual || !idAtual || !usuarioAtual.email) {
            errorMessage.textContent = 'Por favor, verifique seu ID primeiro.';
            loading.classList.add('hidden');
            return;
        }
        
        const userCredential = await signInWithEmailAndPassword(auth, usuarioAtual.email, password);
        const user = userCredential.user;
        
        // Verifica se ainda precisa resetar a senha
        const loginSnapshot = await get(ref(database, `users_login/${idAtual}`));
        
        if (loginSnapshot.exists() && loginSnapshot.val().resetPassword === true) {
            window.location.href = `resetpassword.html?id=${idAtual}`;
        } else {
            window.location.href = 'main.html';
        }
        
    } catch (error) {
        loading.classList.add('hidden');
        
        if (error.code === 'auth/user-not-found') {
            errorMessage.textContent = 'Usuário não encontrado.';
        } else if (error.code === 'auth/wrong-password') {
            errorMessage.textContent = 'Senha incorreta.';
        } else {
            errorMessage.textContent = 'Erro ao fazer login. Tente novamente.';
        }
    }
});

// Função para gerar senha temporária
function gerarSenhaTemporaria() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let senha = '';
    
    senha += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.charAt(Math.floor(Math.random() * 26));
    senha += 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(Math.random() * 26));
    senha += '0123456789'.charAt(Math.floor(Math.random() * 10));
    
    for (let i = 0; i < 5; i++) {
        senha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    
    senha = senha.split('').sort(() => Math.random() - 0.5).join('');
    return senha + '!';
}

// Esqueci minha senha
document.getElementById('forgotPasswordBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('userId').value;
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const loading = document.getElementById('loading');
    
    if (!id) {
        errorMessage.textContent = 'Digite seu ID primeiro.';
        return;
    }
    
    loading.classList.remove('hidden');
    errorMessage.textContent = '';
    successMessage.textContent = '';
    
    try {
        // Busca o usuário pelo ID
        const loginSnapshot = await get(ref(database, `users_login/${id}`));
        
        if (!loginSnapshot.exists()) {
            errorMessage.textContent = 'ID não encontrado.';
            loading.classList.add('hidden');
            return;
        }
        
        const userData = loginSnapshot.val();
        
        if (!userData.email) {
            errorMessage.textContent = 'Email não encontrado para este ID.';
            loading.classList.add('hidden');
            return;
        }
        
        // Envia email de reset via Firebase Auth
        await sendPasswordResetEmail(auth, userData.email);
        
        successMessage.textContent = 'Email de redefinição enviado! Verifique sua caixa de entrada.';
        
    } catch (error) {
        console.error('Erro ao enviar email:', error);
        errorMessage.textContent = 'Erro ao enviar email. Tente novamente.';
    } finally {
        loading.classList.add('hidden');
    }
});

// Verifica se usuário já está logado
auth.onAuthStateChanged(async (user) => {
    if (user) {
        window.location.href = 'main.html';
    }
});