const SUMUP_TERMINAL_CONFIG = {
    vendor: 'SUMUP',
    deviceVersion: 'SUM075PROLN3800000',
    model: 'D195',
    connection: 'GPRS',
    carrier: 'VODAFONE',
    apn: 'sumup.com.br',
    macAddress: '70-4A-0E-0C-9D-C4',
    integrationMode: 'unsupported_web_d195'
};

function buildUnsupportedError(payload) {
    const error = new Error(
        'A maquininha SumUp D195/Pro nao possui caminho suportado pela Cloud API para este PDV web. ' +
        'Hoje a SumUp direciona POS web/desktop para Cloud API com leitores Solo, enquanto leitores pareados/legados ' +
        'dependem de Android/iOS via SDK ou Payment Switch.'
    );

    error.code = 'SUMUP_UNSUPPORTED_TERMINAL';
    error.details = {
        terminal: SUMUP_TERMINAL_CONFIG,
        attemptedPayload: payload,
        supportedPaths: [
            'Usar um leitor SumUp Solo com Cloud API e backend seguro',
            'Criar um app Android/iOS para usar SDK ou Payment Switch com leitor pareado'
        ]
    };

    return error;
}

export function getSumUpTerminalConfig() {
    return { ...SUMUP_TERMINAL_CONFIG };
}

export function buildSumUpMachinePayload({ amount, currency = 'BRL', saleCode, customerDocument, machineMethod, installments = 1 }) {
    return {
        terminal: getSumUpTerminalConfig(),
        payment: {
            amount: Number(amount || 0),
            currency,
            saleCode: String(saleCode || ''),
            customerDocument: String(customerDocument || ''),
            machineMethod: String(machineMethod || 'credito'),
            installments: Math.max(1, Number(installments || 1))
        }
    };
}

export async function startSumUpMachinePayment(input) {
    const payload = buildSumUpMachinePayload(input);

    if (SUMUP_TERMINAL_CONFIG.integrationMode === 'unsupported_web_d195') {
        throw buildUnsupportedError(payload);
    }

    throw new Error('Modo de integracao SumUp ainda nao configurado.');
}
