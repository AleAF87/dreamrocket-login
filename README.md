padrao/
├── app.html
├── base.html
├── dashboard.html
├── index.html
├── perfil.html
│
├── components/
│   └── navbar.html
│
├── css/
│   └── style.css
│
├── img/
│   └── logo.png
│
├── js/
│   ├── app-core.js
│   ├── auth-check.js
│   ├── base.js
│   ├── dashboard.js
│   ├── firebase-config.js
│   ├── index.js
│   ├── navbar.js
│   ├── perfil-permissao.js
│   └── perfil.js


Já tenho o sistema de login e o app rodando em formato SPA.
Vou te mandar tudo para você reajustar pra mim as páginas, os JS e o CSS, pode ser?
Por enquanto vamos fazer apenas o index, navbar, app e dashboard (que será a tela inicial após login), o que acha?


Me dê todos os códigos atualizados completos, para eu apenas copiar/colar:

- index.html:
"<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SistemaBase - Login</title>
    
    <!-- CSS -->
    <link rel="stylesheet" href="css/style.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="img/logo.png">
</head>
<body>
    <div class="login-container">
        <div class="login-box">
            <div class="logo-container">
                <img src="img/logo.png" alt="SistemaBase" class="logo" id="logo" style="max-height: 80px;">
            </div>
            
            <!-- PASSO 1: CPF -->
            <div id="cpfStep" class="step active">
                <h2 class="mb-4">Identificação</h2>
                <div class="form-group mb-3">
                    <label for="cpfInput" class="form-label">CPF (11 dígitos)</label>
                    <input type="text" 
                        id="cpfInput" 
                        class="form-control" 
                        placeholder="Digite seu CPF"
                        maxlength="14"
                        inputmode="numeric"
                        style="text-align: center;">
                    <div class="form-text">Digite apenas os 11 dígitos do seu CPF</div>
                </div>
                <button id="searchCpfBtn" class="btn btn-primary w-100">
                    <i class="fas fa-search me-2"></i>Verificar CPF
                </button>
                <div class="text-center mt-3">
                    <button id="showRegisterBtn" class="btn btn-outline-secondary w-100">
                        <i class="fas fa-user-plus me-2"></i>Cadastrar-se
                    </button>
                </div>
            </div>

            <!-- PASSO 2: Senha -->
            <div id="passwordStep" class="step">
                <h2 class="mb-4">Olá, <span id="userName"></span></h2>
                <div class="form-group mb-3">
                    <label for="passwordInput" class="form-label">Senha</label>
                    <div class="input-group">
                        <input type="password" 
                            id="passwordInput" 
                            class="form-control" 
                            placeholder="Digite sua senha"
                            style="text-align: center;">
                        <button class="btn btn-outline-secondary" type="button" id="togglePassword">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </div>
                <div class="d-grid gap-2">
                    <button id="loginBtn" class="btn btn-primary">
                        <i class="fas fa-sign-in-alt me-2"></i>Entrar
                    </button>
                    <button id="backBtn" class="btn btn-outline-secondary">
                        <i class="fas fa-arrow-left me-2"></i>Voltar
                    </button>
                </div>
            </div>

            <!-- Link de recuperação de senha -->
            <div class="mt-4 text-center">
                <a href="#" id="forgotPassword" class="text-decoration-none d-none">
                    <i class="fas fa-key me-1"></i>Esqueci minha senha
                </a>
            </div>

            <!-- Alertas -->
            <div class="alert alert-danger mt-3 d-none" id="errorAlert"></div>
            <div class="alert alert-info mt-3 d-none" id="infoAlert"></div>
            
            <!-- Rodapé -->
            <div class="text-center mt-4">
                <small class="text-muted">SistemaBase - Sistema de Gestão</small>
            </div>
        </div>
    </div>

    <!-- MODAL DE CADASTRO -->
    <div id="registerModal" class="modal" style="display: none;">
        <div class="modal-content" style="max-width: 600px;">
            <span class="close-modal">&times;</span>
            <h2 class="mb-4">Criar Nova Conta</h2>
            
            <form id="registerForm">
                <!-- Validação CPF em tempo real -->
                <div class="form-group mb-3">
                    <label for="registerCpf" class="form-label">CPF *</label>
                    <div class="input-group">
                        <input type="text" 
                            id="registerCpf" 
                            class="form-control" 
                            placeholder="000.000.000-00"
                            maxlength="14"
                            required>
                        <span class="input-group-text" id="cpfValidationIcon">
                            <i class="fas fa-spinner fa-spin d-none" id="cpfSpinner"></i>
                        </span>
                    </div>
                    <div class="form-text" id="cpfStatus"></div>
                </div>

                <!-- Nome completo -->
                <div class="form-group mb-3">
                    <label for="registerNome" class="form-label">Nome Completo *</label>
                    <input type="text" id="registerNome" class="form-control" required disabled>
                </div>

                <!-- Data de nascimento com calendário customizado -->
                <div class="form-group mb-3">
                    <label class="form-label">Data de Nascimento *</label>
                    <div class="custom-date-input">
                        <input type="text" 
                            id="registerDataNasc" 
                            class="form-control date-input" 
                            placeholder="DD/MM/AAAA"
                            maxlength="10"
                            required disabled>
                        <button type="button" class="btn btn-outline-secondary calendar-trigger" id="openCalendarBtn" disabled>
                            <i class="fas fa-calendar-alt"></i>
                        </button>
                    </div>
                    <small class="form-text text-muted">Digite ou clique no calendário para selecionar</small>
                </div>

                <!-- Celular com máscara -->
                <div class="form-group mb-3">
                    <label for="registerCelular" class="form-label">Celular *</label>
                    <input type="text" id="registerCelular" class="form-control" placeholder="(00) 00000-0000" maxlength="15" required disabled>
                </div>

                <!-- Email -->
                <div class="form-group mb-3">
                    <label for="registerEmail" class="form-label">E-mail *</label>
                    <input type="email" id="registerEmail" class="form-control" required disabled>
                </div>

                <!-- Senha -->
                <div class="form-group mb-3">
                    <label for="registerSenha" class="form-label">Senha *</label>
                    <input type="password" id="registerSenha" class="form-control" required disabled>
                    <div class="password-requirements mt-2" id="passwordRequirements">
                        <small class="d-block" id="reqLength">❌ Mínimo 8 caracteres</small>
                        <small class="d-block" id="reqUpper">❌ 1 letra maiúscula</small>
                        <small class="d-block" id="reqLower">❌ 1 letra minúscula</small>
                        <small class="d-block" id="reqNumber">❌ 1 número</small>
                        <small class="d-block" id="reqSpecial">❌ 1 caractere especial</small>
                    </div>
                </div>

                <!-- Confirmar senha -->
                <div class="form-group mb-3">
                    <label for="registerConfirmarSenha" class="form-label">Confirmar Senha *</label>
                    <input type="password" id="registerConfirmarSenha" class="form-control" required disabled>
                    <small class="text-danger d-none" id="passwordMismatch">As senhas não conferem</small>
                    <small class="text-success d-none" id="passwordMatch">✓ Senhas conferem</small>
                </div>

                <div class="modal-actions">
                    <button type="button" class="btn btn-outline-secondary" onclick="fecharModalRegistro()">Cancelar</button>
                    <button type="submit" class="btn btn-primary" id="btnCriarConta" disabled>Criar Conta</button>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL DO CALENDÁRIO -->
    <div id="calendarModal" class="modal calendar-modal" style="display: none;">
        <div class="modal-content">
            <span class="close-modal" onclick="fecharCalendarModal()">&times;</span>
            <h3 class="mb-4">Selecione a Data</h3>
            <div id="calendar-container"></div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    
    <!-- Firebase -->
    <script type="module" src="js/firebase-config.js"></script>
    <script type="module" src="js/index.js"></script>
</body>
</html>"

- app.html:
"<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema Base</title>
    <link rel="icon" type="image/x-icon" href="img/logo.png">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <!-- Navbar será carregado aqui -->
    <div id="navbar"></div>
    
    <!-- Conteúdo principal -->
    <div id="app-content" style="margin-top: 70px; padding: 20px;">
        <!-- Conteúdo será carregado dinamicamente -->
    </div>

    <!-- Scripts -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script type="module" src="js/app-core.js"></script>
</body>
</html>"

- dashboard.html:
"<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - Sistema</title>
    <link rel="icon" type="image/x-icon" href="img/logo.png">
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div id="navbar"></div>
    
    <main class="container-fluid mt-4">
        <div class="row">
            <div class="col-12">
                <div class="card">
                    <div class="card-body text-center">
                        <p class="lead">Carregando...</p>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script type="module" src="js/firebase-config.js"></script>
    <script type="module" src="js/auth-check.js"></script>
    <script type="module" src="js/dashboard.js"></script>
