import { database } from './firebase-config.js';
import { checkAuth } from './auth-check.js';
import { ref, get, set, remove } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { getSumUpTerminalConfig, startSumUpMachinePayment } from './sumup-terminal.js';

const UNKNOWN_CUSTOMER_DOCUMENT = '99999999999';
const UNKNOWN_CUSTOMER_NAME = 'N\u00e3o informado';
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function getById(id) {
    return document.getElementById(id);
}

function onlyDigits(value) {
    return String(value || '').replace(/\D/g, '');
}

function normalizeText(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

function formatBRL(value) {
    return currencyFormatter.format(Number(value || 0));
}

function formatCurrencyInput(value) {
    const digits = onlyDigits(value);
    if (!digits) return '';
    const amount = Number(digits || 0) / 100;
    return formatBRL(amount);
}

function parseCurrencyInput(value) {
    const digits = onlyDigits(value);
    return Number(digits || 0) / 100;
}

function formatDecimalInput(value) {
    const normalized = String(value || '')
        .replace('.', ',')
        .replace(/[^0-9,]/g, '');

    const parts = normalized.split(',');
    if (parts.length <= 1) return parts[0];
    return `${parts.shift()},${parts.join('')}`;
}

function roundToCents(value) {
    return Math.round(Number(value || 0) * 100) / 100;
}

function calculateQtdeEstoque(qtdeVenda, qtdeEcom, qtdeConsignado, qtdeSaidaAdm = 0, qtdeSaidaEcom = 0, qtdeSaidaConsig = 0) {
    return Number(qtdeVenda || 0)
        - Number(qtdeEcom || 0)
        - Number(qtdeConsignado || 0)
        - Number(qtdeSaidaAdm || 0)
        - Number(qtdeSaidaEcom || 0)
        - Number(qtdeSaidaConsig || 0);
}

function parseDecimalInput(value) {
    const normalized = String(value || '').replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
}

function pad2(value) {
    return String(value).padStart(2, '0');
}

function buildSaleCode(date = new Date()) {
    return `${date.getFullYear()}${pad2(date.getMonth() + 1)}${pad2(date.getDate())}${pad2(date.getHours())}${pad2(date.getMinutes())}`;
}

function addMonths(date, monthsToAdd) {
    const base = new Date(date.getFullYear(), date.getMonth(), 1);
    base.setMonth(base.getMonth() + monthsToAdd);
    return base;
}

function formatDocument(value) {
    const digits = onlyDigits(value);

    if (digits.length <= 11) {
        return digits
            .replace(/^(\d{3})(\d)/, '$1.$2')
            .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1-$2')
            .slice(0, 14);
    }

    return digits
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .slice(0, 18);
}

function normalizeName(value) {
    return String(value || '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase()
        .split(' ')
        .map((part) => part ? part[0].toUpperCase() + part.slice(1) : '')
        .join(' ');
}

function formatWhatsapp(value) {
    const digits = onlyDigits(value).slice(0, 11);

    if (digits.length <= 2) return digits ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function normalizeEmail(value) {
    return String(value || '').trim().toLowerCase();
}

function isValidEmail(value) {
    const email = normalizeEmail(value);
    const atIndex = email.indexOf('@');
    if (atIndex <= 0) return false;
    const dotAfterAt = email.indexOf('.', atIndex + 1);
    return dotAfterAt > atIndex + 1 && dotAfterAt < email.length - 1;
}

function setStatus(message, type = 'muted') {
    const el = getById('pdvClienteStatus');
    if (!el) return;

    const colors = {
        muted: 'rgba(255, 255, 255, 0.65)',
        success: '#7ee787',
        warning: '#ffcc66',
        danger: '#ff8a8a'
    };

    el.textContent = message;
    el.style.color = colors[type] || colors.muted;
}

function fillCustomer({ documento = '', nome = '' } = {}) {
    const documentInput = getById('pdvClienteDocumento');
    const nameInput = getById('pdvClienteNome');

    if (documentInput) documentInput.value = documento ? formatDocument(documento) : '';
    if (nameInput) nameInput.value = nome || '';
}

function createMockProducts() {
    return [
        {
            key: 'DRM001',
            codigo: 'DRM001',
            descricao: 'Camiseta DreamRocket Preta',
            tipo: 'Camiseta',
            material: 'Algodao',
            sexo: 'Unissex',
            tamanho: 'M',
            precoVenda: 79.9,
            qtdeEstoque: 15,
            availableStock: 15,
            sourcePath: 'produtos/DRM001',
            stockField: 'qtdeEstoque'
        },
        {
            key: 'DRM002',
            codigo: 'DRM002',
            descricao: 'Caneca Mission Control',
            tipo: 'Caneca',
            material: 'Ceramica',
            sexo: 'Unissex',
            tamanho: '350ml',
            precoVenda: 39.9,
            qtdeEstoque: 24,
            availableStock: 24,
            sourcePath: 'produtos/DRM002',
            stockField: 'qtdeEstoque'
        },
        {
            key: 'DRM003',
            codigo: 'DRM003',
            descricao: 'Boné Launch Team',
            tipo: 'Bone',
            material: 'Sarja',
            sexo: 'Unissex',
            tamanho: 'Ajustavel',
            precoVenda: 59.9,
            qtdeEstoque: 9,
            availableStock: 9,
            sourcePath: 'produtos/DRM003',
            stockField: 'qtdeEstoque'
        },
        {
            key: 'DRM004',
            codigo: 'DRM004',
            descricao: 'Garrafa Térmica Orbit',
            tipo: 'Garrafa',
            material: 'Inox',
            sexo: 'Unissex',
            tamanho: '500ml',
            precoVenda: 89.9,
            qtdeEstoque: 12,
            availableStock: 12,
            sourcePath: 'produtos/DRM004',
            stockField: 'qtdeEstoque'
        },
        {
            key: 'DRM005',
            codigo: 'DRM005',
            descricao: 'Adesivo Foguete Pack',
            tipo: 'Adesivo',
            material: 'Vinil',
            sexo: 'Unissex',
            tamanho: 'Kit',
            precoVenda: 19.9,
            qtdeEstoque: 40,
            availableStock: 40,
            sourcePath: 'produtos/DRM005',
            stockField: 'qtdeEstoque'
        }
    ];
}

function safeStorageGet(key) {
    try {
        return window.localStorage.getItem(key);
    } catch (error) {
        console.warn('Nao foi possivel ler localStorage:', error);
        return null;
    }
}

function safeStorageSet(key, value) {
    try {
        window.localStorage.setItem(key, value);
    } catch (error) {
        console.warn('Nao foi possivel gravar localStorage:', error);
    }
}

class PDVPage {
    constructor() {
        this.documentInput = getById('pdvClienteDocumento');
        this.nameInput = getById('pdvClienteNome');
        this.unknownCheckbox = getById('pdvClienteNaoInformar');
        this.suggestionsEl = getById('pdvClienteSuggestions');

        this.productSearchInput = getById('pdvBusca');
        this.scannerModeBtn = getById('pdvScannerModeBtn');
        this.keyboardModeBtn = getById('pdvKeyboardModeBtn');
        this.productResultsEl = getById('pdvBuscaResultados');
        this.productInfoEl = getById('pdvBuscaInfo');

        this.cartEmptyEl = getById('pdvCartEmpty');
        this.cartItemsEl = getById('pdvCartItems');
        this.subtotalEl = getById('pdvSubtotal');
        this.totalEl = getById('pdvTotal');
        this.discountValueInput = getById('pdvDescontoValor');
        this.discountPercentInput = getById('pdvDescontoPercentual');
        this.fullscreenBtn = getById('pdvFullscreenBtn');
        this.paymentOpenBtn = getById('pdvOpenPaymentBtn');
        this.screenEl = document.querySelector('.pdv-screen');
        this.mainSectionEl = document.querySelector('.pdv-main');
        this.summaryEl = document.querySelector('.pdv-summary');

        this.modalEl = getById('clienteCadastroModal');
        this.modalDocumentInput = getById('modalClienteDocumento');
        this.modalNameInput = getById('modalClienteNome');
        this.modalBirthdateInput = getById('modalClienteDataNascimento');
        this.modalWhatsappInput = getById('modalClienteWhatsapp');
        this.modalEmailInput = getById('modalClienteEmail');
        this.modalSaveButton = getById('salvarClienteBtn');
        this.modalFeedback = getById('clienteCadastroFeedback');
        this.paymentModalEl = getById('pdvPagamentoModal');
        this.paymentFeedbackEl = getById('pdvPagamentoFeedback');
        this.paymentTotalEl = getById('pdvPagamentoValorTotal');
        this.paymentPaidEl = getById('pdvPagamentoValorPago');
        this.paymentBalanceEl = getById('pdvPagamentoSaldo');
        this.paymentAmountInput = getById('pdvPagamentoValor');
        this.paymentInstallmentsInput = getById('pdvPagamentoParcelas');
        this.paymentInterestInput = getById('pdvPagamentoJuros');
        this.chargeModeButtons = Array.from(document.querySelectorAll('[data-charge-mode]'));
        this.chargeModeInfoEl = getById('pdvChargeModeInfo');
        this.machinePaymentControlsEl = getById('pdvMachinePaymentControls');
        this.machineMethodSelect = getById('pdvMaquininhaForma');
        this.machineInstallmentsFieldEl = getById('pdvMachineInstallmentsField');
        this.machineInstallmentsInput = getById('pdvMaquininhaParcelas');
        this.manualPaymentControlsEl = getById('pdvManualPaymentControls');
        this.installmentFieldsEl = getById('pdvParceladoFields');
        this.installmentsTableWrapperEl = getById('pdvParcelasTabelaWrapper');
        this.installmentsTableBody = getById('pdvParcelasTabelaBody');
        this.cancelSaleBtn = getById('pdvCancelarVendaBtn');
        this.markPendingBtn = getById('pdvMarcarPendenteBtn');
        this.paymentSubmitBtn = getById('pdvEnviarPagamentoBtn');
        this.paymentTypeButtons = Array.from(document.querySelectorAll('[data-payment-type]'));
        this.paymentMethodButtons = Array.from(document.querySelectorAll('[data-payment-method]'));
        this.saleSuccessModalEl = getById('pdvVendaConcluidaModal');
        this.saleSuccessCloseBtn = getById('pdvFecharVendaConcluidaBtn');

        this.pendingDocument = '';
        this.allCustomers = [];
        this.modalBackdrop = null;
        this.modalSaved = false;

        this.products = [];
        this.filteredProducts = [];
        this.referenceLists = {};
        this.cart = [];
        this.searchMode = 'scanner';
        this.scannerIdleTimeout = null;
        this.handleViewportResize = () => this.syncViewportLayout();
        this.discountValue = 0;
        this.discountPercent = 0;
        this.currentSaleCode = '';
        this.paymentData = {};
        this.operatorCpf = '';
        this.selectedChargeMode = 'manual';
        this.selectedPaymentType = 'avista';
        this.selectedPaymentMethod = 'pix';
        this.selectedMachineMethod = 'credito';
        this.lastSavedInterests = {
            pix: 0,
            cartao: 0
        };
        this.saleSuccessTimeout = null;
        this.shouldResetOnSuccessModalClose = false;
        this.saleItemsRegistered = false;
    }

    async init() {
        const authResult = await checkAuth(3);
        this.operatorCpf = onlyDigits(authResult?.cpf || sessionStorage.getItem('userCPF') || '');
        this.loadChargeModePreference();
        document.body.classList.remove('auth-pending');
        await Promise.all([
            this.loadCustomers(),
            this.loadReferenceLists(),
            this.loadProducts(),
            this.loadPaymentDefaults()
        ]);
        if (this.paymentInstallmentsInput && !this.paymentInstallmentsInput.value) {
            this.paymentInstallmentsInput.value = '1';
        }
        this.setupListeners();
        this.updateChargeModeUI();
        this.updatePaymentModeUI();
        this.syncDiscountInputs('value');
        this.renderProductResults();
        this.renderCart();
        this.renderPaymentSummary();
        this.renderInstallmentsPreview();
        this.updatePendingButtonState();
        this.updateFullscreenButton();
        this.syncViewportLayout();
        window.setTimeout(() => this.syncViewportLayout(), 0);
        setStatus('Informe um CPF ou CNPJ para localizar o cliente.');
    }

    getChargeModeStorageKey() {
        return `pdvChargeMode:${this.operatorCpf || 'anonimo'}`;
    }

    loadChargeModePreference() {
        const stored = safeStorageGet(this.getChargeModeStorageKey());
        this.selectedChargeMode = stored === 'maquininha' ? 'maquininha' : 'manual';
    }

    persistChargeModePreference() {
        safeStorageSet(this.getChargeModeStorageKey(), this.selectedChargeMode);
    }

    async loadPaymentDefaults() {
        try {
            const [pixSnapshot, cartaoSnapshot] = await Promise.all([
                get(ref(database, 'financeiro/jurosPix')),
                get(ref(database, 'financeiro/jurosCartao'))
            ]);

            this.lastSavedInterests.pix = parseDecimalInput(formatDecimalInput(pixSnapshot.val())) ?? 0;
            this.lastSavedInterests.cartao = parseDecimalInput(formatDecimalInput(cartaoSnapshot.val())) ?? 0;
            this.syncPaymentInterestDefault();
        } catch (error) {
            console.error('Erro ao carregar juros padrao:', error);
            this.lastSavedInterests.pix = 0;
            this.lastSavedInterests.cartao = 0;
            this.syncPaymentInterestDefault();
        }
    }

    async loadCustomers() {
        try {
            const snapshot = await get(ref(database, 'clientes'));
            const data = snapshot.val() || {};

            this.allCustomers = Object.entries(data)
                .map(([documento, customer]) => ({
                    documento: onlyDigits(documento),
                    nome: customer?.nome || customer?.name || ''
                }))
                .filter((customer) => customer.documento)
                .sort((a, b) => String(a.nome || '').localeCompare(String(b.nome || ''), 'pt-BR', { sensitivity: 'base' }));
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
            this.allCustomers = [];
        }
    }

    async loadReferenceLists() {
        await Promise.all([
            this.loadReferenceList('tipo'),
            this.loadReferenceList('material'),
            this.loadReferenceList('sexo'),
            this.loadReferenceList('tamanho')
        ]);
    }

    async loadReferenceList(nodeName) {
        try {
            const snapshot = await get(ref(database, nodeName));
            const data = snapshot.val() || {};
            const codeToTitle = {};
            const titlesSet = new Set();

            Object.entries(data).forEach(([title, code]) => {
                const label = String(title || '').trim();
                const codeStr = code != null ? String(code).trim() : '';
                if (!label) return;
                titlesSet.add(label);
                if (codeStr) codeToTitle[codeStr] = label;
            });

            this.referenceLists[nodeName] = { titlesSet, codeToTitle };
        } catch (error) {
            console.error(`Erro ao carregar lista ${nodeName}:`, error);
            this.referenceLists[nodeName] = { titlesSet: new Set(), codeToTitle: {} };
        }
    }

    getReferenceLabel(nodeName, value) {
        const normalized = String(value || '').trim();
        const refData = this.referenceLists[nodeName];
        if (!normalized || !refData) return normalized;
        if (refData.titlesSet?.has(normalized)) return normalized;
        return refData.codeToTitle?.[normalized] || normalized;
    }

    getProductDescription(product) {
        return [
            this.getReferenceLabel('tipo', product.tipo),
            this.getReferenceLabel('material', product.material),
            this.getReferenceLabel('sexo', product.sexo),
            this.getReferenceLabel('tamanho', product.tamanho),
            product.descricao
        ].filter(Boolean).join(' ');
    }

    getFirstProductImage(product) {
        const links = Object.values(product?.link_prod || {}).filter(Boolean);
        return links[0] || '';
    }

    getProductStock(product) {
        if (product.availableStock != null) return Number(product.availableStock);
        if (product.stock != null) return Number(product.stock);
        if (product.qtdeEstoque != null) return Number(product.qtdeEstoque);
        return calculateQtdeEstoque(
            product.qtdeVenda,
            product.qtdeEcom,
            product.qtdeConsignado,
            product.qtdeSaidaAdm,
            product.qtdeSaidaEcom,
            product.qtdeSaidaConsig
        );
    }

    appendMockProducts(products) {
        const catalog = new Map(
            (products || []).map((product) => [String(product.codigo || product.key || ''), product])
        );

        createMockProducts().forEach((product) => {
            const code = String(product.codigo || product.key || '');
            if (!catalog.has(code)) {
                catalog.set(code, product);
            }
        });

        return Array.from(catalog.values());
    }

    async loadProducts() {
        try {
            const userLevel = Number(sessionStorage.getItem('currentUserLevel') || 3);
            const userCPF = onlyDigits(sessionStorage.getItem('userCPF') || '');
            const isConsignadoUser = userLevel === 3 && !!userCPF;
            const productsPath = isConsignadoUser
                ? `consignado/${userCPF}/emPosse/produtos`
                : 'produtos';

            const snapshot = await get(ref(database, productsPath));
            const data = snapshot.val() || {};

            this.products = this.appendMockProducts(Object.entries(data)
                .filter(([key]) => key !== 'link_prod')
                .map(([key, value]) => {
                    const product = { key, ...(value || {}) };
                    const code = String(product.codigo || key || '');
                    const availableStock = isConsignadoUser
                        ? Number(product.qtdeConsignado || 0)
                        : Number(product.qtdeEstoque ?? calculateQtdeEstoque(
                            product.qtdeVenda,
                            product.qtdeEcom,
                            product.qtdeConsignado,
                            product.qtdeSaidaAdm,
                            product.qtdeSaidaEcom,
                            product.qtdeSaidaConsig
                        ));

                    return {
                        ...product,
                        codigo: code,
                        sourcePath: isConsignadoUser
                            ? `consignado/${userCPF}/emPosse/produtos/${code}`
                            : `produtos/${code}`,
                        stockField: isConsignadoUser ? 'qtdeConsignado' : 'qtdeEstoque',
                        availableStock
                    };
                }))
                .sort((a, b) => {
                    const codeA = String(a.codigo || a.key || '');
                    const codeB = String(b.codigo || b.key || '');
                    return codeA.localeCompare(codeB, 'pt-BR', { numeric: true, sensitivity: 'base' });
                });

            this.filteredProducts = [];
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            this.products = this.appendMockProducts([]);
            this.filteredProducts = [];
        }
    }

    setupListeners() {
        this.setupCustomerListeners();
        this.setupProductListeners();
        this.setupSummaryListeners();
        this.setupPaymentListeners();
        window.addEventListener('resize', this.handleViewportResize);
        window.addEventListener('orientationchange', this.handleViewportResize);
        window.visualViewport?.addEventListener('resize', this.handleViewportResize);
        document.addEventListener('fullscreenchange', () => this.updateFullscreenButton());
    }

    syncViewportLayout() {
        if (!this.screenEl || !this.mainSectionEl) return;

        const viewportHeight = window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 0;
        const screenRect = this.screenEl.getBoundingClientRect();
        const styles = window.getComputedStyle(this.screenEl);
        const paddingTop = parseFloat(styles.paddingTop || '0');
        const paddingBottom = parseFloat(styles.paddingBottom || '0');
        const gap = parseFloat(styles.gap || '0');
        const summaryHeight = this.summaryEl?.offsetHeight || 0;
        const availableHeight = Math.max(320, Math.floor(viewportHeight - screenRect.top - 12));
        const sectionHeight = Math.max(180, Math.floor(availableHeight - paddingTop - paddingBottom - summaryHeight - gap));

        this.screenEl.style.setProperty('--pdv-screen-height', `${availableHeight}px`);
        this.mainSectionEl.style.maxHeight = `${sectionHeight}px`;
    }

    async toggleFullscreen() {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
            } else {
                await document.documentElement.requestFullscreen();
            }
        } catch (error) {
            console.error('Erro ao alternar tela cheia:', error);
        }
    }

    updateFullscreenButton() {
        if (!this.fullscreenBtn) return;
        const isFullscreen = Boolean(document.fullscreenElement);
        this.fullscreenBtn.classList.toggle('is-active', isFullscreen);
        this.fullscreenBtn.innerHTML = isFullscreen
            ? '<i class="fas fa-compress"></i>'
            : '<i class="fas fa-expand"></i>';
        this.fullscreenBtn.title = isFullscreen ? 'Sair da tela cheia' : 'Tela cheia';
    }

    getSubtotal() {
        return roundToCents(this.cart.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0));
    }

    getDiscountValue() {
        const subtotal = this.getSubtotal();
        return Math.min(roundToCents(this.discountValue), subtotal);
    }

    getTotal() {
        return Math.max(0, roundToCents(this.getSubtotal() - this.getDiscountValue()));
    }

    getTotalPaid() {
        return roundToCents(Object.values(this.paymentData).reduce((sum, method) => sum + Number(method?.valorTotal || 0), 0));
    }

    getBalance() {
        return roundToCents(this.getTotal() - this.getTotalPaid());
    }

    syncDiscountInputs(source = 'value') {
        const subtotal = this.getSubtotal();

        if (source === 'percent') {
            const percent = Math.min(100, Number(onlyDigits(this.discountPercentInput?.value || 0) || 0));
            this.discountPercent = percent;
            this.discountValue = roundToCents(subtotal * (percent / 100));
            if (this.discountValueInput) {
                this.discountValueInput.value = formatBRL(this.discountValue);
            }
            if (this.discountPercentInput) {
                this.discountPercentInput.value = percent ? String(percent) : '';
            }
            return;
        }

        const value = Math.min(parseCurrencyInput(this.discountValueInput?.value || ''), subtotal);
        this.discountValue = roundToCents(value);
        this.discountPercent = subtotal > 0 ? Math.round((this.discountValue / subtotal) * 100) : 0;

        if (this.discountValueInput) {
            this.discountValueInput.value = this.discountValue > 0 ? formatBRL(this.discountValue) : '';
        }
        if (this.discountPercentInput) {
            this.discountPercentInput.value = this.discountPercent ? String(this.discountPercent) : '';
        }
    }

    getPaymentAmountValue() {
        return roundToCents(parseCurrencyInput(this.paymentAmountInput?.value || ''));
    }

    getPaymentInstallments() {
        return Math.max(1, Number(onlyDigits(this.paymentInstallmentsInput?.value || '') || 1));
    }

    getPaymentInterest() {
        const normalized = formatDecimalInput(this.paymentInterestInput?.value || '');
        return normalized === '' ? null : parseDecimalInput(normalized);
    }

    buildInstallments(amount, installments) {
        const totalCents = Math.round(Number(amount || 0) * 100);
        const qty = Math.max(1, Number(installments || 1));
        const base = Math.floor(totalCents / qty);
        let remainder = totalCents - (base * qty);
        const now = new Date();

        return Array.from({ length: qty }, (_, index) => {
            const valueInCents = base + (remainder > 0 ? 1 : 0);
            if (remainder > 0) remainder -= 1;
            const dueDate = addMonths(now, index + 1);
            return {
                numero: pad2(index + 1),
                vencimento: `${dueDate.getFullYear()}${pad2(dueDate.getMonth() + 1)}`,
                valor: roundToCents(valueInCents / 100)
            };
        });
    }

    renderInstallmentsPreview() {
        if (!this.installmentsTableBody) return;
        if (!this.isInstallmentMode()) {
            this.installmentsTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">Selecione "Parcelado" para visualizar as parcelas.</td></tr>';
            return;
        }

        const amount = this.getPaymentAmountValue();
        const installments = this.getPaymentInstallments();
        const interest = this.paymentMethodHasInterest() ? this.getPaymentInterest() : 0;

        if (!amount || interest == null) {
            this.installmentsTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">Informe valor, parcelas e juros para visualizar.</td></tr>';
            return;
        }

        const rows = this.buildInstallments(amount, installments);
        this.installmentsTableBody.innerHTML = rows.map((row) => `
            <tr>
                <td>${row.numero}</td>
                <td>${String(row.vencimento || '').slice(4, 6)}/${String(row.vencimento || '').slice(0, 4)}</td>
                <td>${formatBRL(row.valor)}</td>
                <td>${formatBRL(roundToCents(row.valor * (1 + (Number(interest || 0) / 100))))}</td>
            </tr>
        `).join('');
    }

    renderPaymentSummary() {
        if (this.paymentTotalEl) this.paymentTotalEl.textContent = formatBRL(this.getTotal());
        if (this.paymentPaidEl) this.paymentPaidEl.textContent = formatBRL(this.getTotalPaid());
        if (this.paymentBalanceEl) this.paymentBalanceEl.textContent = formatBRL(this.getBalance());
    }

    openPaymentModal() {
        if (!this.hasValidCustomerForPayment()) {
            window.alert('Preencha o cliente ou marque "Não informar" antes de abrir o pagamento.');
            this.documentInput?.focus();
            return;
        }
        this.hidePaymentFeedback();
        this.renderPaymentSummary();
        if (this.paymentAmountInput && !parseCurrencyInput(this.paymentAmountInput.value || '')) {
            const balance = this.getBalance();
            this.paymentAmountInput.value = balance > 0 ? formatBRL(balance) : '';
        }
        if (this.paymentInstallmentsInput && !this.paymentInstallmentsInput.value) {
            this.paymentInstallmentsInput.value = '1';
        }
        this.updatePaymentModeUI();
        if (window.bootstrap?.Modal && this.paymentModalEl) {
            window.bootstrap.Modal.getOrCreateInstance(this.paymentModalEl).show();
        }
    }

    closePaymentModal() {
        if (window.bootstrap?.Modal && this.paymentModalEl) {
            window.bootstrap.Modal.getOrCreateInstance(this.paymentModalEl).hide();
        }
    }

    openSaleSuccessModal() {
        if (!this.saleSuccessModalEl || !window.bootstrap?.Modal) {
            this.resetSaleState();
            return;
        }

        this.shouldResetOnSuccessModalClose = true;
        window.bootstrap.Modal.getOrCreateInstance(this.saleSuccessModalEl).show();
        if (this.saleSuccessTimeout) {
            window.clearTimeout(this.saleSuccessTimeout);
        }
        this.saleSuccessTimeout = window.setTimeout(() => {
            this.closeSaleSuccessModal();
        }, 5000);
    }

    closeSaleSuccessModal() {
        if (!this.saleSuccessModalEl || !window.bootstrap?.Modal) {
            this.handleSaleSuccessModalHidden();
            return;
        }
        window.bootstrap.Modal.getOrCreateInstance(this.saleSuccessModalEl).hide();
    }

    handleSaleSuccessModalHidden() {
        if (this.saleSuccessTimeout) {
            window.clearTimeout(this.saleSuccessTimeout);
            this.saleSuccessTimeout = null;
        }

        if (!this.shouldResetOnSuccessModalClose) return;

        this.shouldResetOnSuccessModalClose = false;
        this.resetSaleState();
    }

    showPaymentFeedback(message) {
        if (!this.paymentFeedbackEl) return;
        this.paymentFeedbackEl.textContent = message;
        this.paymentFeedbackEl.classList.remove('d-none');
    }

    hidePaymentFeedback() {
        if (!this.paymentFeedbackEl) return;
        this.paymentFeedbackEl.textContent = '';
        this.paymentFeedbackEl.classList.add('d-none');
    }

    ensureCurrentSaleCode() {
        if (!this.currentSaleCode) {
            this.currentSaleCode = buildSaleCode(new Date());
        }
        return this.currentSaleCode;
    }

    getCurrentCustomerDocument() {
        if (this.unknownCheckbox?.checked) return UNKNOWN_CUSTOMER_DOCUMENT;
        return onlyDigits(this.documentInput?.value || this.pendingDocument || '');
    }

    hasValidCustomerForPayment() {
        if (this.unknownCheckbox?.checked) return true;
        return Boolean(onlyDigits(this.documentInput?.value || '') && String(this.nameInput?.value || '').trim());
    }

    hasValidCustomerForPendingSale() {
        if (this.unknownCheckbox?.checked) return false;
        return Boolean(onlyDigits(this.documentInput?.value || '') && String(this.nameInput?.value || '').trim());
    }

    updatePendingButtonState() {
        if (!this.markPendingBtn) return;
        this.markPendingBtn.disabled = !this.hasValidCustomerForPendingSale();
    }

    isInstallmentMode() {
        return this.selectedPaymentType === 'parcelado';
    }

    paymentMethodHasInterest() {
        return this.selectedPaymentMethod === 'pix' || this.selectedPaymentMethod === 'cartao';
    }

    syncPaymentInterestDefault() {
        if (!this.paymentInterestInput) return;

        if (!this.paymentMethodHasInterest()) {
            this.paymentInterestInput.value = '0';
            return;
        }

        const stored = this.lastSavedInterests[this.selectedPaymentMethod] ?? 0;
        this.paymentInterestInput.value = String(stored).replace('.', ',').replace(/,0$/, '');
    }

    updatePaymentModeUI() {
        if (this.selectedChargeMode === 'maquininha') {
            this.paymentTypeButtons.forEach((button) => {
                button.classList.toggle('is-active', false);
            });
            this.paymentMethodButtons.forEach((button) => {
                button.classList.toggle('is-active', false);
                button.classList.remove('d-none');
                button.disabled = true;
            });
            this.installmentFieldsEl?.classList.add('d-none');
            this.installmentsTableWrapperEl?.classList.add('d-none');
            return;
        }

        const isInstallment = this.isInstallmentMode();
        const shouldHideMoney = isInstallment;

        if (shouldHideMoney && this.selectedPaymentMethod === 'dinheiro') {
            this.selectedPaymentMethod = 'pix';
        }

        this.paymentTypeButtons.forEach((button) => {
            button.classList.toggle('is-active', button.getAttribute('data-payment-type') === this.selectedPaymentType);
        });
        this.paymentMethodButtons.forEach((button) => {
            const method = button.getAttribute('data-payment-method') || '';
            const isMoney = method === 'dinheiro';
            button.classList.toggle('is-active', method === this.selectedPaymentMethod);
            button.classList.toggle('d-none', isMoney && shouldHideMoney);
            button.disabled = isMoney && shouldHideMoney;
        });
        this.installmentFieldsEl?.classList.toggle('d-none', !isInstallment);
        this.installmentsTableWrapperEl?.classList.toggle('d-none', !isInstallment);
        this.syncPaymentInterestDefault();
        this.renderInstallmentsPreview();
    }

    updateChargeModeUI() {
        const isMachine = this.selectedChargeMode === 'maquininha';

        this.chargeModeButtons.forEach((button) => {
            button.classList.toggle('is-active', button.getAttribute('data-charge-mode') === this.selectedChargeMode);
        });

        this.chargeModeInfoEl?.classList.toggle('d-none', !isMachine);
        this.machinePaymentControlsEl?.classList.toggle('d-none', !isMachine);
        this.manualPaymentControlsEl?.classList.toggle('d-none', isMachine);
        this.machineInstallmentsFieldEl?.classList.toggle('d-none', this.selectedMachineMethod !== 'credito');
        this.updatePaymentModeUI();
    }

    getMachineInstallments() {
        return Math.max(1, Number(onlyDigits(this.machineInstallmentsInput?.value || '') || 1));
    }

    getMachineMethodLabel() {
        return this.selectedMachineMethod === 'debito' ? 'debito' : 'credito';
    }

    setupSummaryListeners() {
        this.fullscreenBtn?.addEventListener('click', async () => {
            await this.toggleFullscreen();
        });

        this.discountValueInput?.addEventListener('input', () => {
            this.discountValueInput.value = formatCurrencyInput(this.discountValueInput.value);
            this.syncDiscountInputs('value');
            this.renderCart();
        });

        this.discountPercentInput?.addEventListener('input', () => {
            this.discountPercentInput.value = onlyDigits(this.discountPercentInput.value).slice(0, 3);
            this.syncDiscountInputs('percent');
            this.renderCart();
        });

        this.paymentOpenBtn?.addEventListener('click', () => {
            if (!this.cart.length) {
                window.alert('Adicione pelo menos um produto ao carrinho antes de abrir o pagamento.');
                return;
            }
            if (!this.hasValidCustomerForPayment()) {
                window.alert('Preencha o cliente ou marque "Não informar" antes de abrir o pagamento.');
                this.documentInput?.focus();
                return;
            }
            this.openPaymentModal();
        });
    }

    setupPaymentListeners() {
        this.paymentAmountInput?.addEventListener('input', () => {
            this.paymentAmountInput.value = formatCurrencyInput(this.paymentAmountInput.value);
            this.renderInstallmentsPreview();
        });

        this.paymentAmountInput?.addEventListener('click', () => {
            const balance = this.getBalance();
            if (balance > 0) {
                this.paymentAmountInput.value = formatBRL(balance);
            }
            this.paymentAmountInput.select();
        });

        this.paymentTypeButtons.forEach((button) => {
            button.addEventListener('click', () => {
                this.selectedPaymentType = button.getAttribute('data-payment-type') || 'avista';
                this.updatePaymentModeUI();
            });
        });

        this.chargeModeButtons.forEach((button) => {
            button.addEventListener('click', () => {
                this.selectedChargeMode = button.getAttribute('data-charge-mode') === 'maquininha' ? 'maquininha' : 'manual';
                this.persistChargeModePreference();
                this.updateChargeModeUI();
            });
        });

        this.machineMethodSelect?.addEventListener('change', () => {
            this.selectedMachineMethod = this.machineMethodSelect?.value === 'debito' ? 'debito' : 'credito';
            this.updateChargeModeUI();
        });

        this.machineInstallmentsInput?.addEventListener('input', () => {
            this.machineInstallmentsInput.value = onlyDigits(this.machineInstallmentsInput.value).slice(0, 2) || '1';
        });

        this.paymentInstallmentsInput?.addEventListener('input', () => {
            this.paymentInstallmentsInput.value = onlyDigits(this.paymentInstallmentsInput.value).slice(0, 2);
            this.renderInstallmentsPreview();
        });

        this.paymentInstallmentsInput?.addEventListener('click', () => {
            this.paymentInstallmentsInput.select();
        });

        this.paymentInterestInput?.addEventListener('input', () => {
            this.paymentInterestInput.value = formatDecimalInput(this.paymentInterestInput.value);
            this.renderInstallmentsPreview();
        });

        this.paymentInterestInput?.addEventListener('click', () => {
            this.paymentInterestInput.select();
        });

        this.paymentMethodButtons.forEach((button) => {
            button.addEventListener('click', () => {
                this.selectedPaymentMethod = button.getAttribute('data-payment-method') || 'pix';
                this.updatePaymentModeUI();
            });
        });

        this.paymentSubmitBtn?.addEventListener('click', async () => {
            if (this.selectedChargeMode === 'maquininha') {
                await this.startMachinePayment();
                return;
            }
            await this.savePayment(this.selectedPaymentMethod);
        });

        this.markPendingBtn?.addEventListener('click', async () => {
            await this.finishSaleAsPending();
        });

        this.cancelSaleBtn?.addEventListener('click', async () => {
            await this.cancelSale();
        });

        this.saleSuccessCloseBtn?.addEventListener('click', () => {
            this.closeSaleSuccessModal();
        });

        this.saleSuccessModalEl?.addEventListener('hidden.bs.modal', () => {
            this.handleSaleSuccessModalHidden();
        });

        this.updatePendingButtonState();

        this.paymentModalEl?.addEventListener('shown.bs.modal', () => {
            this.paymentAmountInput?.focus();
        });
    }

    setupProductListeners() {
        this.scannerModeBtn?.addEventListener('click', () => {
            this.setSearchMode('scanner');
        });

        this.keyboardModeBtn?.addEventListener('click', () => {
            this.setSearchMode('keyboard');
        });

        this.productSearchInput?.addEventListener('input', () => {
            this.applyProductFilters();
            if (this.searchMode === 'scanner') {
                this.scheduleScannerRead();
            }
        });

        this.productSearchInput?.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (this.searchMode === 'scanner') {
                    this.tryAddProductFromSearch();
                }
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                this.clearProductSearch();
            }
        });
    }

    applyProductFilters() {
        const rawTerm = String(this.productSearchInput?.value || '').trim();
        const termNorm = normalizeText(rawTerm);
        const filterOnlyCode = this.searchMode === 'scanner';

        if (!termNorm) {
            this.filteredProducts = [];
            this.renderProductResults();
            return;
        }

        if (filterOnlyCode) {
            this.filteredProducts = this.products.filter((product) => {
                const code = normalizeText(product.codigo || product.key || '');
                return code.includes(termNorm);
            });
            this.renderProductResults();
            return;
        }

        this.filteredProducts = this.products.filter((product) => {
            const code = normalizeText(product.codigo || product.key || '');
            const description = normalizeText(this.getProductDescription(product));
            return code.includes(termNorm) || description.includes(termNorm);
        });

        this.renderProductResults();
    }

    getExactCodeMatch(value) {
        const term = normalizeText(value);
        if (!term) return null;
        return this.products.find((product) => normalizeText(product.codigo || product.key || '') === term) || null;
    }

    setSearchMode(mode) {
        this.searchMode = mode === 'keyboard' ? 'keyboard' : 'scanner';
        this.scannerModeBtn?.classList.toggle('is-active', this.searchMode === 'scanner');
        this.keyboardModeBtn?.classList.toggle('is-active', this.searchMode === 'keyboard');

        if (this.productInfoEl) {
            this.productInfoEl.textContent = this.searchMode === 'scanner'
                ? 'Modo scanner ativo: leitura por codigo adiciona direto ao carrinho.'
                : 'Modo teclado ativo: busca por codigo, descricao e outros campos.';
        }

        this.applyProductFilters();
        this.productSearchInput?.focus();
    }

    scheduleScannerRead() {
        if (this.scannerIdleTimeout) {
            window.clearTimeout(this.scannerIdleTimeout);
        }

        this.scannerIdleTimeout = window.setTimeout(() => {
            this.tryAddProductFromSearch();
        }, 90);
    }

    confirmOutOfStock(product, message) {
        const code = product?.codigo || product?.key || '';
        const description = this.getProductDescription(product);
        const promptMessage = `${message}\n\nCodigo: ${code}\nProduto: ${description}\n\nDeseja adicionar mesmo assim?`;
        return window.confirm(promptMessage);
    }

    tryAddProductFromSearch() {
        if (this.searchMode !== 'scanner') return;

        const exact = this.getExactCodeMatch(this.productSearchInput?.value || '');
        if (!exact) return;

        const stock = this.getProductStock(exact);
        if (stock <= 0) {
            const shouldAdd = this.confirmOutOfStock(exact, 'Este item nao tem mais estoque.');
            if (this.productInfoEl) {
                this.productInfoEl.textContent = shouldAdd
                    ? `Produto ${exact.codigo || exact.key || ''} adicionado sem estoque.`
                    : `Adicao cancelada para o codigo ${exact.codigo || exact.key || ''}.`;
            }
            if (!shouldAdd) return;
        }

        this.addProductToCart(exact, { allowOutOfStock: stock <= 0 });

        if (this.productInfoEl) {
            this.productInfoEl.textContent = `Leitura automatica: ${exact.codigo || exact.key || ''} adicionado ao carrinho.`;
        }

        this.clearProductSearch();
    }

    clearProductSearch() {
        if (this.productSearchInput) this.productSearchInput.value = '';
        this.filteredProducts = [];
        if (this.scannerIdleTimeout) {
            window.clearTimeout(this.scannerIdleTimeout);
            this.scannerIdleTimeout = null;
        }
        this.renderProductResults();
        this.productSearchInput?.focus();
    }

    renderProductResults() {
        if (!this.productResultsEl) return;

        const term = String(this.productSearchInput?.value || '').trim();
        const onlyCode = this.searchMode === 'scanner';

        if (!term) {
            this.productResultsEl.innerHTML = '<div class="pdv-search-empty">Digite um c\u00f3digo ou uma descri\u00e7\u00e3o para buscar produtos.</div>';
            if (this.productInfoEl) this.productInfoEl.textContent = onlyCode ? 'Leitura por c\u00f3digo adiciona direto ao carrinho.' : 'Busca textual ignora acentos.';
            return;
        }

        if (!this.filteredProducts.length) {
            this.productResultsEl.innerHTML = '<div class="pdv-search-empty">Nenhum produto encontrado para essa busca.</div>';
            if (this.productInfoEl) this.productInfoEl.textContent = '0 produto encontrado.';
            return;
        }

        if (this.productInfoEl) {
            const label = this.filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados';
            this.productInfoEl.textContent = `${this.filteredProducts.length} ${label}.`;
        }

        this.productResultsEl.innerHTML = this.filteredProducts.map((product) => {
            const code = product.codigo || product.key || '';
            const stock = this.getProductStock(product);
            const imageUrl = this.getFirstProductImage(product);
            return `
                <div class="pdv-product-result">
                    <div class="pdv-product-main">
                        <div class="pdv-product-thumb">
                            ${imageUrl
                                ? `<img src="${imageUrl}" alt="Imagem do produto ${code}" loading="lazy">`
                                : '<div class="pdv-product-thumb-empty"><i class="fas fa-gem"></i></div>'}
                        </div>
                        <div>
                            <div class="pdv-product-code">${code}</div>
                            <div class="pdv-product-name">${this.getProductDescription(product)}</div>
                            <div class="pdv-product-meta">Estoque: ${stock}</div>
                        </div>
                    </div>
                    <div class="text-end">
                        <div class="pdv-product-price">${formatBRL(product.precoVenda || 0)}</div>
                        <button type="button" class="btn btn-primary btn-sm mt-2" data-add-product="${code}">
                            <i class="fas fa-plus me-1"></i>Adicionar
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        this.productResultsEl.querySelectorAll('[data-add-product]').forEach((button) => {
            button.addEventListener('click', () => {
                const code = button.getAttribute('data-add-product') || '';
                const product = this.products.find((item) => String(item.codigo || item.key || '') === String(code));
                if (product) {
                    if (this.getProductStock(product) <= 0) {
                        const shouldAdd = this.confirmOutOfStock(product, 'Este item nao tem mais estoque.');
                        if (this.productInfoEl) {
                            this.productInfoEl.textContent = shouldAdd
                                ? `Produto ${product.codigo || product.key || ''} adicionado sem estoque.`
                                : `Adicao cancelada para o codigo ${product.codigo || product.key || ''}.`;
                        }
                        if (!shouldAdd) return;
                        this.addProductToCart(product, { allowOutOfStock: true });
                        this.clearProductSearch();
                        return;
                    }
                    this.addProductToCart(product);
                    this.clearProductSearch();
                }
            });
        });
    }

    addProductToCart(product, { allowOutOfStock = false } = {}) {
        const code = String(product.codigo || product.key || '');
        const existing = this.cart.find((item) => item.code === code);
        const stock = this.getProductStock(product);

        if (!allowOutOfStock && (existing?.quantity || 0) >= stock) {
            const shouldAdd = this.confirmOutOfStock(product, 'Este item nao tem mais estoque disponivel para nova adicao.');
            if (this.productInfoEl) {
                this.productInfoEl.textContent = shouldAdd
                    ? `Produto ${code} adicionado acima do estoque.`
                    : `Adicao cancelada para o codigo ${code}.`;
            }
            if (!shouldAdd) return;
        }

        if (existing) {
            existing.quantity += 1;
            existing.excessQuantity = Math.max(0, existing.quantity - Number(existing.stock || 0));
        } else {
            this.cart.push({
                code,
                description: this.getProductDescription(product),
                price: Number(product.precoVenda || 0),
                quantity: 1,
                stock,
                stockField: product.stockField || 'qtdeEstoque',
                sourcePath: product.sourcePath || `produtos/${code}`,
                excessQuantity: Math.max(0, 1 - Number(stock || 0))
            });
        }

        this.renderCart();
    }

    updateCartItemQuantity(code, delta) {
        const item = this.cart.find((entry) => entry.code === code);
        if (!item) return;

        if (delta > 0 && item.quantity >= Number(item.stock || 0)) {
            const shouldAdd = window.confirm(
                `Este item nao tem mais estoque disponivel para nova adicao.\n\nCodigo: ${item.code}\nProduto: ${item.description}\n\nDeseja adicionar mesmo assim?`
            );

            if (!shouldAdd) {
                if (this.productInfoEl) {
                    this.productInfoEl.textContent = `Adicao cancelada para o codigo ${item.code}.`;
                }
                return;
            }

            if (this.productInfoEl) {
                this.productInfoEl.textContent = `Produto ${item.code} adicionado acima do estoque.`;
            }
        }

        item.quantity += delta;
        if (item.quantity <= 0) {
            this.cart = this.cart.filter((entry) => entry.code !== code);
        } else {
            item.excessQuantity = Math.max(0, item.quantity - Number(item.stock || 0));
        }

        this.renderCart();
    }

    renderCart() {
        if (!this.cartItemsEl || !this.cartEmptyEl) return;

        if (!this.cart.length) {
            this.cartEmptyEl.classList.remove('d-none');
            this.cartItemsEl.classList.add('d-none');
            this.cartItemsEl.innerHTML = '';
            if (this.subtotalEl) this.subtotalEl.textContent = formatBRL(0);
            this.syncDiscountInputs('value');
            if (this.totalEl) this.totalEl.textContent = formatBRL(0);
            this.renderPaymentSummary();
            return;
        }

        this.cartEmptyEl.classList.add('d-none');
        this.cartItemsEl.classList.remove('d-none');

        this.cartItemsEl.innerHTML = this.cart.map((item) => `
            <div class="pdv-cart-item">
                <div class="pdv-cart-info">
                    <div class="pdv-cart-name">${item.code} - ${item.description}</div>
                    <input type="hidden" value="${Number(item.stock || 0)}" data-cart-stock="${item.code}">
                    <input type="hidden" value="${Number(item.excessQuantity || 0)}" data-cart-excess="${item.code}">
                    <input type="hidden" value="${item.stockField || ''}" data-cart-stock-field="${item.code}">
                    <input type="hidden" value="${item.sourcePath || ''}" data-cart-source-path="${item.code}">
                </div>
                <div class="pdv-cart-price-col">
                    <div class="pdv-cart-unit-price">${formatBRL(item.price)}</div>
                </div>
                <div class="pdv-cart-summary-col">
                    <div class="pdv-cart-actions">
                        <button type="button" class="btn btn-outline-secondary btn-sm" data-cart-qty="${item.code}" data-delta="-1">-</button>
                        <span class="pdv-cart-qty">${item.quantity}</span>
                        <button type="button" class="btn btn-outline-secondary btn-sm" data-cart-qty="${item.code}" data-delta="1">+</button>
                    </div>
                    <div class="pdv-cart-total">${formatBRL(item.price * item.quantity)}</div>
                </div>
            </div>
        `).join('');

        this.cartItemsEl.querySelectorAll('[data-cart-qty]').forEach((button) => {
            button.addEventListener('click', () => {
                const code = button.getAttribute('data-cart-qty') || '';
                const delta = Number(button.getAttribute('data-delta') || 0);
                this.updateCartItemQuantity(code, delta);
            });
        });

        this.syncDiscountInputs('value');
        const subtotal = this.getSubtotal();
        if (this.subtotalEl) this.subtotalEl.textContent = formatBRL(subtotal);
        if (this.totalEl) this.totalEl.textContent = formatBRL(this.getTotal());
        this.renderPaymentSummary();
    }

    getCartExcessItems() {
        return this.cart
            .filter((item) => Number(item.excessQuantity || 0) > 0)
            .map((item) => ({
                codigo: item.code,
                quantidadeExcedente: Number(item.excessQuantity || 0),
                quantidadeCarrinho: Number(item.quantity || 0),
                quantidadeBaseEstoque: Number(item.stock || 0),
                campoEstoqueOrigem: item.stockField || 'qtdeEstoque',
                origemProduto: item.sourcePath || ''
            }));
    }

    async persistPaymentSummary({ saleCode, customerDocument, pending = false }) {
        const paymentPath = `financeiro/pagamentos/${saleCode}`;
        const summaryPayload = {
            CPFCNPJ: customerDocument,
            total: this.getTotal(),
            valorPago: this.getTotalPaid(),
            saldo: this.getBalance(),
            pendente: Boolean(pending)
        };

        await Promise.all(
            Object.entries(summaryPayload).map(([key, value]) =>
                set(ref(database, `${paymentPath}/${key}`), value)
            )
        );
    }

    getPendingSalePayload(saleCode, customerDocument) {
        return {
            codigoVenda: saleCode,
            CPFCNPJ: customerDocument,
            total: this.getTotal(),
            valorPago: this.getTotalPaid(),
            saldo: this.getBalance(),
            dataCriacao: new Date().toISOString(),
            itens: this.cart.map((item) => ({
                codigo: item.code,
                descricao: item.description,
                quantidade: Number(item.quantity || 0),
                valorUnitario: Number(item.price || 0),
                valorTotal: roundToCents(Number(item.price || 0) * Number(item.quantity || 0))
            }))
        };
    }

    getSaleCodesList() {
        return this.cart.flatMap((item) => Array.from({ length: Number(item.quantity || 0) }, () => item.code));
    }

    async registerSaleItemsOnce(saleCode) {
        if (this.saleItemsRegistered) return;

        const sellerCPF = onlyDigits(sessionStorage.getItem('userCPF') || '');
        const salePath = `vendas/${saleCode}`;

        await set(ref(database, salePath), {
            vendedor: sellerCPF,
            itens: this.cart.reduce((acc, item) => {
                acc[item.code] = {
                    codigo: item.code,
                    descricao: item.description,
                    quantidade: Number(item.quantity || 0),
                    valorUnitario: Number(item.price || 0)
                };
                return acc;
            }, {})
        });

        await Promise.all(this.cart.map(async (item) => {
            const productPath = item.sourcePath || `produtos/${item.code}`;
            const stockField = item.stockField || 'qtdeEstoque';
            const stockRef = ref(database, `${productPath}/${stockField}`);
            const snapshot = await get(stockRef);
            const currentStock = Number(snapshot.val() || 0);
            const newStock = currentStock - Number(item.quantity || 0);
            await set(stockRef, newStock);

            if (stockField === 'qtdeEstoque') {
                const saidaAdmRef = ref(database, `${productPath}/qtdeSaidaAdm`);
                const saidaAdmSnapshot = await get(saidaAdmRef);
                const currentSaidaAdm = Number(saidaAdmSnapshot.val() || 0);
                await set(saidaAdmRef, currentSaidaAdm + Number(item.quantity || 0));
            } else if (stockField === 'qtdeConsignado') {
                const saidaConsigRef = ref(database, `${productPath}/qtdeSaidaConsig`);
                const saidaConsigSnapshot = await get(saidaConsigRef);
                const currentSaidaConsig = Number(saidaConsigSnapshot.val() || 0);
                await set(saidaConsigRef, currentSaidaConsig + Number(item.quantity || 0));
            }
        }));

        this.saleItemsRegistered = true;
    }

    async savePayment(method) {
        const paymentMethod = String(method || '').toLowerCase();
        const customerDocument = this.getCurrentCustomerDocument();
        const amount = this.getPaymentAmountValue();
        const isInstallment = this.isInstallmentMode();
        const installments = isInstallment ? this.getPaymentInstallments() : 1;
        const interest = (isInstallment && this.paymentMethodHasInterest()) ? this.getPaymentInterest() : 0;
        const total = this.getTotal();

        if (!this.cart.length) {
            this.showPaymentFeedback('Adicione produtos ao carrinho antes de registrar pagamento.');
            return;
        }

        if (!customerDocument) {
            this.showPaymentFeedback('Informe o CPF/CNPJ do cliente antes de registrar pagamento.');
            return;
        }

        if (!amount || amount <= 0) {
            this.showPaymentFeedback('Informe um valor de pagamento maior que zero.');
            this.paymentAmountInput?.focus();
            return;
        }

        if (amount > this.getBalance() && this.getBalance() > 0) {
            const shouldContinue = window.confirm('O valor informado excede o saldo da venda. Deseja lançar mesmo assim?');
            if (!shouldContinue) return;
        }

        if (paymentMethod !== 'dinheiro' && isInstallment && this.paymentMethodHasInterest() && (interest == null || Number.isNaN(interest))) {
            this.showPaymentFeedback('Informe o juros para pagamento em PIX ou Cartão. Zero é aceito.');
            this.paymentInterestInput?.focus();
            return;
        }

        const saleCode = this.ensureCurrentSaleCode();
        const paymentPath = `financeiro/pagamentos/${saleCode}`;

        try {
            this.hidePaymentFeedback();
            await this.registerSaleItemsOnce(saleCode);
            await set(ref(database, `${paymentPath}/CPFCNPJ`), customerDocument);

            if (paymentMethod === 'dinheiro') {
                const current = this.paymentData.dinheiro?.valorTotal || 0;
                const payload = { valorTotal: roundToCents(current + amount) };
                await set(ref(database, `${paymentPath}/dinheiro`), payload);
                this.paymentData.dinheiro = payload;
            } else if (paymentMethod === 'pix' || paymentMethod === 'cartao') {
                const builtInstallments = this.buildInstallments(amount, installments);
                const payload = {
                    valorTotal: amount,
                    juros: roundToCents(interest),
                    qtdeParcelas: installments,
                    parcelas: builtInstallments.reduce((acc, item) => {
                        acc[item.numero] = {
                            vencimento: item.vencimento,
                            valor: item.valor
                        };
                        return acc;
                    }, {})
                };

                await set(ref(database, `${paymentPath}/${paymentMethod}`), payload);
                if (isInstallment && this.paymentMethodHasInterest()) {
                    const interestPath = paymentMethod === 'pix' ? 'financeiro/jurosPix' : 'financeiro/jurosCartao';
                    await set(ref(database, interestPath), roundToCents(interest));
                }
                this.paymentData[paymentMethod] = payload;
                if (isInstallment && this.paymentMethodHasInterest()) {
                    this.lastSavedInterests[paymentMethod] = roundToCents(interest);
                }
            } else {
                this.showPaymentFeedback('Forma de pagamento invalida.');
                return;
            }

            await this.persistPaymentSummary({
                saleCode,
                customerDocument,
                pending: false
            });

            this.renderPaymentSummary();
            this.renderInstallmentsPreview();
            this.showPaymentFeedback(`Pagamento em ${paymentMethod} registrado com sucesso.`);

            if (this.paymentAmountInput) {
                const balance = this.getBalance();
                this.paymentAmountInput.value = balance > 0 ? formatBRL(balance) : '';
            }
            this.selectedPaymentType = 'avista';
            if (this.paymentInstallmentsInput) this.paymentInstallmentsInput.value = '1';
            this.updatePaymentModeUI();

            if (total > 0 && this.getBalance() <= 0) {
                this.closePaymentModal();
                this.openSaleSuccessModal();
            }
        } catch (error) {
            console.error('Erro ao salvar pagamento:', error);
            this.showPaymentFeedback('Nao foi possivel salvar o pagamento no Firebase.');
        }
    }

    async startMachinePayment() {
        const customerDocument = this.getCurrentCustomerDocument();
        const amount = this.getPaymentAmountValue();

        if (!this.cart.length) {
            this.showPaymentFeedback('Adicione produtos ao carrinho antes de enviar para a maquininha.');
            return;
        }

        if (!customerDocument) {
            this.showPaymentFeedback('Informe o CPF/CNPJ do cliente antes de enviar para a maquininha.');
            return;
        }

        if (!amount || amount <= 0) {
            this.showPaymentFeedback('Informe um valor maior que zero para enviar a maquininha.');
            this.paymentAmountInput?.focus();
            return;
        }

        const saleCode = this.ensureCurrentSaleCode();
        const machineMethod = this.getMachineMethodLabel();
        const installments = machineMethod === 'credito' ? this.getMachineInstallments() : 1;

        try {
            this.hidePaymentFeedback();
            const result = await startSumUpMachinePayment({
                amount,
                saleCode,
                customerDocument,
                machineMethod,
                installments
            });

            this.showPaymentFeedback(`Envio para a maquininha iniciado: ${result?.status || 'processando'}.`);
        } catch (error) {
            console.error('Erro ao enviar pagamento para SumUp:', error);

            if (error?.code === 'SUMUP_UNSUPPORTED_TERMINAL') {
                const terminal = getSumUpTerminalConfig();
                this.showPaymentFeedback(
                    `Nao e possivel iniciar a SumUp ${terminal.model} (${terminal.deviceVersion}) direto deste PDV web. ` +
                    `Para web/desktop, a SumUp direciona Cloud API para leitores Solo; leitores desta linha exigem app Android/iOS via SDK ou Payment Switch.`
                );
                return;
            }

            this.showPaymentFeedback('Nao foi possivel iniciar o envio para a maquininha SumUp.');
        }
    }

    async finishSaleAsPending() {
        const customerDocument = this.getCurrentCustomerDocument();

        if (!this.cart.length) {
            this.showPaymentFeedback('Adicione produtos ao carrinho antes de finalizar como pendente.');
            return;
        }

        if (!customerDocument) {
            this.showPaymentFeedback('Informe o CPF/CNPJ do cliente antes de finalizar como pendente.');
            return;
        }

        const shouldContinue = window.confirm('Deseja finalizar a venda como pagamento pendente?');
        if (!shouldContinue) return;

        const saleCode = this.ensureCurrentSaleCode();

        try {
            this.hidePaymentFeedback();
            await this.registerSaleItemsOnce(saleCode);
            await this.persistPaymentSummary({
                saleCode,
                customerDocument,
                pending: true
            });

            await set(
                ref(database, `pendentesPDV/${saleCode}`),
                this.getPendingSalePayload(saleCode, customerDocument)
            );

            this.closePaymentModal();
            this.openSaleSuccessModal();
        } catch (error) {
            console.error('Erro ao finalizar venda pendente:', error);
            this.showPaymentFeedback('Nao foi possivel salvar a venda pendente no Firebase.');
        }
    }

    async cancelSale() {
        const hasPayment = Boolean(this.currentSaleCode);
        const shouldCancel = window.confirm('Deseja cancelar a venda atual? Isso limpara carrinho, cliente e pagamentos ja registrados.');
        if (!shouldCancel) return;

        try {
            if (hasPayment) {
                await Promise.all([
                    remove(ref(database, `financeiro/pagamentos/${this.currentSaleCode}`)),
                    remove(ref(database, `pendentesPDV/${this.currentSaleCode}`))
                ]);
            }

            this.resetSaleState();
            this.closePaymentModal();
        } catch (error) {
            console.error('Erro ao cancelar venda:', error);
            this.showPaymentFeedback('Nao foi possivel cancelar a venda no Firebase.');
        }
    }

    resetSaleState() {
        this.cart = [];
        this.paymentData = {};
        this.currentSaleCode = '';
        this.discountValue = 0;
        this.discountPercent = 0;
        this.pendingDocument = '';
        this.filteredProducts = [];
        this.shouldResetOnSuccessModalClose = false;
        this.saleItemsRegistered = false;

        if (this.discountValueInput) this.discountValueInput.value = '';
        if (this.discountPercentInput) this.discountPercentInput.value = '';
        if (this.paymentAmountInput) this.paymentAmountInput.value = '';
        this.loadChargeModePreference();
        this.selectedPaymentType = 'avista';
        this.selectedPaymentMethod = 'pix';
        this.selectedMachineMethod = 'credito';
        if (this.paymentInstallmentsInput) this.paymentInstallmentsInput.value = '1';
        if (this.machineMethodSelect) this.machineMethodSelect.value = 'credito';
        if (this.machineInstallmentsInput) this.machineInstallmentsInput.value = '1';
        if (this.productSearchInput) this.productSearchInput.value = '';
        if (this.scannerIdleTimeout) {
            window.clearTimeout(this.scannerIdleTimeout);
            this.scannerIdleTimeout = null;
        }
        if (this.saleSuccessTimeout) {
            window.clearTimeout(this.saleSuccessTimeout);
            this.saleSuccessTimeout = null;
        }

        if (this.unknownCheckbox) this.unknownCheckbox.checked = false;
        if (this.documentInput) this.documentInput.disabled = false;
        if (this.nameInput) this.nameInput.disabled = false;

        fillCustomer({ documento: '', nome: '' });
        this.hideSuggestions();
        this.hidePaymentFeedback();
        this.renderProductResults();
        this.renderCart();
        this.renderPaymentSummary();
        this.updateChargeModeUI();
        this.updatePaymentModeUI();
        this.updatePendingButtonState();
        setStatus('Nova venda iniciada. Informe um CPF ou CNPJ para localizar o cliente.');
        this.documentInput?.focus();
    }

    setupCustomerListeners() {
        this.documentInput?.addEventListener('input', async () => {
            if (this.unknownCheckbox?.checked) {
                this.unknownCheckbox.checked = false;
                await this.toggleUnknownCustomer(false);
            }

            const digits = onlyDigits(this.documentInput.value);
            this.documentInput.value = formatDocument(digits);
            this.pendingDocument = digits;

            if (!digits) {
                fillCustomer({ documento: '', nome: '' });
                this.renderSuggestions('');
                this.updatePendingButtonState();
                setStatus('Informe um CPF ou CNPJ para localizar o cliente.');
                return;
            }

            this.renderSuggestions(digits);

            if (digits.length === 11 || digits.length === 14) {
                await this.searchCustomer({ openModalOnMissing: false, forcedDocument: digits });
            } else {
                fillCustomer({ documento: digits, nome: '' });
                this.updatePendingButtonState();
                setStatus('Continue digitando para localizar o cliente.', 'muted');
            }
        });

        this.documentInput?.addEventListener('focus', () => {
            this.renderSuggestions(onlyDigits(this.documentInput.value));
        });

        this.documentInput?.addEventListener('click', () => {
            this.documentInput?.select();
        });

        this.nameInput?.addEventListener('click', () => {
            this.nameInput?.select();
        });

        this.documentInput?.addEventListener('blur', async () => {
            window.setTimeout(async () => {
                this.hideSuggestions();

                if (this.unknownCheckbox?.checked) return;

                const digits = onlyDigits(this.documentInput?.value);
                if (digits.length === 11 || digits.length === 14) {
                    await this.searchCustomer({ openModalOnMissing: true, forcedDocument: digits });
                }
            }, 150);
        });

        this.unknownCheckbox?.addEventListener('change', async () => {
            await this.toggleUnknownCustomer(Boolean(this.unknownCheckbox.checked));
        });

        this.modalSaveButton?.addEventListener('click', async () => {
            await this.saveCustomer();
        });

        this.modalNameInput?.addEventListener('keydown', async (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                await this.saveCustomer();
            }
        });

        this.modalWhatsappInput?.addEventListener('input', () => {
            this.modalWhatsappInput.value = formatWhatsapp(this.modalWhatsappInput.value);
        });

        [this.modalNameInput, this.modalBirthdateInput, this.modalWhatsappInput, this.modalEmailInput].forEach((input) => {
            input?.addEventListener('input', () => this.hideModalFeedback());
        });

        this.modalEl?.addEventListener('hidden.bs.modal', () => {
            this.handleModalHidden();
        });

        this.modalEl?.addEventListener('shown.bs.modal', () => {
            this.modalNameInput?.focus();
            this.modalNameInput?.select();
        });

        this.modalEl?.addEventListener('click', (event) => {
            if (event.target === this.modalEl && !this.getModalInstance()) {
                this.hideCadastroModalFallback();
            }
        });

        this.modalEl?.querySelectorAll('[data-bs-dismiss="modal"]').forEach((button) => {
            button.addEventListener('click', () => {
                if (!this.getModalInstance()) {
                    this.hideCadastroModalFallback();
                }
            });
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.modalEl?.classList.contains('show') && !this.getModalInstance()) {
                this.hideCadastroModalFallback();
            }
        });

        document.addEventListener('click', (event) => {
            if (!event.target.closest('.pdv-customer-autocomplete')) {
                this.hideSuggestions();
            }
        });
    }

    getModalInstance() {
        if (!this.modalEl || !window.bootstrap || !window.bootstrap.Modal) return null;
        return window.bootstrap.Modal.getOrCreateInstance(this.modalEl);
    }

    showCadastroModalFallback() {
        if (!this.modalEl) return;

        this.modalEl.style.display = 'block';
        this.modalEl.classList.add('show');
        this.modalEl.removeAttribute('aria-hidden');
        this.modalEl.setAttribute('aria-modal', 'true');
        this.modalEl.setAttribute('role', 'dialog');
        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';

        if (!this.modalBackdrop) {
            this.modalBackdrop = document.createElement('div');
            this.modalBackdrop.className = 'modal-backdrop fade show';
            document.body.appendChild(this.modalBackdrop);
        }

        setTimeout(() => {
            this.modalNameInput?.focus();
            this.modalNameInput?.select();
        }, 50);
    }

    hideCadastroModalFallback() {
        if (!this.modalEl) return;

        this.modalEl.classList.remove('show');
        this.modalEl.style.display = 'none';
        this.modalEl.setAttribute('aria-hidden', 'true');
        this.modalEl.removeAttribute('aria-modal');
        this.modalEl.removeAttribute('role');
        document.body.classList.remove('modal-open');
        document.body.style.removeProperty('overflow');

        if (this.modalBackdrop) {
            this.modalBackdrop.remove();
            this.modalBackdrop = null;
        }

        this.handleModalHidden();
    }

    openCadastroModal(documentKey) {
        this.modalSaved = false;
        if (this.modalDocumentInput) this.modalDocumentInput.value = formatDocument(documentKey);
        if (this.modalNameInput) this.modalNameInput.value = '';
        if (this.modalBirthdateInput) this.modalBirthdateInput.value = '';
        if (this.modalWhatsappInput) this.modalWhatsappInput.value = '';
        if (this.modalEmailInput) this.modalEmailInput.value = '';
        this.hideModalFeedback();

        const modalInstance = this.getModalInstance();
        if (modalInstance) {
            modalInstance.show();
            setTimeout(() => {
                this.modalNameInput?.focus();
                this.modalNameInput?.select();
            }, 150);
        } else {
            this.showCadastroModalFallback();
        }
    }

    hideCadastroModal() {
        const modalInstance = this.getModalInstance();
        if (modalInstance) {
            modalInstance.hide();
        } else {
            this.hideCadastroModalFallback();
        }
    }

    handleModalHidden() {
        this.hideModalFeedback();

        if (this.modalSaved) {
            this.modalSaved = false;
            return;
        }

        if (this.unknownCheckbox?.checked) return;

        fillCustomer({ documento: '', nome: '' });
        this.pendingDocument = '';
        this.updatePendingButtonState();
        setStatus('Cadastro cancelado. Informe um CPF ou CNPJ para continuar.', 'warning');
    }

    showModalFeedback(message) {
        if (!this.modalFeedback) return;
        this.modalFeedback.textContent = message;
        this.modalFeedback.classList.remove('d-none');
    }

    hideModalFeedback() {
        if (!this.modalFeedback) return;
        this.modalFeedback.textContent = '';
        this.modalFeedback.classList.add('d-none');
    }

    getFilteredCustomers(query) {
        const digits = onlyDigits(query);
        if (!digits) return [];
        return this.allCustomers.filter((customer) => customer.documento.includes(digits)).slice(0, 8);
    }

    renderSuggestions(query) {
        if (!this.suggestionsEl) return;
        this.suggestionsEl.innerHTML = '';

        const digits = onlyDigits(query);
        if (!digits) {
            this.hideSuggestions();
            return;
        }

        const matches = this.getFilteredCustomers(digits);

        if (!matches.length) {
            const emptyState = document.createElement('div');
            emptyState.className = 'pdv-customer-suggestion';
            emptyState.setAttribute('aria-disabled', 'true');

            const title = document.createElement('span');
            title.className = 'pdv-customer-suggestion-document';
            title.textContent = formatDocument(digits);

            const subtitle = document.createElement('span');
            subtitle.className = 'pdv-customer-suggestion-name';
            subtitle.textContent = 'Cliente n\u00e3o cadastrado';

            emptyState.appendChild(title);
            emptyState.appendChild(subtitle);
            this.suggestionsEl.appendChild(emptyState);
            this.suggestionsEl.classList.remove('d-none');
            return;
        }

        matches.forEach((customer) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'pdv-customer-suggestion';
            button.dataset.document = customer.documento;

            const title = document.createElement('span');
            title.className = 'pdv-customer-suggestion-document';
            title.textContent = formatDocument(customer.documento);

            const subtitle = document.createElement('span');
            subtitle.className = 'pdv-customer-suggestion-name';
            subtitle.textContent = customer.nome || 'Sem nome';

            button.appendChild(title);
            button.appendChild(subtitle);
            button.addEventListener('click', async () => {
                await this.selectCustomer(customer.documento);
            });

            this.suggestionsEl.appendChild(button);
        });

        this.suggestionsEl.classList.remove('d-none');
    }

    hideSuggestions() {
        if (!this.suggestionsEl) return;
        this.suggestionsEl.classList.add('d-none');
        this.suggestionsEl.innerHTML = '';
    }

    async selectCustomer(documentKey) {
        this.pendingDocument = onlyDigits(documentKey);
        fillCustomer({ documento: this.pendingDocument, nome: '' });
        this.hideSuggestions();
        await this.searchCustomer({ openModalOnMissing: false, forcedDocument: this.pendingDocument });
    }

    async searchCustomer({ openModalOnMissing = false, forcedDocument = '' } = {}) {
        const documentKey = onlyDigits(forcedDocument || this.documentInput?.value);
        if (this.unknownCheckbox?.checked) return;

        if (!documentKey) {
            fillCustomer({ documento: '', nome: '' });
            this.updatePendingButtonState();
            setStatus('Informe um CPF ou CNPJ para localizar o cliente.', 'warning');
            return;
        }

        this.pendingDocument = documentKey;

        try {
            const snapshot = await get(ref(database, `clientes/${documentKey}`));

            if (snapshot.exists()) {
                const customer = snapshot.val() || {};
                fillCustomer({ documento: documentKey, nome: customer.nome || customer.name || '' });
                this.updatePendingButtonState();
                setStatus('Cliente localizado com sucesso.', 'success');
                return;
            }

            fillCustomer({ documento: documentKey, nome: '' });
            this.updatePendingButtonState();
            setStatus('Cliente n\u00e3o cadastrado.', 'warning');

            if (openModalOnMissing) this.openCadastroModal(documentKey);
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            setStatus('N\u00e3o foi poss\u00edvel buscar o cliente no Firebase.', 'danger');
        }
    }

    async ensureUnknownCustomerExists() {
        const snapshot = await get(ref(database, `clientes/${UNKNOWN_CUSTOMER_DOCUMENT}`));
        if (snapshot.exists()) return;

        await set(ref(database, `clientes/${UNKNOWN_CUSTOMER_DOCUMENT}`), {
            cpfCnpj: UNKNOWN_CUSTOMER_DOCUMENT,
            nome: UNKNOWN_CUSTOMER_NAME
        });
        await this.loadCustomers();
    }

    async toggleUnknownCustomer(enabled) {
        if (enabled) {
            this.hideSuggestions();
            await this.ensureUnknownCustomerExists();
            this.pendingDocument = UNKNOWN_CUSTOMER_DOCUMENT;

            if (this.documentInput) {
                this.documentInput.value = '';
                this.documentInput.disabled = true;
            }
            if (this.nameInput) {
                this.nameInput.value = '';
                this.nameInput.disabled = true;
            }

            this.updatePendingButtonState();
            setStatus('Cliente marcado como n\u00e3o informado.', 'warning');
            return;
        }

        if (this.documentInput) this.documentInput.disabled = false;
        if (this.nameInput) this.nameInput.disabled = false;
        fillCustomer({ documento: '', nome: '' });
        this.pendingDocument = '';
        this.updatePendingButtonState();
        setStatus('Informe um CPF ou CNPJ para localizar o cliente.');
        this.documentInput?.focus();
    }

    async saveCustomer() {
        const documentKey = this.pendingDocument || onlyDigits(this.documentInput?.value);
        const nome = normalizeName(this.modalNameInput?.value || '');
        const dataNascimento = String(this.modalBirthdateInput?.value || '').trim();
        const whatsappDigits = onlyDigits(this.modalWhatsappInput?.value || '');
        const whatsapp = whatsappDigits ? formatWhatsapp(whatsappDigits) : '';
        const email = normalizeEmail(this.modalEmailInput?.value || '');

        if (!documentKey) {
            this.showModalFeedback('Documento invalido para cadastro.');
            return;
        }

        if (!nome) {
            this.showModalFeedback('Informe o nome do cliente.');
            this.modalNameInput?.focus();
            return;
        }

        if (whatsappDigits && whatsappDigits.length !== 10 && whatsappDigits.length !== 11) {
            this.showModalFeedback('Informe um WhatsApp valido com DDD.');
            this.modalWhatsappInput?.focus();
            return;
        }

        if (email && !isValidEmail(email)) {
            this.showModalFeedback('Informe um e-mail valido com "@" e ponto apos o arroba.');
            this.modalEmailInput?.focus();
            return;
        }

        this.setSaveLoading(true);
        this.hideModalFeedback();

        try {
            await set(ref(database, `clientes/${documentKey}`), {
                cpfCnpj: documentKey,
                nome,
                dataNascimento,
                whatsapp,
                email
            });

            await this.loadCustomers();
            fillCustomer({ documento: documentKey, nome });
            this.updatePendingButtonState();
            this.modalSaved = true;
            setStatus('Cliente cadastrado e preenchido automaticamente.', 'success');
            this.hideCadastroModal();
        } catch (error) {
            console.error('Erro ao salvar cliente:', error);
            this.showModalFeedback('N\u00e3o foi poss\u00edvel salvar o cliente no Firebase.');
        } finally {
            this.setSaveLoading(false);
        }
    }

    setSaveLoading(isLoading) {
        if (!this.modalSaveButton) return;
        this.modalSaveButton.disabled = isLoading;
        this.modalSaveButton.innerHTML = isLoading
            ? '<i class="fas fa-spinner fa-spin me-1"></i>Salvando'
            : 'Salvar cliente';
    }
}

async function bootstrapPDV() {
    if (window.pdvPage?.documentInput) return window.pdvPage;
    const page = new PDVPage();
    window.pdvPage = page;
    await page.init();
    return page;
}

export async function initPdv() {
    return bootstrapPDV();
}

export async function initPdvSPA() {
    return bootstrapPDV();
}

if (!window.location.pathname.includes('app.html')) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            await bootstrapPDV();
        }, { once: true });
    } else {
        bootstrapPDV();
    }
}
