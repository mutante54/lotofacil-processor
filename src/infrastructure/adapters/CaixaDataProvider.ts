import axios from 'axios';
import * as XLSX from 'xlsx';
import { LotofacilDataProvider } from '@domain/ports/LotofacilDataProvider';
import { Concurso } from '@/domain/entities/Concurso';

export class CaixaDataProvider implements LotofacilDataProvider {
  private readonly url: string;
  private readonly filePath: string;

  constructor() {
    const envUrl = process.env.LOTOFACIL_CAIXA_SPREADSHEET_DOWNLOAD_URL;
    const envFilePath = process.env.LOTOFACIL_CAIXA_SPREADSHEET_FILE_PATH;
    if (!envUrl || !envFilePath) {
      throw new Error('Configuração LOTOFACIL_CAIXA_SPREADSHEET_DOWNLOAD_URL e LOTOFACIL_CAIXA_SPREADSHEET_FILE_PATH não definidas.');
    }
    this.url = envUrl;
    this.filePath = envFilePath;
  }

  async downloadHistoricalData(): Promise<Concurso[]> {
    try {
      const response = await axios.get(this.url, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      if (response.status !== 200) {
        throw new Error(`Falha ao baixar dados: Status ${response.status}`);
      }

      return await this.processLotofacilData(Buffer.from(response.data));
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro ao baixar dados da Caixa: ${error.message}`);
      }
      throw new Error('Erro desconhecido ao baixar dados da Caixa');
    }
  }

  private async processLotofacilData(buffer: Buffer): Promise<Concurso[]> {
    try {
      // const workbook = XLSX.read(buffer, { type: 'buffer' });      
      const workbook = XLSX.readFile(this.filePath);
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        throw new Error('Planilha não contém abas');
      }

      const sheet = workbook.Sheets[sheetName];
      if (!sheet) {
        throw new Error('Não foi possível acessar a primeira aba da planilha');
      }

      const jsonData: any[][] = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: null
      });

      if (jsonData.length < 2) {
        throw new Error('Planilha deve conter pelo menos uma linha de cabeçalho e uma linha de dados');
      }

      // Remove cabeçalho
      const dataRows = jsonData.slice(1);
      const concursos: Concurso[] = [];

      for (const row of dataRows) {
        try {
          const concurso = this.parseRowToConcurso(row);
          if (concurso) {
            concursos.push(concurso);
          }
        } catch (error) {
          console.warn(`Erro ao processar linha: ${error}`);
          continue;
        }
      }

      return concursos.sort((a, b) => a.numero - b.numero);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Erro ao processar planilha Excel: ${error.message}`);
      }
      throw new Error('Erro desconhecido ao processar planilha Excel');
    }
  }

  private parseRowToConcurso(row: any[]): Concurso | null {
    if (!row || row.length < 18) {
      return null;
    }

    // Coluna A - Número do concurso
    const numero = this.parseNumber(row[0]);
    if (!numero || numero <= 0) {
      return null;
    }

    // Coluna B - Data do sorteio
    const data = this.parseDate(row[1]);
    if (!data) {
      return null;
    }

    // Colunas C a Q - Dezenas sorteadas (15 dezenas)
    const dezenas: number[] = [];
    for (let i = 2; i <= 16; i++) {
      const dezena = this.parseNumber(row[i]);
      if (dezena && dezena >= 1 && dezena <= 25) {
        dezenas.push(dezena);
      }
    }

    if (dezenas.length !== 15) {
      return null;
    }

    // Coluna R - Arrecadação Total
    const arrecadacaoTotal = this.parseNumber(row[17]) || 0;

    // Para simplificação, definindo valores padrão para as premiações
    // Em um cenário real, essas colunas estariam na planilha
    return Concurso.create(
      numero,
      data,
      dezenas,
      arrecadacaoTotal,
      0, // ganhadores15
      0, // ganhadores14
      0, // ganhadores13
      0, // ganhadores12
      0, // ganhadores11
      0, // valorRateio15
      0, // valorRateio14
      0, // valorRateio13
      0, // valorRateio12
      0, // valorRateio11
      0  // acumulado15
    );
  }

  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const num = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
    return isNaN(num) ? null : num;
  }

  private parseDate(value: any): Date | null {
    if (!value) {
      return null;
    }

    // Número Excel (data serial)
    if (typeof value === 'number') {
      const parsed = XLSX.SSF.parse_date_code(value);
      if (!parsed || !parsed.y || !parsed.m || !parsed.d) {
        return null;
      }
      const dateFromSerial = new Date(parsed.y, parsed.m - 1, parsed.d);
      return isNaN(dateFromSerial.getTime()) ? null : dateFromSerial;
    }

    // String
    const dateStr = String(value).trim();

    // Tenta parse nativo (ISO, etc.)
    const native = new Date(dateStr);
    if (!isNaN(native.getTime())) {
      return native;
    }

    // Tenta dd/MM/yyyy ou dd-MM-yyyy (também aceita dd/M/yy etc.)
    const match = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2}|\d{4})$/);
    if (match) {
      const day = parseInt(match[1]!, 10);
      const month = parseInt(match[2]!, 10);
      let year = parseInt(match[3]!, 10);
      if (year < 100) {
        year += year >= 70 ? 1900 : 2000;
      }

      const d = new Date(year, month - 1, day);
      if (
        d.getFullYear() === year &&
        d.getMonth() === month - 1 &&
        d.getDate() === day
      ) {
        return d;
      }
      return null;
    }

    return null;
  }

}