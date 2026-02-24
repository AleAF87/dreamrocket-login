// js/dashboard.js - Dashboard Principal
import { checkAuth } from './auth-check.js';

export async function initDashboard() {
    try {
        const result = await checkAuth(3);
        
        const userData = result.userData;
        const cpf = result.cpf; // APENAS CPF
        
        sessionStorage.setItem('userCPF', cpf);
        sessionStorage.setItem('userName', userData.nome);
        sessionStorage.setItem('userNivel', userData.nivel || 3);
        
        if (window.updateUserGreetingInSPA) {
            window.updateUserGreetingInSPA();
        }
        
        customizeDashboard(userData, cpf);
        
    } catch (error) {
        console.error('❌ Erro no dashboard:', error);
        showDashboardError(error);
    }
}

export function customizeDashboard(userData, cpf) {
    const cardBody = document.querySelector('#dashboard-content') || 
                     document.querySelector('.card-body');
    
    if (!cardBody) return;
    
    const cpfFormatado = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    
    cardBody.innerHTML = `
        <h1 class="display-4 mb-4">Olá, ${userData.nome}!</h1>
        <div class="alert alert-success">
            <h4 class="alert-heading">Bem-vindo ao Sistema</h4>
            <hr>
            <div class="mb-0">
                <div class="row">
                    <div class="col-md-6">
                        <strong><i class="fas fa-id-card me-1"></i>CPF:</strong> ${cpfFormatado}
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function showDashboardError(error) {
    const cardBody = document.querySelector('#dashboard-content') || 
                     document.querySelector('.card-body');
    
    if (cardBody) {
        cardBody.innerHTML = `
            <div class="alert alert-danger">
                <h4>Erro no Dashboard</h4>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="window.app ? window.app.loadPage('dashboard.html') : location.reload()">
                    Tentar Novamente
                </button>
            </div>
        `;
    }
}

// Se estiver carregando como página normal (não SPA)
if (!window.location.pathname.includes('app.html') && 
    !document.getElementById('app-content')) {
    
    document.addEventListener('DOMContentLoaded', async function() {
        try {
            const { loadNavbar } = await import('./auth-check.js');
            await loadNavbar();
        } catch (e) {
            console.warn('⚠️ Não foi possível carregar navbar:', e);
        }
        
        await initDashboard();
    });
}