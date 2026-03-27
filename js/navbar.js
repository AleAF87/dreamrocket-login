// js/navbar.js - Controle da Navbar
import { auth } from './firebase-config.js';
import { signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

console.log('✅ navbar.js carregado');

// 1. ATUALIZAR DROPDOWN COM NOME DO USUÁRIO
// Função updateUserGreeting - usar APENAS CPF
function updateUserGreeting() {
    const greeting = document.getElementById('userGreeting');
    const dropdownToggle = document.getElementById('userGreetingDropdown');
    
    if (!greeting || !dropdownToggle) {
        setTimeout(updateUserGreeting, 100);
        return;
    }
    
    // BUSCAR APENAS CPF
    const userName = sessionStorage.getItem('userName');
    const userCPF = sessionStorage.getItem('userCPF');
    
    console.log('📦 Navbar - Dados:', { userName, userCPF });
    
    if (userName) {
        let cleanName = userName;
        cleanName = cleanName.replace(/\.{3,}/g, '');
        cleanName = cleanName.replace(/\s*\(.*\)/g, '');
        cleanName = cleanName.trim();
        
        greeting.textContent = cleanName;
        
        // Tooltip com CPF
        if (userCPF) {
            // Formatar CPF para exibição (XXX.XXX.XXX-XX)
            const cpfFormatado = userCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
            dropdownToggle.title = `CPF: ${cpfFormatado}`;
            dropdownToggle.setAttribute('data-bs-toggle', 'tooltip');
            dropdownToggle.setAttribute('data-bs-placement', 'bottom');
        }
        
        return true;
    }
    
    greeting.textContent = 'Carregando...';
    return false;
}

// 2. FUNÇÃO DE LOGOUT
async function performLogout() {
    try {
        if (auth) {
            await signOut(auth);
        }
        
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = 'index.html';
        
    } catch (error) {
        console.error('Erro no logout:', error);
        sessionStorage.clear();
        localStorage.clear();
        window.location.href = 'index.html';
    }
}

// 3. CONFIGURAR DROPDOWN
function setupDropdown() {
    const logoutBtn = document.getElementById('navLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const originalText = logoutBtn.innerHTML;
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Saindo...';
            
            await performLogout();
            
            setTimeout(() => {
                logoutBtn.innerHTML = originalText;
            }, 3000);
        });
    }
    
    const profileBtn = document.getElementById('navProfile');
    if (profileBtn) {
        profileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'perfil.html';
        });
    }
}

// 4. DESTACAR MENU ATIVO
function highlightMenu() {
    const page = location.pathname.split('/').pop();
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        link.style.pointerEvents = 'auto';
        link.style.opacity = '1';
        link.style.color = 'rgba(255, 255, 255, 0.8)';
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === page) {
            link.classList.add('active');
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.9';
            link.style.color = '#fff';
        }
    });
    
    const navbarBrand = document.querySelector('.navbar-brand');
    if (navbarBrand) {
        navbarBrand.classList.remove('active');
        navbarBrand.style.cursor = 'default';
        navbarBrand.style.opacity = '1';
        navbarBrand.style.color = '#fff';
    }
}

// 5. CONFIGURAR NAVEGAÇÃO SPA
function setupSPANavigation() {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('.nav-link[href$=".html"]');
        if (link && !link.hasAttribute('data-ignore-spa')) {
            e.preventDefault();
            const href = link.getAttribute('href');
            
            if (window.app && window.app.loadPage) {
                window.app.loadPage(href);
            } else {
                window.location.href = href;
            }
        }
    });
}

// 6. ESTILIZAR DROPDOWN
function styleDropdownToggle() {
    const dropdownToggle = document.getElementById('userGreetingDropdown');
    if (!dropdownToggle) return;
    
    dropdownToggle.style.borderColor = 'rgba(255, 255, 255, 0.5)';
    dropdownToggle.style.color = '#fff';
    dropdownToggle.style.transition = 'all 0.2s';
    
    dropdownToggle.addEventListener('mouseenter', () => {
        dropdownToggle.style.borderColor = '#fff';
        dropdownToggle.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    });
    
    dropdownToggle.addEventListener('mouseleave', () => {
        dropdownToggle.style.borderColor = 'rgba(255, 255, 255, 0.5)';
        dropdownToggle.style.backgroundColor = 'transparent';
    });
    
    dropdownToggle.addEventListener('click', () => {
        setTimeout(() => {
            const isOpen = dropdownToggle.getAttribute('aria-expanded') === 'true';
            if (isOpen) {
                dropdownToggle.style.borderColor = '#fff';
                dropdownToggle.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            } else {
                dropdownToggle.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                dropdownToggle.style.backgroundColor = 'transparent';
            }
        }, 10);
    });
}

// 7. ATUALIZAR NAVBAR POR NÍVEL
export function updateNavbarByLevel(userLevel) {
    if (userLevel >= 3) {
        const exclusoesItem = document.getElementById('navExclusoes');
        if (exclusoesItem) {
            const parentLi = exclusoesItem.closest('li.nav-item');
            if (parentLi) {
                parentLi.style.display = 'none';
            }
        }
        
        const solicitacoesItem = document.getElementById('navSolicitacoes');
        if (solicitacoesItem) {
            const parentLi = solicitacoesItem.closest('li.nav-item');
            if (parentLi) {
                parentLi.style.display = 'none';
            }
        }
    }
}

// 8. INICIALIZAÇÃO
document.addEventListener('DOMContentLoaded', function() {
    updateUserGreeting();
    
    setTimeout(updateUserGreeting, 500);
    setTimeout(updateUserGreeting, 1000);
    
    setupDropdown();
    highlightMenu();
    setupSPANavigation();
    styleDropdownToggle();
    
    if (typeof bootstrap !== 'undefined') {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
    
    const userNivel = sessionStorage.getItem('userNivel');
    if (userNivel) {
        updateNavbarByLevel(parseInt(userNivel));
    }
});

// 9. FUNÇÃO GLOBAL
window.updateNavbarUserGreeting = updateUserGreeting;

// 10. ATUALIZAR MENU ATIVO
window.updateNavbarActiveMenu = function(pageUrl) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        link.style.pointerEvents = 'auto';
        link.style.opacity = '1';
        link.style.color = 'rgba(255, 255, 255, 0.8)';
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === pageUrl) {
            link.classList.add('active');
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.9';
            link.style.color = '#fff';
        }
    });
};

// 11. EXPORTAR
export { updateUserGreeting };