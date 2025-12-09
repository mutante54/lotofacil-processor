export interface DezenaOcorrencia {
  dezena: number;
  ocorrencias: number;
}

export interface DezenaAusente {
  dezena: number;
  concursosSemSair: number;
  ultimoConcurso?: number | null;
}

export interface DezenaMaiorSequencia {
  dezena: number;
  sequencia: number[];
}

export class DezenasEstatisticas {  
  private constructor(
    private readonly _maisSorteadas: DezenaOcorrencia[],
    private readonly _maisAusentes: DezenaAusente[],
    private readonly _totalConcursosAnalisados: number,
    private readonly _maioresSequencias: DezenaMaiorSequencia[],
    private readonly _maioresSequenciasAusente: DezenaMaiorSequencia[]
  ) {}

  static create(
    maisSorteadas: DezenaOcorrencia[],
    maisAusentes: DezenaAusente[],
    maioresSequencias: DezenaMaiorSequencia[],
    maioresSequenciasAusente: DezenaMaiorSequencia[],
    totalConcursosAnalisados: number,
    qtdTop: number = 10
  ): DezenasEstatisticas {
    const sortedMaisSorteadas = [...maisSorteadas]
      .sort((a, b) => b.ocorrencias - a.ocorrencias)
      .slice(0, qtdTop);

    const sortedMaisAusentes = [...maisAusentes]
      .sort((a, b) => b.concursosSemSair - a.concursosSemSair)
      .slice(0, qtdTop);
    
    const sortedMaioresSequencias = [...maioresSequencias]
  .sort((a, b) => {
    const maxA = a.sequencia.length ? Math.max(...a.sequencia) : 0;
    const maxB = b.sequencia.length ? Math.max(...b.sequencia) : 0;
    return maxB - maxA;
  })
  .slice(0, maioresSequencias.length);

  const sortedMaioresSequenciasAusente = [...maioresSequenciasAusente]
  .sort((a, b) => {
    const maxA = a.sequencia.length ? Math.max(...a.sequencia) : 0;
    const maxB = b.sequencia.length ? Math.max(...b.sequencia) : 0;
    return maxB - maxA;
  })
  .slice(0, maioresSequenciasAusente.length);

    return new DezenasEstatisticas(
      sortedMaisSorteadas,
      sortedMaisAusentes,
      totalConcursosAnalisados,
      sortedMaioresSequencias,
      sortedMaioresSequenciasAusente
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

  public get maioresSequencias(): DezenaMaiorSequencia[] {
    return this._maioresSequencias;
  }

  public get maioresSequenciasAusente(): DezenaMaiorSequencia[] {
    return this._maioresSequenciasAusente;
  }

  toJSON(): {
    maisSorteadas: DezenaOcorrencia[];
    maisAusentes: DezenaAusente[];
    totalConcursosAnalisados: number;
    maioresSequencias: DezenaMaiorSequencia[];
    maioresSequenciasAusente: DezenaMaiorSequencia[];
  } {
    return {
      maisSorteadas: this.maisSorteadas,
      maisAusentes: this.maisAusentes,
      maioresSequencias: this.maioresSequencias,
      maioresSequenciasAusente: this.maioresSequenciasAusente,
      totalConcursosAnalisados: this.totalConcursosAnalisados,
    };
  }
}