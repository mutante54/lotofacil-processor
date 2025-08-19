import { ConcursoRepository } from '@domain/ports/ConcursoRepository';
import { Concurso } from '@domain/entities/Concurso';

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
}