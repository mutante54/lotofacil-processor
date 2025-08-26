import { ConcursoRepository } from '@domain/ports/ConcursoRepository';
import { LotofacilDataProvider } from '@domain/ports/LotofacilDataProvider';
import { DezenasEstatisticas } from '@domain/value-objects/DezenasEstatisticas';
import { DezenasEstatisticasService } from '@application/services/DezenasEstatisticasService';

export class ProcessLotofacilData {

  private static readonly LATEST_QTD = 50;
  private static readonly TOP_ESTATISTICAS_QTD = 10;

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

        // processando estaticas específicas para os concursos ja salvos
        for (const concurso of newBatch) {
          if (concurso.numero > ProcessLotofacilData.LATEST_QTD) {
            const latest = await this.concursoRepository.findBetweenNumeros(
              (concurso.numero - ProcessLotofacilData.LATEST_QTD),
              concurso.numero - 1
            );
            const estatisticas = DezenasEstatisticasService.calcular(latest, ProcessLotofacilData.TOP_ESTATISTICAS_QTD);
            concurso.estaticPreConcMaisOcorrencias = estatisticas.maisSorteadas.map(d => d.dezena);
            concurso.estaticPreConcMaisAtrasadas = estatisticas.maisAusentes.map(d => d.dezena);

            // Atualiza o concurso na base
            await this.concursoRepository.update(concurso.numero, concurso);
          }
        }
      }
    }

    console.log('Calculando estatísticas dos últimos 50 concursos (inclusive concurso atual)...');
    const latest = await this.concursoRepository.findLatest(ProcessLotofacilData.LATEST_QTD);
    const estatisticas = DezenasEstatisticasService.calcular(latest, ProcessLotofacilData.TOP_ESTATISTICAS_QTD);

    return {
      totalProcessed: concursos.length,
      totalNew: newConcursos,
      estatisticas
    };
  }
}