/**
 * Geração de etiquetas ZPL para impressoras Zebra
 * 
 * Este módulo gera códigos ZPL (Zebra Programming Language) para impressão
 * de etiquetas de vacinação com todos os dados relevantes.
 */

interface VaccinationData {
  patientName: string;
  patientCPF: string;
  vaccineName: string;
  lote: string;
  dataAplicacao: Date;
  dataValidade: Date;
  unidade: string;
  profissional?: string;
  qrCodeUrl?: string; // URL para etiqueta virtual na ADP
}

/**
 * Gera código ZPL para etiqueta de vacinação
 * 
 * Formato da etiqueta (10x5 cm):
 * - Cabeçalho com título
 * - Nome do paciente e CPF
 * - Nome da vacina
 * - Lote e validade
 * - Data de aplicação
 * - Unidade e profissional
 * - QR Code para etiqueta virtual
 * 
 * @param data Dados da vacinação
 * @returns Código ZPL pronto para envio à impressora
 */
export function generateVaccinationLabelZPL(data: VaccinationData): string {
  const {
    patientName,
    patientCPF,
    vaccineName,
    lote,
    dataAplicacao,
    dataValidade,
    unidade,
    profissional,
    qrCodeUrl
  } = data;

  // Formatar datas
  const dataAplicacaoFormatada = dataAplicacao.toLocaleDateString('pt-BR');
  const dataValidadeFormatada = dataValidade.toLocaleDateString('pt-BR');

  // Construir código ZPL
  const zpl = `
^XA

~TA000
~JSN
^LT0
^MNW
^MTT
^PON
^PMN
^LH0,0
^JMA
^PR6,6
~SD15
^JUS
^LRN
^CI27
^PA0,1,1,0
^XZ

^XA
^MMT
^PW812
^LL406
^LS0

^FT50,50^A0N,30,30^FH^FDCOMPROVANTE DE VACINAÇÃO^FS

^FT50,100^A0N,25,25^FH^FDPaciente:^FS
^FT50,130^A0N,30,30^FH^FD${patientName}^FS
^FT50,160^A0N,20,20^FH^FDCPF: ${patientCPF}^FS

^FT50,210^A0N,25,25^FH^FDVacina:^FS
^FT50,240^A0N,28,28^FH^FD${vaccineName}^FS

^FT50,290^A0N,20,20^FH^FDLote: ${lote}^FS
^FT50,315^A0N,20,20^FH^FDValidade: ${dataValidadeFormatada}^FS

^FT50,355^A0N,20,20^FH^FDAplicação: ${dataAplicacaoFormatada}^FS
^FT50,380^A0N,18,18^FH^FDUnidade: ${unidade}^FS
${profissional ? `^FT50,405^A0N,18,18^FH^FDProfissional: ${profissional}^FS` : ''}

${qrCodeUrl ? `
^FO600,100^BQN,2,6
^FDQA,${qrCodeUrl}^FS
^FT550,380^A0N,15,15^FH^FDEtiqueta Virtual^FS
` : ''}

^PQ1,0,1,Y
^XZ
`.trim();

  return zpl;
}

/**
 * Envia código ZPL para impressora Zebra via rede
 * 
 * @param zpl Código ZPL gerado
 * @param printerIP Endereço IP da impressora
 * @param printerPort Porta da impressora (padrão: 9100)
 * @returns Promise que resolve quando a impressão for enviada
 */
export async function sendZPLToPrinter(
  zpl: string,
  printerIP: string,
  printerPort: number = 9100
): Promise<void> {
  const net = await import('net');

  return new Promise((resolve, reject) => {
    const client = new net.Socket();

    client.connect(printerPort, printerIP, () => {
      client.write(zpl);
      client.end();
    });

    client.on('close', () => {
      resolve();
    });

    client.on('error', (err) => {
      reject(new Error(`Erro ao enviar para impressora: ${err.message}`));
    });

    // Timeout de 10 segundos
    client.setTimeout(10000, () => {
      client.destroy();
      reject(new Error('Timeout ao conectar com a impressora'));
    });
  });
}

/**
 * Gera URL de etiqueta virtual para QR Code
 * 
 * @param tenantId ID do tenant
 * @param applicationId ID da aplicação
 * @returns URL completa para acesso à etiqueta virtual
 */
export function generateVirtualLabelURL(
  tenantId: number,
  applicationId: number
): string {
  const baseURL = process.env.VITE_APP_URL || 'https://vis.taetter.com.br';
  return `${baseURL}/patient/${tenantId}/vaccination/${applicationId}`;
}
