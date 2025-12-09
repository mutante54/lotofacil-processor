import { ConcursoRepository } from '@domain/ports/ConcursoRepository';
import { Concurso } from '@domain/entities/Concurso';
import { DezenasEstatisticasService } from '@application/services/DezenasEstatisticasService';
import { DezenasEstatisticas } from '@/domain/value-objects/DezenasEstatisticas';

export class QueryConcursos {
  constructor(
    private readonly concursoRepository: ConcursoRepository
  ) {}

  async findAll(): Promise<Concurso[]> {
    const concursos = await this.concursoRepository.findAll();

    concursos.forEach(c => {
      c.padraoAlternancia = this.obterPadraoAlternancia(c.dezenas);
    });

    return concursos;
  }

  async findByNumero(numero: number): Promise<Concurso | null> {
    if (numero <= 0) {
      throw new Error('Número do concurso deve ser maior que zero');
    }
    
    return this.concursoRepository.findByNumero(numero);
  }

  async getLatest(limit: number = 10): Promise<Concurso[]> {
    if (limit <= 0 || limit > 100) {
      throw new Error('Limite deve estar entre 1 e 100');
    }
    
    const concursos = await this.concursoRepository.findLatest(limit);
    concursos.forEach(c => {
      c.padraoAlternancia = this.obterPadraoAlternancia(c.dezenas);
    });

    return concursos;
  }

  async getCount(): Promise<number> {
    return this.concursoRepository.count();
  }

  async getDezenasEstatisticas(latestCount: number = 50) : Promise<DezenasEstatisticas> {
    const count = await this.concursoRepository.count();
    if (latestCount <= 0 || latestCount > count) {
      throw new Error('O número de concursos para estatísticas deve estar entre 1 e ' + count);
    }

    const latestConcursos = await this.concursoRepository.findLatest(latestCount);
    return DezenasEstatisticasService.calcular(latestConcursos);
  }

  obterPadraoAlternancia(dezenas: number[]): Map<number, number> | null {
    let padroesAlternancia = new Map<number, number>();
    if (!dezenas || dezenas.length === 0) {
      return null;
    }
    let countPadraoAlternancia2 = 0;
    let countPadraoAlternancia3 = 0;
    let countPadraoAlternancia4 = 0;
    for (let i = 0; i < dezenas.length; i++) {
        const current = dezenas[i];
        // pega a próxima dezena ou 26 se for a última (25 é o maior número possível + 1 para base de calculo)
        const next = i < (dezenas.length - 1) ? dezenas[i + 1] : 26;
        if (current === undefined || next === undefined) {
          continue;
        }
        let diff = next - current;
        if (diff == 3) {
          countPadraoAlternancia2++;
        }
        else if (diff == 4) {
          countPadraoAlternancia3++;
        }
        else if (diff == 5) { 
          countPadraoAlternancia4++;
        }
      }
      if (countPadraoAlternancia2 > 0) {
        padroesAlternancia.set(2, countPadraoAlternancia2);
      }
      if (countPadraoAlternancia3 > 0) {        
        padroesAlternancia.set(3, countPadraoAlternancia3);
      }
      if (countPadraoAlternancia4 > 0) {
        padroesAlternancia.set(4, countPadraoAlternancia4);
      }
      return padroesAlternancia;
    }
}