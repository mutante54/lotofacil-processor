import { ConcursoRepository } from '@domain/ports/ConcursoRepository';
import { LotofacilDataProvider } from '@domain/ports/LotofacilDataProvider';
import { DezenasEstatisticas, DezenaOcorrencia, DezenaAusente } from '@domain/value-objects/DezenasEstatisticas';

export class ProcessLotofacilData {
  constructor(
    private readonly concursoRepository: ConcursoRepository,
    private readonly dataProvider: LotofacilDataProvider
  ) { }

  async execute(): Promise<{
    totalProcessed: number;
    totalNew: number;
    estatisticas: DezenasEstatisticas;
  }> {
    console.log('Iniciando download e processamento dos dados históricos...');
    const concursos = await this.dataProvider.downloadHistoricalData();

    console.log(`Encontrados ${concursos.length} concursos na planilha`);

    let newConcursos = 0;

    // Processa concursos em lotes para melhor performance
    const batchSize = 100;
    for (let i = 0; i < concursos.length; i += batchSize) {
      const batch = concursos.slice(i, i + batchSize);
      const newBatch = [];

      for (const concurso of batch) {
        const exists = await this.concursoRepository.exists(concurso.numero);
        if (!exists) {
          if (concurso.numero > 1) {
            let concursoAnterior = concursos.find(c => c.numero === (concurso.numero - 1));
            if (!concursoAnterior) {
              concursoAnterior = await this.concursoRepository.findByNumero(concurso.numero - 1) || undefined;
            }
            concurso.dezenasSorteadasMasAusentesConcursoAnterior = concursoAnterior ? concurso.dezenas.filter(c => concursoAnterior.dezenasNaoSorteadas.includes(c)) : [];
            concurso.dezenasSorteadasERepetidasConcursoAnterior = concursoAnterior ? concurso.dezenas.filter(c => concursoAnterior.dezenas.includes(c)) : [];
          }
          newBatch.push(concurso);
          newConcursos++;
        }
      }

      if (newBatch.length > 0) {
        await this.concursoRepository.saveMany(newBatch);
        console.log(`Salvos ${newBatch.length} novos concursos (lote ${Math.floor(i / batchSize) + 1})`);
      }
    }

    console.log('Calculando estatísticas dos últimos 50 concursos...');
    const estatisticas = await this.calculateStatistics();

    return {
      totalProcessed: concursos.length,
      totalNew: newConcursos,
      estatisticas
    };
  }

  private async calculateStatistics(): Promise<DezenasEstatisticas> {
    const latest50 = await this.concursoRepository.findLatest(50);

    // Calcula as dezenas mais sorteadas
    const ocorrencias = new Map<number, number>();
    for (let dezena = 1; dezena <= 25; dezena++) {
      ocorrencias.set(dezena, 0);
    }

    for (const concurso of latest50) {
      for (const dezena of concurso.dezenas) {
        const count = ocorrencias.get(dezena) || 0;
        ocorrencias.set(dezena, count + 1);
      }
    }

    const maisSorteadas: DezenaOcorrencia[] = Array.from(ocorrencias.entries())
      .map(([dezena, count]) => ({ dezena, ocorrencias: count }));

    // Calcula as dezenas mais ausentes
    const maisAusentes: DezenaAusente[] = [];
    const concursosOrdenados = [...latest50].sort((a, b) => b.numero - a.numero);

    for (let dezena = 1; dezena <= 25; dezena++) {
      let concursosSemSair = 0;
      let ultimoConcurso: number | undefined;

      for (const concurso of concursosOrdenados) {
        if (concurso.containsDezena(dezena)) {
          ultimoConcurso = concurso.numero;
          break;
        }
        concursosSemSair++;
      }

      maisAusentes.push({
        dezena,
        concursosSemSair,
        ultimoConcurso
      });
    }

    return DezenasEstatisticas.create(maisSorteadas, maisAusentes, latest50.length);
  }
}