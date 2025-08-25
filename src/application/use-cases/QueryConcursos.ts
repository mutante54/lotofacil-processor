import { ConcursoRepository } from '@domain/ports/ConcursoRepository';
import { Concurso } from '@domain/entities/Concurso';
import { DezenasEstatisticasService } from '@application/services/DezenasEstatisticasService';
import { DezenasEstatisticas } from '@/domain/value-objects/DezenasEstatisticas';

export class QueryConcursos {
  constructor(
    private readonly concursoRepository: ConcursoRepository
  ) {}

  async findAll(): Promise<Concurso[]> {
    return this.concursoRepository.findAll();
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
    
    return this.concursoRepository.findLatest(limit);
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
}