</body>
</html>"

- components/navbar.html:
"<!-- components/navbar.html - VERSÃO LIMPA PARA NOVOS PROJETOS -->
<nav class="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm fixed-top">
    <div class="container-fluid">
        <!-- Logo SEM LINK - apenas imagem e texto -->
        <div class="navbar-brand fw-bold d-flex align-items-center">
            <img src="img/logo.ico" alt="Logo" class="navbar-logo me-2" style="height: 30px; width: auto;"
                 onerror="this.style.display='none';">
            <span>Sistema</span>
        </div>
        
        <!-- Botão Mobile -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNavbar">
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <!-- Conteúdo Navbar -->
        <div class="collapse navbar-collapse" id="mainNavbar">
            <!-- Menu Principal -->
            <ul class="navbar-nav me-auto">
                <!-- Dashboard -->
                <li class="nav-item">
                    <a class="nav-link" href="dashboard.html" id="navDashboard">
                        <i class="fas fa-tachometer-alt me-1"></i>Dashboard
                    </a>
                </li>

                <!-- Base (NOVA PÁGINA) -->
                <li class="nav-item">
                    <a class="nav-link" href="base.html" id="navBase">
                        <i class="fas fa-code me-1"></i>Base
                    </a>
                </li>

                <!-- Solicitações -->
                <li class="nav-item">
                    <a class="nav-link" href="solicitacoes.html" id="navSolicitacoes">
                        <i class="fas fa-clipboard-list me-1"></i>Solicitações
                    </a>
                </li>
                
                <!-- Escalas -->
                <li class="nav-item">
                    <a class="nav-link" href="escalas.html" id="navEscalas">
                        <i class="fas fa-calendar-alt me-1"></i>Escalas
                    </a>
                </li>

                <!-- Exclusões -->
                <li class="nav-item">
                    <a class="nav-link" href="exclusoes.html" id="navExclusoes">
                        <i class="fas fa-calendar-times me-1"></i>Exclusões
                    </a>
                </li>
            </ul>
            
            <!-- User Dropdown Unificado -->
            <div class="dropdown">
                <button class="btn btn-outline-light dropdown-toggle d-flex align-items-center" 
                        type="button" 
                        data-bs-toggle="dropdown"
                        id="userGreetingDropdown">
                    <i class="fas fa-user me-2"></i>
                    <span id="userGreeting">Carregando...</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                        <a class="dropdown-item" href="perfil.html" id="navProfile">
                            <i class="fas fa-id-card me-1"></i>Meu Perfil
                        </a>
                    </li>
                    <li><hr class="dropdown-divider"></li>
                    <li>
                        <a class="dropdown-item text-danger" href="#" id="navLogout">
                            <i class="fas fa-sign-out-alt me-1"></i>Sair do Sistema
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</nav>"

- css/style.css:
"/* css/style.css - Estilos Globais */
:root {
    --primary-color: #0d6efd;
    --secondary-color: #6c757d;
    --success-color: #198754;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    --info-color: #0dcaf0;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background-color: #f8f9fa;
    padding-top: 60px; /* Compensar navbar fixed */
}

/* ========== LOGIN PAGE STYLES ========== */
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    position: relative;
    overflow: hidden;
}

.login-box {
    background: white;
    border-radius: 20px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
    padding: 40px;
    width: 100%;
    max-width: 450px;
    margin: 20px;
    position: relative;
    z-index: 10;
    backdrop-filter: blur(10px);
    animation: fadeInUp 0.6s ease-out;
}

.logo-container {
    text-align: center;
    margin-bottom: 30px;
}

.logo {
    max-width: 150px;
    height: auto;
}

.step {
    display: none;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.step.active {
    display: block;
    opacity: 1;
}

/* Modal Styles */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    z-index: 1000;
    justify-content: center;
    align-items: center;
    backdrop-filter: blur(5px);
    animation: fadeIn 0.3s ease;
}

.modal-content {
    background: white;
    border-radius: 15px;
    padding: 30px;
    max-width: 600px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    animation: slideInUp 0.4s ease;
}

.close-modal {
    position: absolute;
    top: 20px;
    right: 25px;
    font-size: 28px;
    font-weight: bold;
    color: #999;
    cursor: pointer;
    transition: color 0.2s;
    line-height: 1;
}

.close-modal:hover {
    color: #333;
}

/* Custom Date Input */
.custom-date-input {
    display: flex;
    gap: 10px;
}

.custom-date-input .date-input {
    flex: 1;
}

.calendar-trigger {
    width: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Calendar Styles */
.calendar-modal .modal-content {
    max-width: 500px;
}

.calendar-container {
    background: white;
    border-radius: 12px;
    padding: 20px;
}

.calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.month-year-selector {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: background 0.2s;
}

.month-year-selector:hover {
    background: #f0f0f0;
}

.calendar-month {
    font-size: 1.2rem;
    font-weight: 600;
}

.calendar-year {
    font-size: 1.2rem;
    color: #666;
}

.calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    text-align: center;
    font-weight: 600;
    color: #666;
    margin-bottom: 10px;
}

.calendar-weekday {
    padding: 10px;
    font-size: 0.9rem;
}

.calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
}

.calendar-day {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.2s;
    font-weight: 500;
    background: #f8f9fa;
}

.calendar-day:not(.empty):not(.disabled):hover {
    background: #007bff;
    color: white;
    transform: scale(1.05);
}

.calendar-day.today {
    background: #e3f2fd;
    color: #007bff;
    font-weight: 700;
    border: 2px solid #007bff;
}

.calendar-day.selected {
    background: #007bff;
    color: white;
    font-weight: 700;
}

.calendar-day.disabled {
    opacity: 0.3;
    cursor: not-allowed;
    background: #e9ecef;
}

.calendar-day.empty {
    background: transparent;
    cursor: default;
}

.calendar-footer {
    margin-top: 20px;
    text-align: right;
}

.calendar-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}

.year-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-top: 20px;
    max-height: 400px;
    overflow-y: auto;
}

.year-item {
    text-align: center;
    padding: 12px;
    border-radius: 8px;
    background: #f8f9fa;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
}

.year-item:hover {
    background: #007bff;
    color: white;
    transform: scale(1.05);
}

.year-item.selected {
    background: #007bff;
    color: white;
    font-weight: 700;
}

/* Password Requirements */
.password-requirements {
    font-size: 0.9rem;
    background: #f8f9fa;
    padding: 10px;
    border-radius: 8px;
}

.password-requirements small {
    margin-bottom: 5px;
}

/* Modal Actions */
.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #dee2e6;
}

/* Form Validation */
.form-control.is-valid {
    border-color: #28a745;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' viewBox='0 0 8 8'%3e%3cpath fill='%2328a745' d='M2.3 6.73L.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

.form-control.is-invalid {
    border-color: #dc3545;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%23dc3545' viewBox='0 0 12 12'%3e%3ccircle cx='6' cy='6' r='4.5'/%3e%3cpath stroke-linejoin='round' d='M5.8 3.6h.4L6 6.5z'/%3e%3ccircle cx='6' cy='8.2' r='.6' fill='%23dc3545' stroke='none'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right calc(0.375em + 0.1875rem) center;
    background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);
}

/* Particulas e Efeitos */
.particula {
    position: absolute;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    pointer-events: none;
    animation: flutuar linear infinite;
}

.onda {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100px;
    background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.1));
    animation: onda 8s ease-in-out infinite;
}

.onda2 {
    bottom: 20px;
    opacity: 0.5;
    animation: onda 6s ease-in-out infinite reverse;
}

.anel {
    position: absolute;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    animation: pulsar 4s ease-out infinite;
}

.anel1 {
    width: 300px;
    height: 300px;
    top: -150px;
    right: -150px;
}

.anel2 {
    width: 500px;
    height: 500px;
    bottom: -250px;
    left: -250px;
    animation-delay: 1s;
}

.anel3 {
    width: 400px;
    height: 400px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation-delay: 2s;
}

.brilhoFundo {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
    animation: rotacionar 20s linear infinite;
}

.linhaDourada {
    position: absolute;
    height: 2px;
    background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent);
    animation: linha 8s linear infinite;
}

.linha1 {
    top: 20%;
    width: 100%;
    left: -100%;
}

.linha2 {
    top: 50%;
    width: 150%;
    left: -150%;
    animation-delay: 2s;
}

