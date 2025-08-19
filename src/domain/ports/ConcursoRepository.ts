import { Concurso } from '@domain/entities/Concurso';

export interface ConcursoRepository {
  save(concurso: Concurso): Promise<void>;
  saveMany(concursos: Concurso[]): Promise<void>;
  findByNumero(numero: number): Promise<Concurso | null>;
  findAll(): Promise<Concurso[]>;
  findLatest(limit: number): Promise<Concurso[]>;
  exists(numero: number): Promise<boolean>;
  count(): Promise<number>;
  deleteAll(): Promise<void>;
}