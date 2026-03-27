// js/perfil.js - Perfil do Usuário (Versão Simplificada)
import { checkAuth } from './auth-check.js';
import { auth } from './firebase-config.js';
import { 
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

let userDataCache = null;
let userRE = null;

export async function initPerfilSPA() {
    console.log('🚀 Perfil inicializando (SPA)...');
    await initPerfil();
}

export async function initPerfil() {
    try {
        const { userData, re } = await checkAuth(3);
        userDataCache = userData;
        userRE = re;
        
        sessionStorage.setItem('userRE', re);
        sessionStorage.setItem('userName', userData.nome);
        sessionStorage.setItem('userNivel', userData.nivel || 3);
        
        if (window.updateUserGreetingInSPA) {
            window.updateUserGreetingInSPA();
        }
        
        renderPerfil(userData, re);
        setupEventListeners();
        
    } catch (error) {
        console.error('❌ Erro no perfil:', error);
        showPerfilError(error);
    }
}

function generateAvatar(nomeCompleto) {
    if (!nomeCompleto || nomeCompleto.trim() === '') {
        return '??';
    }
    
    const nomeLimpo = nomeCompleto
        .replace(/\.{3,}/g, '')
        .replace(/\s*\(.*\)/g, '')
        .trim();
    
    const partes = nomeLimpo.split(' ');
    
    if (partes.length === 1) {
        return partes[0].substring(0, 2).toUpperCase();
    } else {
        const primeiroNome = partes[0];
        const ultimoSobrenome = partes[partes.length - 1];
        return (primeiroNome.charAt(0) + ultimoSobrenome.charAt(0)).toUpperCase();
    }
}

function renderPerfil(userData, re) {
    const perfilContent = document.querySelector('#perfil-content') || 
                         document.querySelector('.card-body');
    
    if (!perfilContent) return;
    
    const currentUser = auth.currentUser;
    const userEmail = currentUser ? currentUser.email : 'Não disponível';
    
    const avatarIniciais = generateAvatar(userData.nome);
    
    let nivelTexto = 'Básico';
    if (userData.nivel === 1) nivelTexto = 'Administrador';
    else if (userData.nivel === 2) nivelTexto = 'Moderador';
    
    perfilContent.innerHTML = `
        <div class="row">
            <div class="col-md-4">
                <div class="card mb-3">
                    <div class="card-body text-center">
                        <div class="avatar-circle mb-3">
                            ${avatarIniciais}
                        </div>
                        
                        <h4 class="card-title">${userData.nome}</h4>
                        
                        <div class="user-info text-start mt-4">
                            <div class="mb-2">
                                <strong><i class="fas fa-id-card me-2"></i>RE:</strong>
                                <span class="float-end">${re}</span>
                            </div>
                            
                            <div class="mb-2">
                                <strong><i class="fas fa-envelope me-2"></i>E-mail:</strong>
                                <span class="float-end" style="font-size: 0.9em;">${userEmail}</span>
                            </div>
                            
                            <div class="mb-3">
                                <strong><i class="fas fa-shield-alt me-2"></i>Nível:</strong>
                                <span class="float-end badge bg-secondary">${nivelTexto}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="card">
                    <div class="card-body">
                        <h6 class="card-title mb-3">
                            <i class="fas fa-cog me-2"></i>OPÇÕES
                        </h6>
                        
                        <div class="list-group list-group-flush">
                            <a href="#" class="list-group-item list-group-item-action active" id="link-alterar-senha">
                                <i class="fas fa-key me-2"></i>Alterar Senha
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="col-md-8">
                <div class="card">
                    <div class="card-body">
                        <div id="perfil-conteudo-dinamico">
                            <div class="text-center py-5">
                                <i class="fas fa-user-circle text-muted" style="font-size: 64px;"></i>
                                <h4 class="mt-3">Selecione uma opção</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showAlterarSenhaForm() {
    const conteudoDinamico = document.getElementById('perfil-conteudo-dinamico');
    if (!conteudoDinamico) return;
    
    conteudoDinamico.innerHTML = `
        <h4 class="mb-4">
            <i class="fas fa-key me-2"></i>Alterar Senha
        </h4>
        
        <form id="form-alterar-senha">
            <div class="mb-3">
                <label for="senha-atual" class="form-label">Senha Atual</label>
                <input type="password" class="form-control" id="senha-atual" required>
            </div>
            
            <div class="mb-3">
                <label for="nova-senha" class="form-label">Nova Senha</label>
                <input type="password" class="form-control" id="nova-senha" required minlength="6">
                <small class="text-muted">Mínimo 6 caracteres</small>
            </div>
            
            <div class="mb-4">
                <label for="confirmar-senha" class="form-label">Confirmar Nova Senha</label>
                <input type="password" class="form-control" id="confirmar-senha" required>
                <div id="senha-match" class="form-text"></div>
            </div>
            
            <div class="d-flex justify-content-between">
                <button type="button" class="btn btn-outline-secondary" id="btn-cancelar-senha">
                    Cancelar
                </button>
                <button type="submit" class="btn btn-primary" id="btn-alterar-senha">
                    Alterar Senha
                </button>
            </div>
            
            <div id="senha-mensagens" class="mt-3"></div>
        </form>
    `;
    
    setupFormListeners();
}

function setupFormListeners() {
    const form = document.getElementById('form-alterar-senha');
    const btnCancelar = document.getElementById('btn-cancelar-senha');
    const novaSenha = document.getElementById('nova-senha');
    const confirmarSenha = document.getElementById('confirmar-senha');
    
    if (novaSenha && confirmarSenha) {
        const checkMatch = () => {
            const matchDiv = document.getElementById('senha-match');
            if (!matchDiv) return;
            
            if (confirmarSenha.value === '') {
                matchDiv.textContent = '';
            } else if (novaSenha.value === confirmarSenha.value) {
                matchDiv.textContent = '✅ As senhas coincidem';
                matchDiv.className = 'form-text text-success';
            } else {
                matchDiv.textContent = '❌ As senhas não coincidem';
                matchDiv.className = 'form-text text-danger';
            }
        };
        
        novaSenha.addEventListener('input', checkMatch);
        confirmarSenha.addEventListener('input', checkMatch);
    }
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            await alterarSenha();
        });
    }
    
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            const conteudoDinamico = document.getElementById('perfil-conteudo-dinamico');
            if (conteudoDinamico) {
                conteudoDinamico.innerHTML = `
                    <div class="text-center py-5">
                        <i class="fas fa-user-circle text-muted" style="font-size: 64px;"></i>
                        <h4 class="mt-3">Selecione uma opção</h4>
                    </div>
                `;
            }
        });
    }
}

async function alterarSenha() {
    const senhaAtual = document.getElementById('senha-atual').value;
    const novaSenha = document.getElementById('nova-senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    const btnAlterar = document.getElementById('btn-alterar-senha');
    const mensagensDiv = document.getElementById('senha-mensagens');
    
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
        showMessage('Preencha todos os campos.', 'danger', mensagensDiv);
        return;
    }
    
    if (novaSenha !== confirmarSenha) {
        showMessage('As senhas não coincidem.', 'danger', mensagensDiv);
        return;
    }
    
    if (novaSenha.length < 6) {
        showMessage('A nova senha deve ter no mínimo 6 caracteres.', 'danger', mensagensDiv);
        return;
    }
    
    try {
        if (btnAlterar) {
            btnAlterar.disabled = true;
            btnAlterar.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Alterando...';
        }
        
        const user = auth.currentUser;
        if (!user || !user.email) {
            throw new Error('Usuário não autenticado');
        }
        
        const credential = EmailAuthProvider.credential(user.email, senhaAtual);
        await reauthenticateWithCredential(user, credential);
        
        await updatePassword(user, novaSenha);
        
        showMessage('✅ Senha alterada com sucesso!', 'success', mensagensDiv);
        
        document.getElementById('form-alterar-senha').reset();
        
        if (btnAlterar) {
            btnAlterar.disabled = false;
            btnAlterar.innerHTML = 'Alterar Senha';
        }
        
    } catch (error) {
        console.error('Erro ao alterar senha:', error);
        
        let errorMessage = 'Erro ao alterar senha. ';
        switch (error.code) {
            case 'auth/invalid-login-credentials':
                errorMessage += 'Senha atual incorreta.';
                break;
            case 'auth/weak-password':
                errorMessage += 'A nova senha é muito fraca.';
                break;
            case 'auth/requires-recent-login':
                errorMessage += 'Sessão expirada. Faça login novamente.';
                setTimeout(() => window.location.href = 'index.html', 2000);
                break;
            default:
                errorMessage += error.message;
        }
        
        showMessage(errorMessage, 'danger', mensagensDiv);
        
        if (btnAlterar) {
            btnAlterar.disabled = false;
            btnAlterar.innerHTML = 'Alterar Senha';
        }
    }
}

function showMessage(message, type, container) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    if (type !== 'success') {
        setTimeout(() => {
            const alert = container.querySelector('.alert');
            if (alert) alert.remove();
        }, 5000);
    }
}

function setupEventListeners() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('#link-alterar-senha')) {
            e.preventDefault();
            showAlterarSenhaForm();
            
            document.querySelectorAll('.list-group-item').forEach(item => {
                item.classList.remove('active');
            });
            e.target.closest('#link-alterar-senha').classList.add('active');
        }
    });
}

function showPerfilError(error) {
    const perfilContent = document.querySelector('#perfil-content') || 
                         document.querySelector('.card-body');
    
    if (perfilContent) {
        perfilContent.innerHTML = `
            <div class="alert alert-danger">
                <h4>Erro no Perfil</h4>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="location.reload()">
                    <i class="fas fa-redo me-1"></i>Tentar Novamente
                </button>
            </div>
        `;
    }
}

if (!window.location.pathname.includes('app.html') && 
    !document.getElementById('app-content')) {
    
    document.addEventListener('DOMContentLoaded', async function() {
        try {
            const { loadNavbar } = await import('./auth-check.js');
            await loadNavbar();
        } catch (e) {
            console.warn('⚠️ Não foi possível carregar navbar:', e);
        }
        
        await initPerfil();
    });
}

export default initPerfil;