.linha3 {
    top: 80%;
    width: 120%;
    left: -120%;
    animation-delay: 4s;
}

/* Animações */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideInUp {
    from {
        transform: translateY(30px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes flutuar {
    0% {
        transform: translateY(0) rotate(0deg);
        opacity: 0.3;
    }
    50% {
        transform: translateY(-20px) rotate(180deg);
        opacity: 0.6;
    }
    100% {
        transform: translateY(0) rotate(360deg);
        opacity: 0.3;
    }
}

@keyframes onda {
    0%, 100% {
        transform: translateY(0);
    }
    50% {
        transform: translateY(-20px);
    }
}

@keyframes pulsar {
    0% {
        transform: scale(0.8);
        opacity: 0.3;
    }
    50% {
        transform: scale(1.2);
        opacity: 0.1;
    }
    100% {
        transform: scale(0.8);
        opacity: 0.3;
    }
}

@keyframes rotacionar {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

@keyframes linha {
    0% {
        left: -100%;
    }
    100% {
        left: 200%;
    }
}

/* Responsividade */
@media (max-width: 768px) {
    .login-box {
        padding: 30px 20px;
        margin: 15px;
    }
    
    .modal-content {
        padding: 20px;
        width: 95%;
    }
    
    .calendar-day {
        font-size: 0.9rem;
    }
    
    .year-grid {
        grid-template-columns: repeat(3, 1fr);
    }
}

@media (max-width: 480px) {
    .year-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .custom-date-input {
        flex-direction: column;
    }
    
    .calendar-trigger {
        width: 100%;
    }
}

/* Reset completo para o body */
body {
    margin: 0 !important;
    padding: 0 !important;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
}

/* Navbar Styles */
.navbar {
    box-shadow: 0 2px 4px rgba(0,0,0,.1);
}

.navbar-brand {
    font-size: 1.25rem;
    cursor: default;
    color: #fff !important;
    opacity: 0.9;
}

.navbar-brand img.navbar-logo {
    height: 30px;
    width: auto;
}

.nav-link {
    color: rgba(255,255,255,0.8) !important;
    transition: all 0.2s;
    padding: 0.5rem 1rem !important;
}

.nav-link:hover {
    color: #fff !important;
    background-color: rgba(255,255,255,0.1);
}

.nav-link.active {
    color: #fff !important;
    background-color: rgba(255,255,255,0.2);
    pointer-events: none;
    opacity: 0.9;
}

/* Dropdown Styles */
#userGreetingDropdown {
    border-color: rgba(255, 255, 255, 0.5);
    color: #fff;
    transition: all 0.2s;
    padding: 0.375rem 0.75rem;
}

#userGreetingDropdown:hover {
    border-color: #fff;
    background-color: rgba(255, 255, 255, 0.1);
}

#userGreetingDropdown[aria-expanded="true"] {
    border-color: #fff;
    background-color: rgba(255, 255, 255, 0.2);
}

.dropdown-menu {
    box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
    border: none;
    margin-top: 0.5rem;
}

.dropdown-item {
    padding: 0.5rem 1rem;
    transition: all 0.2s;
}

.dropdown-item i {
    width: 1.25rem;
    text-align: center;
}

.dropdown-item:hover {
    background-color: #f8f9fa;
}

.dropdown-item.text-danger:hover {
    background-color: #dc3545;
    color: #fff !important;
}

/* Card Styles */
.card {
    border: none;
    box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.075);
    border-radius: 0.5rem;
    margin-bottom: 1rem;
}

.card-header {
    background-color: #fff;
    border-bottom: 1px solid rgba(0,0,0,0.125);
    padding: 1rem;
}

.card-body {
    padding: 1.5rem;
}

/* Loading Spinner */
.spinner-border {
    width: 3rem;
    height: 3rem;
}

/* Avatar Styles */
.avatar-circle {
    width: 100px;
    height: 100px;
    background-color: #8B0000;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    font-weight: bold;
    margin: 0 auto;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* Alert Styles */
.alert {
    border: none;
    border-radius: 0.5rem;
    padding: 1rem;
    margin-bottom: 1rem;
}

.alert-success {
    background-color: #d1e7dd;
    color: #0f5132;
}

.alert-danger {
    background-color: #f8d7da;
    color: #842029;
}

.alert-warning {
    background-color: #fff3cd;
    color: #997404;
}

.alert-info {
    background-color: #cff4fc;
    color: #055160;
}

/* List Group Styles */
.list-group-item {
    border: none;
    padding: 0.75rem 1rem;
    margin-bottom: 0.25rem;
    border-radius: 0.5rem !important;
    transition: all 0.2s;
}

.list-group-item:hover {
    background-color: #f8f9fa;
}

.list-group-item.active {
    background-color: #0d6efd;
    color: #fff;
}

.list-group-item.active:hover {
    background-color: #0b5ed7;
}

/* Form Styles */
.form-control {
    border-radius: 0.375rem;
    border: 1px solid #ced4da;
    padding: 0.5rem 0.75rem;
}

.form-control:focus {
    border-color: #86b7fe;
    box-shadow: 0 0 0 0.25rem rgba(13,110,253,0.25);
}

.input-group-text {
    background-color: #e9ecef;
    border: 1px solid #ced4da;
}

/* Progress Bar */
.progress {
    background-color: #e9ecef;
    border-radius: 0.375rem;
    overflow: hidden;
}

.progress-bar {
    transition: width 0.3s ease;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
    body {
        padding-top: 56px;
    }
    
    .navbar-brand {
        font-size: 1rem;
    }
    
    .card-body {
        padding: 1rem;
    }
    
    #userGreetingDropdown {
        width: 100%;
        justify-content: space-between;
    }
}

/* Utility Classes */
.cursor-pointer {
    cursor: pointer;
}

.text-truncate-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Animation */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

.fade-in {
    animation: fadeIn 0.3s ease-in;
}"

- js/app-core.js:
"// js/app-core.js - Núcleo do SPA (CORRIGIDO)
import { checkAuth } from './auth-check.js';
import { loadNavbar } from './auth-check.js';

class AppCore {
    constructor() {
        if (!window.location.pathname.includes('app.html')) {
            console.log(`🚫 Página independente, ignorando SPA`);
            return null;
        }
        
        this.currentPage = 'dashboard';
    }
    
    async init() {
        if (!window.location.pathname.includes('app.html')) {
            return;
        }
        
        try {
            // checkAuth retorna objeto com userData e cpf
            const result = await checkAuth(3);
            
            const userData = result.userData;
            const cpf = result.cpf; // APENAS CPF
            
            console.log('📦 Dados recebidos:', { 
                nome: userData.nome, 
                nivel: userData.nivel,
                cpf: cpf 
            });
            
            // SALVAR APENAS CPF
            sessionStorage.setItem('userCPF', cpf);
            sessionStorage.setItem('userName', userData.nome);
            sessionStorage.setItem('userNivel', userData.nivel || 3);
            
            await loadNavbar();
            
            this.setupNavbar();
            await this.loadPage('dashboard.html');
            
        } catch (error) {
            console.error('❌ Erro ao inicializar SPA:', error);
            this.showError(error);
        }
    }

