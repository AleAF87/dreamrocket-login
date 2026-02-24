// js/base.js - Página Base para Testes
import { checkAuth } from './auth-check.js';
import { database } from './firebase-config.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

export async function initBaseSPA() {
    console.log('🚀 Base inicializando (SPA)...');
    await initBase();
}

export async function initBase() {
    try {
        const result = await checkAuth(2);
        
        const userData = result.userData;
        const cpf = result.cpf; // APENAS CPF
        
        sessionStorage.setItem('userCPF', cpf);
        sessionStorage.setItem('userName', userData.nome);
        sessionStorage.setItem('userNivel', userData.nivel || 3);
        
        if (window.updateUserGreetingInSPA) {
            window.updateUserGreetingInSPA();
        }
        
        renderBasePage(userData, cpf);
        
    } catch (error) {
        console.error('❌ Erro na base:', error);
        showBaseError(error);
    }
}

function renderBasePage(userData, cpf) {
    const baseContent = document.querySelector('#base-content');
    if (!baseContent) return;
    
    const cleanName = userData.nome.replace(/\.{3,}/g, '').replace(/\s*\(.*\)/g, '').trim();
    
    // Formatar CPF para exibição
    const cpfFormatado = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    
    baseContent.innerHTML = `
        <div class="text-center mb-5">
            <i class="fas fa-code text-primary" style="font-size: 64px;"></i>
            <h1 class="display-4 mt-3">Hello World!</h1>
            <p class="lead">Página base com dados do Firebase (APENAS CPF)</p>
        </div>
        
        <div class="row justify-content-center">
            <div class="col-md-8">
                <div class="card border-primary">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0"><i class="fas fa-database me-2"></i>Dados do Firebase</h5>
                    </div>
                    <div class="card-body">
                        <div class="row mb-4">
                            <div class="col-md-6">
                                <div class="card bg-light">
                                    <div class="card-body text-center">
                                        <h6 class="text-muted mb-2">CPF</h6>
                                        <h3 class="mb-0"><span class="badge bg-info fs-4">${cpfFormatado}</span></h3>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="card bg-light">
                                    <div class="card-body text-center">
                                        <h6 class="text-muted mb-2">Nome Completo</h6>
                                        <h4 class="mb-0">${cleanName}</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="alert alert-success mt-4">
                            <i class="fas fa-check-circle me-2"></i>
                            <strong>Sistema usando APENAS CPF como identificador!</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function showBaseError(error) {
    const baseContent = document.querySelector('#base-content') || 
                       document.querySelector('.card-body');
    
    if (baseContent) {
        baseContent.innerHTML = `
            <div class="alert alert-danger">
                <h4><i class="fas fa-exclamation-triangle me-2"></i>Erro na Base</h4>
                <p>${error.message}</p>
                <button class="btn btn-primary" onclick="window.app ? window.app.loadPage('base.html') : location.reload()">
                    <i class="fas fa-redo me-1"></i>Tentar Novamente
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
        
        await initBase();
    });
}

export default initBase;