
import { Exclude } from 'class-transformer';

export class Concurso {

  @Exclude()
  private static readonly TODAS_DEZENAS = Array.from({ length: 25 }, (_, i) => i + 1);

  private _dezenasNaoSorteadas: number[] = [];

  private constructor(
    private readonly _numero: number,
    private readonly _data: Date,
    private readonly _dezenas: number[],
    private readonly _arrecadacaoTotal: number,
    private readonly _ganhadores15: number,
    private readonly _ganhadores14: number,
    private readonly _ganhadores13: number,
    private readonly _ganhadores12: number,
    private readonly _ganhadores11: number,
    private readonly _valorRateio15: number,
    private readonly _valorRateio14: number,
    private readonly _valorRateio13: number,
    private readonly _valorRateio12: number,
    private readonly _valorRateio11: number,
    private readonly _acumulado15: number,
    private _dezenasSorteadasMasAusentesConcursoAnterior?: number[],
    private _dezenasSorteadasERepetidasConcursoAnterior?: number[]
  ) {
    this.validateDezenas();
    this._dezenasNaoSorteadas = Concurso.TODAS_DEZENAS.filter(d => !this._dezenas.includes(d));
  }

  static create(
    numero: number,
    data: Date,
    dezenas: number[],
    arrecadacaoTotal: number,
    ganhadores15: number,
    ganhadores14: number,
    ganhadores13: number,
    ganhadores12: number,
    ganhadores11: number,
    valorRateio15: number,
    valorRateio14: number,
    valorRateio13: number,
    valorRateio12: number,
    valorRateio11: number,
    acumulado15: number,
    dezenasSorteadasMasAusentesConcursoAnterior?: number[],
    dezenasSorteadasERepetidasConcursoAnterior?: number[]
  ): Concurso {
    return new Concurso(
      numero,
      data,
      dezenas,
      arrecadacaoTotal,
      ganhadores15,
      ganhadores14,
      ganhadores13,
      ganhadores12,
      ganhadores11,
      valorRateio15,
      valorRateio14,
      valorRateio13,
      valorRateio12,
      valorRateio11,
      acumulado15,
      dezenasSorteadasMasAusentesConcursoAnterior,
      dezenasSorteadasERepetidasConcursoAnterior
    );
  }

  private validateDezenas(): void {
    if (this._dezenas.length !== 15) {
      throw new Error('Um concurso da Lotofácil deve ter exatamente 15 dezenas');
    }

    const invalidDezenas = this._dezenas.filter(dezena => dezena < 1 || dezena > 25);
    if (invalidDezenas.length > 0) {
      throw new Error('Todas as dezenas devem estar entre 1 e 25');
    }

    const uniqueDezenas = new Set(this._dezenas);
    if (uniqueDezenas.size !== 15) {
      throw new Error('Não podem haver dezenas repetidas no mesmo concurso');
    }
  }

  get numero(): number {
    return this._numero;
  }

  get data(): Date {
    return this._data;
  }

  get dezenas(): number[] {
    return [...this._dezenas].sort((a, b) => a - b);
  }

  get arrecadacaoTotal(): number {
    return this._arrecadacaoTotal;
  }

  get premiacoes(): {
    ganhadores15: number;
    ganhadores14: number;
    ganhadores13: number;
    ganhadores12: number;
    ganhadores11: number;
    valorRateio15: number;
    valorRateio14: number;
    valorRateio13: number;
    valorRateio12: number;
    valorRateio11: number;
    acumulado15: number;
  } {
    return {
      ganhadores15: this._ganhadores15,
      ganhadores14: this._ganhadores14,
      ganhadores13: this._ganhadores13,
      ganhadores12: this._ganhadores12,
      ganhadores11: this._ganhadores11,
      valorRateio15: this._valorRateio15,
      valorRateio14: this._valorRateio14,
      valorRateio13: this._valorRateio13,
      valorRateio12: this._valorRateio12,
      valorRateio11: this._valorRateio11,
      acumulado15: this._acumulado15
    };
  }

  get dezenasNaoSorteadas(): number[] {
    return [...this._dezenasNaoSorteadas].sort((a, b) => a - b);
  }

  get dezenasSorteadasMasAusentesConcursoAnterior(): number[] {
    return [...(this._dezenasSorteadasMasAusentesConcursoAnterior || [])].sort((a, b) => a - b);
  }

  set dezenasSorteadasMasAusentesConcursoAnterior(dezenas: number[]) {
    this._dezenasSorteadasMasAusentesConcursoAnterior = [...dezenas];
  }

  public get dezenasSorteadasERepetidasConcursoAnterior(): number[] {
    return [...(this._dezenasSorteadasERepetidasConcursoAnterior || [])].sort((a, b) => a - b);
  }
  public set dezenasSorteadasERepetidasConcursoAnterior(value: number[]) {
    this._dezenasSorteadasERepetidasConcursoAnterior = value;
  }

  containsDezena(dezena: number): boolean {
    return this._dezenas.includes(dezena);
  }
}