import { DezenasEstatisticas, DezenaOcorrencia, DezenaAusente, DezenaMaiorSequencia } from '@domain/value-objects/DezenasEstatisticas';
import { Concurso } from '@domain/entities/Concurso';

export class DezenasEstatisticasService {

  static calcular(concursos: Concurso[], qtdToSlice: number = 5): DezenasEstatisticas {
    if (concursos == null || concursos.length === 0) {
      return DezenasEstatisticas.create([], [], [], [], 0, qtdToSlice);
    }
    // Calcula as dezenas mais sorteadas
    const ocorrencias = new Map<number, number>();
    for (let dezena = 1; dezena <= 25; dezena++) {
      ocorrencias.set(dezena, 0);
    }

    for (const concurso of concursos) {
      for (const dezena of concurso.dezenas) {
        const count = ocorrencias.get(dezena) || 0;
        ocorrencias.set(dezena, count + 1);
      }
    }

    const maisSorteadas: DezenaOcorrencia[] = Array.from(ocorrencias.entries())
      .map(([dezena, count]) => ({ dezena, ocorrencias: count }));

    // Calcula as dezenas mais ausentes e as maiores sequências
    const maisAusentes: DezenaAusente[] = [];
    const maioresSequencias: DezenaMaiorSequencia[] = [];
    const maioresSequenciasAusente: DezenaMaiorSequencia[] = [];
    const concursosOrdenados = [...concursos].sort((a, b) => b.numero - a.numero);

    for (let dezena = 1; dezena <= 25; dezena++) {
      let concursosSemSair = 0;
      let concursosSequenciaOcorr = 0;
      let concursosSequenciaAusente = 0;
      let ultimoConcurso: number | null;
      const sequenciasOcorr: number[] = [];
      const sequenciasAusente: number[] = [];

      ultimoConcurso = null;
      for (const concurso of concursosOrdenados) {
        if (concurso.containsDezena(dezena)) {
          ultimoConcurso = concurso.numero;
          break;
        }
        concursosSemSair++;
      }

      ultimoConcurso = concursosOrdenados[0]?.numero || 0;
      const MIN_SEQUENCIA_OCORR = 2;
      const MIN_SEQUENCIA_AUSENTE = 2;
      for (const concurso of concursosOrdenados) {
        if (concurso.containsDezena(dezena)) {
          concursosSequenciaOcorr = (concurso.numero == ultimoConcurso - 1) ? concursosSequenciaOcorr + 1 : concursosSequenciaOcorr;
          if (concursosSequenciaAusente >= MIN_SEQUENCIA_AUSENTE) {
            sequenciasAusente.push(concursosSequenciaAusente);
          }
          concursosSequenciaAusente = 0;
        } else {
          concursosSequenciaAusente = (concurso.numero == ultimoConcurso - 1) ? concursosSequenciaAusente + 1 : concursosSequenciaAusente;
          if (concursosSequenciaOcorr >= MIN_SEQUENCIA_OCORR) {
            sequenciasOcorr.push(concursosSequenciaOcorr);
          }
          concursosSequenciaOcorr = 0;
        }
        ultimoConcurso = concurso.numero;
      }

      // garante que a última sequência seja adicionada
      if (concursosSequenciaOcorr >= MIN_SEQUENCIA_OCORR) {
        sequenciasOcorr.push(concursosSequenciaOcorr);
      }

      if (concursosSequenciaAusente >= MIN_SEQUENCIA_AUSENTE) {
        sequenciasAusente.push(concursosSequenciaAusente);
      }

      maioresSequencias.push({
        dezena,
        sequencia: sequenciasOcorr
      });

      maioresSequenciasAusente.push({
        dezena,
        sequencia: sequenciasAusente
      });

      maisAusentes.push({
        dezena,
        concursosSemSair,
        ultimoConcurso
      });
    }

    return DezenasEstatisticas.create(maisSorteadas, maisAusentes, maioresSequencias, maioresSequenciasAusente, concursos.length, qtdToSlice);
  }
}