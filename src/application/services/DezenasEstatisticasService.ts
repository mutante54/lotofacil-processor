import { DezenasEstatisticas, DezenaOcorrencia, DezenaAusente } from '@domain/value-objects/DezenasEstatisticas';
import { Concurso } from '@domain/entities/Concurso';

export class DezenasEstatisticasService {

  static calcular(concursos: Concurso[], qtdToSlice: number = 10): DezenasEstatisticas {
    if (concursos == null || concursos.length === 0) {
      return DezenasEstatisticas.create([], [], 0, qtdToSlice);
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

    // Calcula as dezenas mais ausentes
    const maisAusentes: DezenaAusente[] = [];
    const concursosOrdenados = [...concursos].sort((a, b) => b.numero - a.numero);

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

    return DezenasEstatisticas.create(maisSorteadas, maisAusentes, concursos.length, qtdToSlice);
  }
}