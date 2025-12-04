// LOGIN COM GOOGLE
function loginGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();

    auth.signInWithPopup(provider)
        .then(result => {
            console.log("Logado:", result.user.displayName);
        })
        .catch(err => {
            console.error("Erro no login:", err);
        });
}

// LOGOUT
function logout() {
    auth.signOut().then(() => {
        console.log("Deslogado");
    });
}

// MONITORA LOGIN/LOGOUT
auth.onAuthStateChanged(user => {
    const userArea = document.getElementById("userArea");

    if (!userArea) return;

    if (user) {
        // Se tiver foto, usa o avatar do Google
        if (user.photoURL) {
            userArea.innerHTML = `
                <img src="${user.photoURL}" class="user-avatar" onclick="logout()" title="Sair">
            `;
        } else {
            // Se não tiver foto, usar a inicial do nome
            const inicial = user.displayName
                ? user.displayName.charAt(0)
                : "U";

            userArea.innerHTML = `
                <div class="avatar-circle" onclick="logout()" title="Sair">${inicial}</div>
            `;
        }

    } else {
        // Não logado
        userArea.innerHTML = `
            <span class="login-btn" onclick="loginGoogle()">Acessar</span>
        `;
    }
});