    setupNavbar() {
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href$=".html"]');
            if (link && !link.hasAttribute('data-ignore-spa')) {
                e.preventDefault();
                const href = link.getAttribute('href');
                this.loadPage(href);
            }
        });
        
        this.setupUserGreeting();
        this.setupDropdown();
    }
    
    setupUserGreeting() {
        const updateGreeting = () => {
            const userName = sessionStorage.getItem('userName') || 'Usuário';
            const cleanName = userName.replace(/\.{3,}/g, '')
                                    .replace(/\s*\(.*\)/g, '')
                                    .trim();
            
            const greeting = document.getElementById('userGreeting');
            if (greeting) {
                greeting.innerHTML = `<span class="text-white">${cleanName}</span>`;
            }
        };
        
        updateGreeting();
        window.updateUserGreetingInSPA = updateGreeting;
    }
    
    setupDropdown() {
        const logoutBtn = document.getElementById('navLogout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Saindo...';
                
                try {
                    const { auth } = await import('./firebase-config.js');
                    const { signOut } = await import("https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js");
                    
                    await signOut(auth);
                    sessionStorage.clear();
                    localStorage.clear();
                    window.location.href = 'index.html';
                } catch (error) {
                    console.error('Erro no logout:', error);
                    sessionStorage.clear();
                    localStorage.clear();
                    window.location.href = 'index.html';
                }
            });
        }
        
        const profileBtn = document.getElementById('navProfile');
        if (profileBtn) {
            profileBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadPage('perfil.html');
            });
        }
    }
    
    getLoadingHTML(pageUrl) {
        const pageName = pageUrl.replace('.html', '')
            .replace(/^\//, '')
            .replace(/\//g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        
        return `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="card mt-4">
                            <div class="card-body text-center py-5">
                                <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;"></div>
                                <h4>Carregando ${pageName}...</h4>
                                <p class="text-muted mt-2">Por favor, aguarde.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getErrorHTML(error, pageUrl) {
        return `
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12">
                        <div class="card mt-4">
                            <div class="card-body text-center py-5">
                                <div class="alert alert-danger">
                                    <h4 class="alert-heading">
                                        <i class="fas fa-exclamation-triangle me-2"></i>
                                        Erro ao carregar página
                                    </h4>
                                    <p><strong>${pageUrl}</strong></p>
                                    <hr>
                                    <p class="mb-0">${error.message}</p>
                                    <div class="mt-3">
                                        <button class="btn btn-primary me-2" onclick="window.app.loadPage('${pageUrl}')">
                                            <i class="fas fa-redo me-1"></i>Tentar novamente
                                        </button>
                                        <button class="btn btn-outline-secondary" onclick="window.app.loadPage('dashboard.html')">
                                            <i class="fas fa-home me-1"></i>Dashboard
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    async loadPage(pageUrl) {
        if (this.currentPage === pageUrl) return;
        
        const contentDiv = document.getElementById('app-content');
        if (!contentDiv) return;
        
        try {
            contentDiv.innerHTML = this.getLoadingHTML(pageUrl);
            
            const response = await fetch(pageUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const html = await response.text();
            
            if (pageUrl === 'base.html' || pageUrl === 'perfil.html') {
                await this.loadSpecialPage(html, pageUrl);
            } else {
                const pageContent = this.extractContent(html, pageUrl);
                contentDiv.innerHTML = pageContent;
                
                if (pageUrl === 'dashboard.html') {
                    await this.loadDashboardScript();
                }
            }
            
            this.currentPage = pageUrl;
            this.updateActiveNav(pageUrl);
            
        } catch (error) {
            console.error(`❌ Erro ao carregar ${pageUrl}:`, error);
            contentDiv.innerHTML = this.getErrorHTML(error, pageUrl);
        }
    }
    
    async loadSpecialPage(html, pageUrl) {
        const contentDiv = document.getElementById('app-content');
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const navbar = doc.querySelector('#navbar');
        if (navbar) navbar.remove();
        
        const mainContent = doc.querySelector('main');
        if (mainContent) {
            contentDiv.innerHTML = mainContent.innerHTML;
            
            if (pageUrl === 'base.html') {
                await this.loadBaseScript();
            } else if (pageUrl === 'perfil.html') {
                await this.loadPerfilScript();
            }
        } else {
            contentDiv.innerHTML = '<div class="alert alert-danger">Erro: Conteúdo não encontrado</div>';
        }
    }
    
    async loadBaseScript() {
        try {
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const baseModule = await import('./base.js');
            
            if (baseModule && baseModule.initBaseSPA) {
                await baseModule.initBaseSPA();
            } else if (baseModule && baseModule.initBase) {
                await baseModule.initBase();
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar base:', error);
            this.showError(error);
        }
    }
    
    async loadPerfilScript() {
        try {
            await new Promise(resolve => setTimeout(resolve, 200));
            
            const perfilModule = await import('./perfil.js');
            
            if (perfilModule && perfilModule.initPerfilSPA) {
                await perfilModule.initPerfilSPA();
            } else if (perfilModule && perfilModule.initPerfil) {
                await perfilModule.initPerfil();
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar perfil:', error);
            this.showError(error);
        }
    }
    
    async loadDashboardScript() {
        try {
            const dashboardModule = await import('./dashboard.js');
            
            if (dashboardModule && dashboardModule.initDashboard) {
                await dashboardModule.initDashboard();
            } else {
                this.executeDashboardFallback();
            }
            
        } catch (error) {
            console.error('❌ Erro ao carregar dashboard:', error);
            this.executeDashboardFallback();
        }
    }
    
    executeDashboardFallback() {
        const userCPF = sessionStorage.getItem('userCPF') || '000000';
        const userName = sessionStorage.getItem('userName') || 'Usuário';
        const cleanName = userName.replace(/\.{3,}/g, '').replace(/\s*\(.*\)/g, '').trim();
        
        const dashboardContent = document.querySelector('#dashboard-content') || 
                                document.querySelector('.card-body');
        
        if (dashboardContent) {
            dashboardContent.innerHTML = `
                <h1 class="display-4 mb-4">Olá, ${cleanName}!</h1>
                <div class="alert alert-success" role="alert">
                    <h4 class="alert-heading">Bem-vindo ao Sistema</h4>
                    <p>Dashboard carregado via Single Page Application.</p>
                    <hr>
                    <div class="mb-0">
                        <div class="row mb-2">
                            <div class="col-md-6">
                                <strong><i class="fas fa-id-card me-1"></i>CPF:</strong> ${userCPF}
                            </div>
                            <div class="col-md-6">
                                <strong><i class="fas fa-shield-alt me-1"></i>Nível:</strong> 
                                <span class="badge bg-secondary">Carregando...</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mt-3">
                    <button class="btn btn-primary me-2" onclick="window.app.loadPage('base.html')">
                        <i class="fas fa-code me-1"></i>Ver Base
                    </button>
                    <button class="btn btn-outline-secondary" onclick="window.app.loadPage('dashboard.html')">
                        <i class="fas fa-redo me-1"></i>Recarregar
                    </button>
                </div>
            `;
        }
    }
    
    extractContent(html, pageUrl) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const elementsToRemove = [
            '#navbar',
            'nav',
            '.navbar',
            'script[src*="navbar"]',
            'link[href*="navbar"]',
            'script[src*="firebase-config"]',
            'script[src*="auth-check"]'
        ];
        
        elementsToRemove.forEach(selector => {
            doc.querySelectorAll(selector).forEach(el => el.remove());
        });
        
        if (pageUrl === 'dashboard.html') {
            const cardBody = doc.querySelector('.card-body');
            if (cardBody) {
                return `
                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-12">
                                <div class="card mt-3">
                                    <div class="card-body" id="dashboard-content">
                                        ${cardBody.innerHTML}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
        
        const mainContent = doc.querySelector('main, .container-fluid');
        return mainContent ? mainContent.innerHTML : doc.body.innerHTML;
    }
    
    updateActiveNav(pageUrl) {
        document.querySelectorAll('a[href$=".html"]').forEach(link => {
            const href = link.getAttribute('href');
            const isActive = href === pageUrl;
            
            link.classList.toggle('active', isActive);
            
            if (isActive) {
                link.style.pointerEvents = 'none';
                link.style.opacity = '0.7';
                link.style.color = '#fff';
            } else {
                link.style.pointerEvents = 'auto';
                link.style.opacity = '1';
                link.style.color = 'rgba(255, 255, 255, 0.8)';
            }
        });
        
        if (window.updateNavbarActiveMenu) {
            window.updateNavbarActiveMenu(pageUrl);
        }
    }
    
    showError(error) {
        const contentDiv = document.getElementById('app-content');
        if (contentDiv) {
            contentDiv.innerHTML = `
                <div class="alert alert-danger m-4">
                    <h4>Erro de Autenticação</h4>
                    <p>${error.message}</p>
                    <a href="index.html" class="btn btn-primary">
                        Voltar ao Login
                    </a>
                </div>
            `;
        }
    }
}

if (window.location.pathname.includes('app.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        window.app = new AppCore();
        
        if (window.app) {
            window.app.init();
        }
    });
}

export default AppCore;"

- js/auth-check.js:
"// js/auth-check.js - Verificação de Autenticação com CPF (APENAS CPF)
import { auth } from './firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { database } from './firebase-config.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Função utilitária para formatar CPF (garantir 11 dígitos)
function formatarCPF(cpf) {
    if (!cpf) return null;
    let cpfLimpo = cpf.toString().replace(/\D/g, '');
    return cpfLimpo.padStart(11, '0');
}

// Verificar autenticação e nível de acesso
export function checkAuth(requiredLevel = 3) {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                console.log('❌ Usuário não autenticado');
                window.location.href = 'index.html';
                return;
            }

            try {
                // 1. PEGAR SOMENTE O CPF DO SESSION STORAGE (APENAS CPF)
                let userCPF = sessionStorage.getItem('userCPF');
                
                if (!userCPF) {
                    // Se não achou no session, tenta no localStorage como fallback
                    userCPF = localStorage.getItem('userCPF');
                }
                
                if (!userCPF) {
                    console.error('❌ CPF não encontrado no storage');
                    console.log('📦 SessionStorage:', {
                        userCPF: sessionStorage.getItem('userCPF'),
                        userName: sessionStorage.getItem('userName')
                    });
                    throw new Error('CPF não encontrado');
                }

                // 2. FORMATAR CPF (garantir 11 dígitos)
                userCPF = formatarCPF(userCPF);
                
                console.log('🔍 Verificando acesso para CPF:', userCPF);

                // 3. BUSCAR DADOS DO USUÁRIO EM /usuarios/{cpf}
                const usuarioRef = ref(database, `usuarios/${userCPF}`);
                const snapshot = await get(usuarioRef);

                if (!snapshot.exists()) {
                    console.error('❌ Usuário não encontrado em /usuarios/');
                    throw new Error('Dados do usuário não encontrados');
                }

                const userData = snapshot.val();
                console.log('✅ Dados encontrados:', {
                    nome: userData.nome,
                    nivel: userData.nivel,
                    email: userData.email
                });
                
                const userLevel = userData.nivel || 3;
                
                // 4. SALVAR O NÍVEL NO SESSION STORAGE
                sessionStorage.setItem('userNivel', userLevel);
                sessionStorage.setItem('currentUserLevel', userLevel);
                
                // 5. VERIFICAR SE USUÁRIO ESTÁ PENDENTE
                if (userLevel === 0) {
                    alert('❌ Seu cadastro ainda está pendente de aprovação.\n\nAguarde liberação do administrador.');
                    await auth.signOut();
                    clearUserData();
                    window.location.href = 'index.html';
                    reject(new Error('Usuário pendente de aprovação'));
                    return;
                }
                
                // 6. VERIFICAR NÍVEL DE ACESSO (se necessário)
                if (requiredLevel < 3 && userLevel > requiredLevel) {
                    console.log(`🚫 Nível insuficiente: usuário ${userLevel}, necessário ${requiredLevel}`);
                    
                    alert(`🚫 Acesso Negado!\n\nSeu nível de acesso (${userLevel}) não permite esta página.\nNível necessário: ${requiredLevel}`);
                    
                    // Redirecionar para dashboard
                    if (window.location.pathname.includes('app.html')) {
                        if (window.app && window.app.loadPage) {
                            window.app.loadPage('dashboard.html');
                        } else {
                            window.location.href = 'dashboard.html';
                        }
                    } else {
                        window.location.href = 'dashboard.html';
                    }
                    
                    reject(new Error(`Nível insuficiente: ${userLevel} < ${requiredLevel}`));
                    return;
                }
                
                // 7. TUDO OK! Resolver com os dados
                resolve({ 
                    user, 
                    userData, 
                    cpf: userCPF // APENAS CPF, sem compatibilidade com RE
                });
                
            } catch (error) {
                console.error('💥 Erro ao verificar acesso:', error.message);
                
                if (!error.message.includes('Nível insuficiente') && 
                    !error.message.includes('pendente')) {
                    alert('Erro ao verificar permissões. Faça login novamente.');
                    clearUserData();
                    window.location.href = 'index.html';
                }
                reject(error);
            }
        });
    });
}

// Limpar dados do usuário (APENAS CPF)
function clearUserData() {
    sessionStorage.removeItem('userCPF');
    sessionStorage.removeItem('userName');
    sessionStorage.removeItem('userNivel');
    sessionStorage.removeItem('currentUserLevel');
    localStorage.removeItem('userCPF');
    localStorage.removeItem('userName');
}

// Carregar navbar
export async function loadNavbar() {
    const existingNavbar = document.getElementById('navbar');
    if (existingNavbar && existingNavbar.innerHTML.trim() !== '') {
        console.log('✅ Navbar já carregada');
        return true;
    }
    
    let navbarElement = document.getElementById('navbar');
    if (!navbarElement) {
        navbarElement = document.createElement('div');
        navbarElement.id = 'navbar';
        document.body.insertBefore(navbarElement, document.body.firstChild);
    }
    
    try {
        const response = await fetch('components/navbar.html');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const html = await response.text();
        
        if (navbarElement.innerHTML.trim() === '') {
            navbarElement.innerHTML = html;
            console.log('✅ Navbar carregada no DOM');
        }
        
        // Aguardar um pouco e depois esconder itens por nível
        setTimeout(() => {
            setTimeout(hideNavbarItemsByLevel, 200);
        }, 100);
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao carregar navbar:', error.message);
        
        if (!navbarElement.innerHTML.trim()) {
            navbarElement.innerHTML = createFallbackNavbar();
        }
        
        return false;
    }
}

// Esconder itens da navbar baseado no nível do usuário
async function hideNavbarItemsByLevel() {
    try {
        let userLevel = sessionStorage.getItem('userNivel');
        
        if (!userLevel) {
            let userCPF = sessionStorage.getItem('userCPF');
            if (!userCPF) return;
            
            const usuarioRef = ref(database, `usuarios/${userCPF}`);
            const snapshot = await get(usuarioRef);
            
            if (!snapshot.exists()) return;
            
            const userData = snapshot.val();
            userLevel = userData.nivel || 3;
            sessionStorage.setItem('userNivel', userLevel);
            sessionStorage.setItem('currentUserLevel', userLevel);
        }
        
        console.log(`🎯 Ajustando navbar para nível ${userLevel}...`);
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Converter para número
        userLevel = parseInt(userLevel);
        
        // Nível 3 (usuário normal) - esconder itens restritos
        if (userLevel >= 3) {
            // Esconder Solicitações (se existir)
            hideElement('#navSolicitacoes');
            
            // Esconder Exclusões (se existir)
            hideElement('#navExclusoes');
        }
        
    } catch (error) {
        console.error('❌ Erro ao ajustar navbar:', error);
        setTimeout(hideNavbarItemsByLevel, 1000);
    }
}

// Função auxiliar para esconder elemento
function hideElement(selector, retryCount = 0) {
    const element = document.querySelector(selector);
    if (element) {
        const parentLi = element.closest('li.nav-item');
        if (parentLi) {
            parentLi.style.display = 'none';
            console.log(`👁️ Ocultando menu: ${selector}`);
            return true;
        }
    }
    
    // Se não encontrou, tenta novamente (máx 3 tentativas)
    if (retryCount < 3) {
        setTimeout(() => hideElement(selector, retryCount + 1), 500);
    }
    
    return false;
}

// Navbar de fallback
function createFallbackNavbar() {
    return `
        <nav class="navbar navbar-dark bg-primary fixed-top">
            <div class="container-fluid">
                <span class="navbar-brand">
                    <img src="img/logo.ico" alt="Logo" style="height: 30px; margin-right: 10px;" onerror="this.style.display='none'">
                    Bellagi
                </span>
                <div class="d-flex">
                    <button class="btn btn-outline-light me-2" onclick="window.location.href='dashboard.html'">
                        <i class="fas fa-home"></i>
                    </button>
                    <button class="btn btn-outline-light" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div>
        </nav>
    `;
}

// Função de logout global
window.logout = function() {
    clearUserData();
    auth.signOut().then(() => {
        window.location.href = 'index.html';
    }).catch((error) => {
        console.error('Erro ao fazer logout:', error);
        window.location.href = 'index.html';
    });
};

// Função para obter dados do usuário atual
export async function getCurrentUser() {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (!user) {
                reject(new Error('Usuário não autenticado'));
                return;
            }
            
            try {
                let userCPF = sessionStorage.getItem('userCPF');
                
                if (!userCPF) {
                    userCPF = localStorage.getItem('userCPF');
                }
                
                if (!userCPF) {
                    throw new Error('CPF não encontrado');
                }
                
                userCPF = formatarCPF(userCPF);
                
                const usuarioRef = ref(database, `usuarios/${userCPF}`);
                const snapshot = await get(usuarioRef);
                
                if (!snapshot.exists()) {
                    throw new Error('Usuário não encontrado');
                }
                
                resolve({
                    user,
                    data: snapshot.val(),
                    cpf: userCPF
                });
                
            } catch (error) {
                reject(error);
            }
        });
    });
}

// Exportar funções
export default {
    checkAuth,
    loadNavbar,
    getCurrentUser,
    clearUserData
};"

- js/dashboard.js:
"// js/dashboard.js - Dashboard Principal
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
}"

- js/firebase-config.js:
"// js/firebase-config.js - Configuração Firebase
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

export { app, database, auth };"

- js/index.js:
"// js/index.js - Sistema de Login Completo
import { database, auth } from './firebase-config.js';
import { ref, get, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { signInWithEmailAndPassword, sendPasswordResetEmail, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Funções utilitárias
function formatarCPF(cpf) {
    if (!cpf) return null;
    let cpfLimpo = cpf.toString().replace(/\D/g, '');
    return cpfLimpo.padStart(11, '0');
}

function validarCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    
    if (cpf.length !== 11) return false;
    
    if (/^(\d)\1+$/.test(cpf)) return false;
    
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digito1 = resto > 9 ? 0 : resto;
    
    if (digito1 !== parseInt(cpf.charAt(9))) return false;
    
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digito2 = resto > 9 ? 0 : resto;
    
    return digito2 === parseInt(cpf.charAt(10));
}

function aplicarMascaraCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

function aplicarMascaraCelular(celular) {
    celular = celular.replace(/\D/g, '');
    if (celular.length === 11) {
        return celular.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return celular.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

function aplicarMascaraData(data) {
    data = data.replace(/\D/g, '');
    if (data.length <= 2) {
        return data;
    } else if (data.length <= 4) {
        return data.replace(/(\d{2})(\d+)/, '$1/$2');
    } else {
        return data.replace(/(\d{2})(\d{2})(\d+)/, '$1/$2/$3').substring(0, 10);
    }
}

function validarData(data) {
    if (!data) return false;
    
    const partes = data.split('/');
    if (partes.length !== 3) return false;
    
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]) - 1;
    const ano = parseInt(partes[2]);
    
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return false;
    
    const dataObj = new Date(ano, mes, dia);
    
    return dataObj.getDate() === dia && 
           dataObj.getMonth() === mes && 
           dataObj.getFullYear() === ano &&
           dataObj <= new Date(); // Não permite data futura
}

function formatarDataBR(data) {
    if (!data) return '';
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function formatarDataISO(data) {
    if (!data) return '';
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

function dataStringParaObjeto(dataStr) {
    if (!dataStr) return null;
    const partes = dataStr.split('/');
    if (partes.length !== 3) return null;
    
    const dia = parseInt(partes[0]);
    const mes = parseInt(partes[1]) - 1;
    const ano = parseInt(partes[2]);
    
    const data = new Date(ano, mes, dia);
    
    if (data.getDate() !== dia || data.getMonth() !== mes || data.getFullYear() !== ano) {
        return null;
    }
    
    return data;
}

// Variáveis globais
let userCPF = '';
let userEmail = '';
let userFullName = '';
let userNivel = null;
let selectedDate = null;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let yearSelectOpen = false;

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM - Login
    const cpfInput = document.getElementById('cpfInput');
    const searchCpfBtn = document.getElementById('searchCpfBtn');
    const showRegisterBtn = document.getElementById('showRegisterBtn');
    const passwordStep = document.getElementById('passwordStep');
    const cpfStep = document.getElementById('cpfStep');
    const userNameSpan = document.getElementById('userName');
    const passwordInput = document.getElementById('passwordInput');
    const loginBtn = document.getElementById('loginBtn');
    const backBtn = document.getElementById('backBtn');
    const togglePassword = document.getElementById('togglePassword');
    const forgotPassword = document.getElementById('forgotPassword');
    const errorAlert = document.getElementById('errorAlert');
    const infoAlert = document.getElementById('infoAlert');

    // Elementos DOM - Modal Registro
    const registerModal = document.getElementById('registerModal');
    const registerCpf = document.getElementById('registerCpf');
    const cpfStatus = document.getElementById('cpfStatus');
    const cpfSpinner = document.getElementById('cpfSpinner');
    const registerNome = document.getElementById('registerNome');
    const registerDataNasc = document.getElementById('registerDataNasc');
    const registerCelular = document.getElementById('registerCelular');
    const registerEmail = document.getElementById('registerEmail');
    const registerSenha = document.getElementById('registerSenha');
    const registerConfirmarSenha = document.getElementById('registerConfirmarSenha');
    const btnCriarConta = document.getElementById('btnCriarConta');
    const openCalendarBtn = document.getElementById('openCalendarBtn');

    // Máscara para CPF no passo 1
    if (cpfInput) {
        cpfInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 11);
        });
    }

    // Máscara para data de nascimento
    if (registerDataNasc) {
        registerDataNasc.addEventListener('input', function(e) {
            if (!registerDataNasc.disabled) {
                this.value = aplicarMascaraData(this.value);
                
                if (this.value.length === 10) {
                    const dataObj = dataStringParaObjeto(this.value);
                    if (dataObj && validarData(this.value)) {
                        selectedDate = dataObj;
                        this.classList.remove('is-invalid');
                        this.classList.add('is-valid');
                    } else {
                        selectedDate = null;
                        this.classList.remove('is-valid');
                        this.classList.add('is-invalid');
                    }
                } else {
                    selectedDate = null;
                    this.classList.remove('is-valid', 'is-invalid');
                }
                
                verificarFormularioCompleto();
            }
        });
    }

    // Evento para abrir calendário
    if (openCalendarBtn) {
        openCalendarBtn.addEventListener('click', function() {
            if (!registerNome.disabled) {
                abrirCalendario();
            }
        });
    }

    // Buscar CPF existente
    if (searchCpfBtn) {
        searchCpfBtn.addEventListener('click', async function() {
            const cpf = cpfInput.value.trim();
            
            if (cpf.length !== 11) {
                showError('Por favor, digite um CPF válido de 11 dígitos.');
                return;
            }

            userCPF = formatarCPF(cpf);
            
            searchCpfBtn.disabled = true;
            searchCpfBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Buscando...';

            try {
                // Busca diretamente em /usuarios/{cpf}
                const usuarioRef = ref(database, `usuarios/${userCPF}`);
                const snapshot = await get(usuarioRef);

                if (snapshot.exists()) {
                    const userData = snapshot.val();
                    userEmail = userData.email;
                    userFullName = userData.nome;
                    userNivel = userData.nivel;
                    
                    if (!userEmail) {
                        showError('Email não configurado para este CPF.');
                        return;
                    }
                    
                    // Verifica se o nível é 0 (pendente)
                    if (userNivel === 0) {
                        showError('Seu cadastro ainda está pendente de aprovação. Aguarde liberação do administrador.');
                        searchCpfBtn.disabled = false;
                        searchCpfBtn.innerHTML = '<i class="fas fa-search me-2"></i>Verificar CPF';
                        return;
                    }
                    
                    forgotPassword.classList.remove('d-none');
                    userNameSpan.textContent = userFullName;
                    cpfStep.classList.remove('active');
                    passwordStep.classList.add('active');
                    setTimeout(() => passwordInput.focus(), 300);
                } else {
                    showInfo('CPF não encontrado. Deseja se cadastrar?');
                }
            } catch (error) {
                console.error('Erro ao buscar CPF:', error);
                showError('Erro ao buscar usuário. Tente novamente.');
            } finally {
                searchCpfBtn.disabled = false;
                searchCpfBtn.innerHTML = '<i class="fas fa-search me-2"></i>Verificar CPF';
            }
        });
    }

    // Abrir modal de cadastro
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', function() {
            registerModal.style.display = 'flex';
            registerCpf.focus();
        });
    }

    // Fechar modal
    window.fecharModalRegistro = function() {
        registerModal.style.display = 'none';
        resetRegisterForm();
    };

    // Fechar modal com X
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', fecharModalRegistro);
    }

    // Máscara e validação CPF em tempo real
    let cpfTimeout;
    if (registerCpf) {
        registerCpf.addEventListener('input', async function() {
            let cpf = this.value.replace(/\D/g, '').slice(0, 11);
            this.value = aplicarMascaraCPF(cpf);
            
            clearTimeout(cpfTimeout);
            
            if (cpf.length === 11) {
                if (!validarCPF(cpf)) {
                    cpfStatus.innerHTML = '<span class="text-danger">❌ CPF inválido</span>';
                    bloquearCamposRegistro(true);
                    return;
                }
                
                cpfSpinner.classList.remove('d-none');
                
                cpfTimeout = setTimeout(async () => {
                    try {
                        const cpfFormatado = formatarCPF(cpf);
                        // Verifica em /usuarios/{cpf} se já existe
                        const usuarioRef = ref(database, `usuarios/${cpfFormatado}`);
                        const snapshot = await get(usuarioRef);
                        
                        cpfSpinner.classList.add('d-none');
                        
                        if (snapshot.exists()) {
                            cpfStatus.innerHTML = '<span class="text-danger">❌ CPF já cadastrado</span>';
                            bloquearCamposRegistro(true);
                        } else {
                            cpfStatus.innerHTML = '<span class="text-success">✓ CPF disponível</span>';
                            bloquearCamposRegistro(false);
                        }
                    } catch (error) {
                        console.error('Erro ao verificar CPF:', error);
                        cpfSpinner.classList.add('d-none');
                        cpfStatus.innerHTML = '<span class="text-danger">Erro ao verificar CPF</span>';
                    }
                }, 500);
            } else {
                cpfStatus.innerHTML = '';
                bloquearCamposRegistro(true);
            }
        });
    }

    // Máscara celular
    if (registerCelular) {
        registerCelular.addEventListener('input', function() {
            this.value = aplicarMascaraCelular(this.value);
        });
    }

    // Validação de senha em tempo real
    function validarSenha(senha) {
        const requisitos = {
            length: senha.length >= 8,
            upper: /[A-Z]/.test(senha),
            lower: /[a-z]/.test(senha),
            number: /[0-9]/.test(senha),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(senha)
        };
        
        const reqLength = document.getElementById('reqLength');
        const reqUpper = document.getElementById('reqUpper');
        const reqLower = document.getElementById('reqLower');
        const reqNumber = document.getElementById('reqNumber');
        const reqSpecial = document.getElementById('reqSpecial');
        
        if (reqLength) reqLength.innerHTML = requisitos.length ? '✅ Mínimo 8 caracteres' : '❌ Mínimo 8 caracteres';
        if (reqUpper) reqUpper.innerHTML = requisitos.upper ? '✅ 1 letra maiúscula' : '❌ 1 letra maiúscula';
        if (reqLower) reqLower.innerHTML = requisitos.lower ? '✅ 1 letra minúscula' : '❌ 1 letra minúscula';
        if (reqNumber) reqNumber.innerHTML = requisitos.number ? '✅ 1 número' : '❌ 1 número';
        if (reqSpecial) reqSpecial.innerHTML = requisitos.special ? '✅ 1 caractere especial' : '❌ 1 caractere especial';
        
        return Object.values(requisitos).every(v => v);
    }

    if (registerSenha) {
        registerSenha.addEventListener('input', function() {
            validarSenha(this.value);
            verificarSenhas();
        });
    }

    if (registerConfirmarSenha) {
        registerConfirmarSenha.addEventListener('input', verificarSenhas);
    }

    function verificarSenhas() {
        const senha = registerSenha ? registerSenha.value : '';
        const confirmar = registerConfirmarSenha ? registerConfirmarSenha.value : '';
        const mismatch = document.getElementById('passwordMismatch');
        const match = document.getElementById('passwordMatch');
        
        if (confirmar.length > 0 && mismatch && match) {
            if (senha === confirmar) {
                mismatch.classList.add('d-none');
                match.classList.remove('d-none');
            } else {
                mismatch.classList.remove('d-none');
                match.classList.add('d-none');
            }
        } else {
            if (mismatch) mismatch.classList.add('d-none');
            if (match) match.classList.add('d-none');
        }
    }

    // Habilitar/desabilitar campos baseado na validação do CPF
    function bloquearCamposRegistro(bloquear) {
        const campos = [
            registerNome, registerDataNasc, registerCelular, 
            registerEmail, registerSenha, registerConfirmarSenha,
            openCalendarBtn
        ];
        
        campos.forEach(campo => {
            if (campo) {
                campo.disabled = bloquear;
            }
        });
        
        if (btnCriarConta) btnCriarConta.disabled = true;
    }

    // Verificar se todos os campos estão válidos para habilitar botão
    function verificarFormularioCompleto() {
        if (!registerNome || !registerDataNasc || !registerCelular || !registerEmail || !registerSenha || !registerConfirmarSenha) {
            return;
        }
        
        const dataValida = registerDataNasc.value.length === 10 && validarData(registerDataNasc.value);
        
        const camposPreenchidos = 
            registerNome.value &&
            (selectedDate || dataValida) &&
            registerCelular.value &&
            registerEmail.value &&
            registerSenha.value &&
            registerConfirmarSenha.value;
        
        const senhasValidas = registerSenha.value === registerConfirmarSenha.value && 
                             validarSenha(registerSenha.value);
        
        const cpfValido = cpfStatus && cpfStatus.innerHTML.includes('CPF disponível');
        
        if (btnCriarConta) {
            btnCriarConta.disabled = !(camposPreenchidos && senhasValidas && cpfValido);
        }
    }

    const camposRegistro = [registerNome, registerDataNasc, registerCelular, registerEmail, registerSenha, registerConfirmarSenha];
    camposRegistro.forEach(campo => {
        if (campo) {
            campo.addEventListener('input', verificarFormularioCompleto);
        }
    });

    // Submit do formulário de cadastro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const cpf = formatarCPF(registerCpf.value);
            const email = registerEmail.value;
            const senha = registerSenha.value;
            const nome = registerNome.value;
            
            let dataNascimento;
            if (selectedDate) {
                dataNascimento = formatarDataISO(selectedDate);
            } else if (registerDataNasc.value.length === 10) {
                const dataObj = dataStringParaObjeto(registerDataNasc.value);
                dataNascimento = formatarDataISO(dataObj);
            }
            
            btnCriarConta.disabled = true;
            btnCriarConta.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Criando conta...';
            
            try {
                // Criar usuário no Firebase Auth
                const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
                
                const timestamp = new Date().toISOString();
                
                // NOVA ESTRUTURA:
                // 1. Criar nó em /usuarios/{cpf} (sem status)
                await set(ref(database, `usuarios/${cpf}`), {
                    nome: nome,
                    telefone: registerCelular.value,
                    dataNascimento: dataNascimento,
                    empresa: '',
                    email: email,
                    nivel: 0,
                    criadoEm: timestamp,
                    authUid: userCredential.user.uid // Referência ao UID do Auth
                });
                
                // 2. Criar nó em /pendenteUsuario/{cpf} (apenas criadoEm)
                await set(ref(database, `pendenteUsuario/${cpf}`), {
                    criadoEm: timestamp
                });
                
                showInfo('Cadastro realizado com sucesso. Aguarde liberação do administrador.');
                fecharModalRegistro();
                
            } catch (error) {
                console.error('Erro ao criar conta:', error);
                let mensagem = 'Erro ao criar conta. ';
                
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        mensagem += 'E-mail já está em uso.';
                        break;
                    case 'auth/invalid-email':
                        mensagem += 'E-mail inválido.';
                        break;
                    case 'auth/weak-password':
                        mensagem += 'Senha muito fraca.';
                        break;
                    default:
                        mensagem += error.message;
                }
                
                showError(mensagem);
            } finally {
                btnCriarConta.disabled = false;
                btnCriarConta.innerHTML = 'Criar Conta';
            }
        });
    }

    function resetRegisterForm() {
        if (registerCpf) registerCpf.value = '';
        if (registerNome) registerNome.value = '';
        if (registerDataNasc) registerDataNasc.value = '';
        if (registerCelular) registerCelular.value = '';
        if (registerEmail) registerEmail.value = '';
        if (registerSenha) registerSenha.value = '';
        if (registerConfirmarSenha) registerConfirmarSenha.value = '';
        if (cpfStatus) cpfStatus.innerHTML = '';
        selectedDate = null;
        currentMonth = new Date().getMonth();
        currentYear = new Date().getFullYear();
        
        bloquearCamposRegistro(true);
    }

    if (backBtn) {
        backBtn.addEventListener('click', function() {
            passwordStep.classList.remove('active');
            cpfStep.classList.add('active');
            passwordInput.value = '';
            cpfInput.focus();
            forgotPassword.classList.add('d-none');
            
            userCPF = '';
            userEmail = '';
            userFullName = '';
            userNivel = null;
        });
    }

    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', async function() {
            const password = passwordInput.value.trim();
            
            if (!password) {
                showError('Por favor, digite sua senha.');
                return;
            }

            if (!userEmail) {
                showError('Erro interno: email não encontrado.');
                return;
            }

            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Entrando...';

            try {
                const userCredential = await signInWithEmailAndPassword(auth, userEmail, password);

                // 🔥 SALVAR APENAS CPF (SEM RE)
                sessionStorage.setItem('userCPF', userCPF);
                sessionStorage.setItem('userName', userFullName);
                
                localStorage.setItem('userCPF', userCPF);
                localStorage.setItem('userName', userFullName);

                console.log('✅ Login realizado. CPF salvo:', userCPF);
                
                window.location.href = 'app.html';
                
            } catch (error) {
                console.error('Erro de login:', error);
                
                let errorMessage = 'Erro ao fazer login. ';
                
                switch (error.code) {
                    case 'auth/invalid-credential':
                    case 'auth/wrong-password':
                    case 'auth/invalid-login-credentials':
                        errorMessage += 'Senha incorreta.';
                        break;
                    case 'auth/user-not-found':
                        errorMessage += 'Usuário não encontrado.';
                        break;
                    case 'auth/too-many-requests':
                        errorMessage += 'Muitas tentativas. Tente novamente mais tarde.';
                        break;
                    default:
                        errorMessage += error.message;
                }
                
                showError(errorMessage);
            } finally {
                loginBtn.disabled = false;
                loginBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Entrar';
            }
        });
    }

    if (forgotPassword) {
        forgotPassword.addEventListener('click', async function(e) {
            e.preventDefault();
            
            if (!userEmail) {
                showInfo('Por favor, verifique seu CPF primeiro.');
                return;
            }
            
            try {
                await sendPasswordResetEmail(auth, userEmail);
                showInfo(`E-mail de recuperação enviado para: ${userEmail}`);
            } catch (error) {
                console.error('Erro ao recuperar senha:', error);
                showError('Erro ao enviar e-mail de recuperação.');
            }
        });
    }

    if (cpfInput) {
        cpfInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchCpfBtn.click();
            }
        });
    }

    if (passwordInput) {
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });
    }

    function showError(message) {
        if (errorAlert) {
            errorAlert.textContent = message;
            errorAlert.classList.remove('d-none');
            infoAlert.classList.add('d-none');
            setTimeout(() => errorAlert.classList.add('d-none'), 5000);
        }
    }

    function showInfo(message) {
        if (infoAlert) {
            infoAlert.textContent = message;
            infoAlert.classList.remove('d-none');
            errorAlert.classList.add('d-none');
            setTimeout(() => infoAlert.classList.add('d-none'), 5000);
        }
    }
});

// Funções do calendário
function abrirCalendario() {
    const calendarModal = document.getElementById('calendarModal');
    if (calendarModal) {
        calendarModal.style.display = 'flex';
        yearSelectOpen = false;
        renderizarCalendario();
    }
}

window.fecharCalendarModal = function() {
    const calendarModal = document.getElementById('calendarModal');
    if (calendarModal) {
        calendarModal.style.display = 'none';
    }
};

window.toggleYearSelect = function() {
    yearSelectOpen = !yearSelectOpen;
    renderizarCalendario();
};

window.selecionarAno = function(ano) {
    currentYear = ano;
    yearSelectOpen = false;
    renderizarCalendario();
};

window.mudarMes = function(direcao) {
    currentMonth += direcao;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderizarCalendario();
};

window.selecionarData = function(ano, mes, dia) {
    selectedDate = new Date(ano, mes, dia);
    const registerDataNasc = document.getElementById('registerDataNasc');
    if (registerDataNasc) {
        registerDataNasc.value = formatarDataBR(selectedDate);
    }
    fecharCalendarModal();
    
    const registerNome = document.getElementById('registerNome');
    if (registerNome) {
        registerNome.dispatchEvent(new Event('input'));
    }
};

function gerarAnos() {
    const anoAtual = new Date().getFullYear();
    const anos = [];
    for (let ano = anoAtual; ano >= 1900; ano--) {
        anos.push(ano);
    }
    return anos;
}

function renderizarCalendario() {
    const container = document.getElementById('calendar-container');
    if (!container) return;
    
    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    let html = '';
    
    if (yearSelectOpen) {
        const anos = gerarAnos();
        html = `
            <div class="calendar-container">
                <div class="calendar-header">
                    <button class="btn btn-outline-secondary btn-sm" onclick="toggleYearSelect()">
                        <i class="fas fa-arrow-left"></i> Voltar
                    </button>
                    <span class="calendar-month-year">Selecione o Ano</span>
                    <div></div>
                </div>
                
                <div class="year-grid">
        `;
        
        anos.forEach(ano => {
            const isSelected = ano === currentYear;
            html += `
                <div class="year-item ${isSelected ? 'selected' : ''}" onclick="selecionarAno(${ano})">
                    ${ano}
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    } else {
        const primeiroDia = new Date(currentYear, currentMonth, 1);
        const ultimoDia = new Date(currentYear, currentMonth + 1, 0);
        
        const diasNoMes = ultimoDia.getDate();
        const diaSemanaInicio = primeiroDia.getDay();
        
        html = `
            <div class="calendar-container">
                <div class="calendar-header">
                    <button class="btn btn-outline-secondary btn-sm" onclick="mudarMes(-1)">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <div class="month-year-selector" onclick="toggleYearSelect()">
                        <span class="calendar-month">${meses[currentMonth]}</span>
                        <span class="calendar-year">${currentYear}</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <button class="btn btn-outline-secondary btn-sm" onclick="mudarMes(1)">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
                
                <div class="calendar-weekdays">
                    <div class="calendar-weekday">Dom</div>
                    <div class="calendar-weekday">Seg</div>
                    <div class="calendar-weekday">Ter</div>
                    <div class="calendar-weekday">Qua</div>
                    <div class="calendar-weekday">Qui</div>
                    <div class="calendar-weekday">Sex</div>
                    <div class="calendar-weekday">Sáb</div>
                </div>
                
                <div class="calendar-days">
        `;
        
        for (let i = 0; i < diaSemanaInicio; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        const hoje = new Date();
        for (let dia = 1; dia <= diasNoMes; dia++) {
            const dataAtual = new Date(currentYear, currentMonth, dia);
            const isHoje = dataAtual.toDateString() === hoje.toDateString();
            const isSelected = selectedDate && dataAtual.toDateString() === selectedDate.toDateString();
            const isFuture = dataAtual > hoje;
            
            let classes = 'calendar-day';
            if (isHoje) classes += ' today';
            if (isSelected) classes += ' selected';
            if (isFuture) classes += ' disabled';
            
            html += `<div class="${classes}" onclick="${!isFuture ? 'selecionarData(' + currentYear + ',' + currentMonth + ',' + dia + ')' : ''}">${dia}</div>`;
        }
        
        html += `
                </div>
                
                <div class="calendar-footer">
                    <div class="calendar-actions">
                        <button class="btn btn-outline-secondary" onclick="fecharCalendarModal()">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

// Efeitos visuais
function criarParticulas() {
    const container = document.querySelector('.login-container');
    if (!container) return;
    
    const numParticulas = 50;
    
    for (let i = 0; i < numParticulas; i++) {
        const particula = document.createElement('div');
        particula.className = 'particula';
        
        particula.style.left = Math.random() * 100 + '%';
        particula.style.top = Math.random() * 100 + '%';
        
        const tamanho = 2 + Math.random() * 6;
        particula.style.width = tamanho + 'px';
        particula.style.height = tamanho + 'px';
        
        particula.style.animationDelay = Math.random() * 10 + 's';
        particula.style.animationDuration = (6 + Math.random() * 9) + 's';
        
        container.appendChild(particula);
    }
}

function criarEfeitos() {
    const container = document.querySelector('.login-container');
    if (!container) return;
    
    const onda1 = document.createElement('div');
    onda1.className = 'onda';
    container.appendChild(onda1);
    
    const onda2 = document.createElement('div');
    onda2.className = 'onda onda2';
    container.appendChild(onda2);
    
    const anel1 = document.createElement('div');
    anel1.className = 'anel anel1';
    container.appendChild(anel1);
    
    const anel2 = document.createElement('div');
    anel2.className = 'anel anel2';
    container.appendChild(anel2);
    
    const anel3 = document.createElement('div');
    anel3.className = 'anel anel3';
    container.appendChild(anel3);
    
    const brilho = document.createElement('div');
    brilho.className = 'brilhoFundo';
    container.appendChild(brilho);
    
    const linha1 = document.createElement('div');
    linha1.className = 'linhaDourada linha1';
    container.appendChild(linha1);
    
    const linha2 = document.createElement('div');
    linha2.className = 'linhaDourada linha2';
    container.appendChild(linha2);
    
    const linha3 = document.createElement('div');
    linha3.className = 'linhaDourada linha3';
    container.appendChild(linha3);
}

document.addEventListener('DOMContentLoaded', function() {
    criarParticulas();
    criarEfeitos();
});

window.fecharModalRegistro = function() {
    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
        registerModal.style.display = 'none';
    }
};"

- js/navbar.js:
"// js/navbar.js - Controle da Navbar
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
export { updateUserGreeting };"