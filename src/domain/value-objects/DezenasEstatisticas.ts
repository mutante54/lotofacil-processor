export interface DezenaOcorrencia {
  dezena: number;
  ocorrencias: number;
}

export interface DezenaAusente {
  dezena: number;
  concursosSemSair: number;
  ultimoConcurso?: number;
}

export class DezenasEstatisticas {
  private constructor(
    private readonly _maisSorteadas: DezenaOcorrencia[],
    private readonly _maisAusentes: DezenaAusente[],
    private readonly _totalConcursosAnalisados: number
  ) {}

  static create(
    maisSorteadas: DezenaOcorrencia[],
    maisAusentes: DezenaAusente[],
    totalConcursosAnalisados: number,
    qtdTop: number = 10
  ): DezenasEstatisticas {
    const sortedMaisSorteadas = [...maisSorteadas]
      .sort((a, b) => b.ocorrencias - a.ocorrencias)
      .slice(0, qtdTop);

    const sortedMaisAusentes = [...maisAusentes]
      .sort((a, b) => b.concursosSemSair - a.concursosSemSair)
      .slice(0, qtdTop);

    return new DezenasEstatisticas(
      sortedMaisSorteadas,
      sortedMaisAusentes,
      totalConcursosAnalisados
    );
  }

  get maisSorteadas(): DezenaOcorrencia[] {
    return [...this._maisSorteadas];
  }

  get maisAusentes(): DezenaAusente[] {
    return [...this._maisAusentes];
  }

  get totalConcursosAnalisados(): number {
    return this._totalConcursosAnalisados;
  }

  toJSON(): {
    maisSorteadas: DezenaOcorrencia[];
    maisAusentes: DezenaAusente[];
    totalConcursosAnalisados: number;
  } {
    return {
      maisSorteadas: this.maisSorteadas,
      maisAusentes: this.maisAusentes,
      totalConcursosAnalisados: this.totalConcursosAnalisados
    };
  }
}