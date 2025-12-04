// Gerenciamento de autenticação para a página main
class MainAuthSystem {
    constructor() {
        this.currentUser = null;
        this.userData = null;
    }

    // Verificar autenticação e redirecionar se não estiver logado
    async checkAuthentication() {
        try {
            this.currentUser = auth.currentUser;
            
            if (!this.currentUser) {
                // Se não está logado, redirecionar para index
                window.location.href = 'index.html';
                return false;
            }

            return true;

        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            window.location.href = 'index.html';
            return false;
        }
    }

    // Carregar dados do usuário do Firebase
    async loadUserData() {
        try {
            if (!this.currentUser) return;

            // Buscar dados adicionais no nó users
            const usersRef = db.ref('users');
            const snapshot = await usersRef.orderByChild('email').equalTo(this.currentUser.email).once('value');
            
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    this.userData = childSnapshot.val();
                    return true; // Para após o primeiro resultado
                });
            }

            this.displayUserData();

        } catch (error) {
            console.error('Erro ao carregar dados do usuário:', error);
            this.showError('Erro ao carregar dados do usuário');
        }
    }

    // Exibir dados do usuário na página
    displayUserData() {
        const userDataElement = document.getElementById('userData');
        const userExtraDataElement = document.getElementById('userExtraData');
        
        if (!this.currentUser) return;

        // Dados básicos do Firebase Auth
        userDataElement.innerHTML = `
            <div class="data-grid">
                <div class="data-item">
                    <span class="data-label">Nome:</span>
                    <span id="userName" class="data-value">${this.userData?.nome || this.currentUser.displayName || 'Não informado'}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">Email:</span>
                    <span class="data-value">${this.currentUser.email}</span>
                </div>
                <div class="data-item">
                    <span class="data-label">UID:</span>
                    <span class="data-value uid">${this.currentUser.uid}</span>
                </div>
            </div>
        `;

        // Dados adicionais do nó users (se existirem)
        if (this.userData) {
            userExtraDataElement.classList.remove('hidden');
            document.getElementById('userId').textContent = this.userData.id || 'Não informado';
            document.getElementById('userCpf').textContent = this.userData.cpf || 'Não informado';
            
            const statusElement = document.getElementById('userStatus');
            if (this.userData.ativo === false) {
                statusElement.textContent = 'Inativo';
                statusElement.className = 'data-value status-inactive';
            } else {
                statusElement.textContent = 'Ativo';
                statusElement.className = 'data-value status-active';
            }
        }

        // Informações da sessão
        document.getElementById('loginTime').textContent = new Date().toLocaleString('pt-BR');
        document.getElementById('emailVerified').textContent = this.currentUser.emailVerified ? 'Sim' : 'Não';
        
        if (!this.currentUser.emailVerified) {
            const emailVerifiedElement = document.getElementById('emailVerified');
            emailVerifiedElement.className = 'data-value status-inactive';
        }
    }

    // Fazer logout
    async logout() {
        try {
            await auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            this.showError('Erro ao sair do sistema');
        }
    }

    // Mostrar erro
    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        
        setTimeout(() => {
            this.hideError();
        }, 5000);
    }

    // Ocultar erro
    hideError() {
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.classList.add('hidden');
    }
}

// Inicializar sistema de autenticação
const mainAuthSystem = new MainAuthSystem();

// Quando o DOM carregar
document.addEventListener('DOMContentLoaded', async function() {
    // Verificar autenticação
    const isAuthenticated = await mainAuthSystem.checkAuthentication();
    
    if (isAuthenticated) {
        // Carregar dados do usuário
        await mainAuthSystem.loadUserData();
        
        // Configurar botão de logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            mainAuthSystem.logout();
        });
    }
});