import { Document, Schema, model, connect } from 'mongoose';
import { ConcursoRepository } from '@domain/ports/ConcursoRepository';
import { Concurso } from '@domain/entities/Concurso';

interface ConcursoDocument extends Document {
  numero: number;
  data: Date;
  dezenas: number[];
  arrecadacaoTotal: number;
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
  dezenasNaoSorteadas: number[];
  dezenasSorteadasMasAusentesConcursoAnterior: number[];
  dezenasSorteadasERepetidasConcursoAnterior: number[];
  estaticPreConcMaisOcorrencias: number[];
  estaticPreConcMaisAtrasadas: number[];
}

const concursoSchema = new Schema<ConcursoDocument>({
  numero: { type: Number, required: true, unique: true, index: true },
  data: { type: Date, required: true },
  dezenas: { type: [Number], required: true, validate: [arrayLimit, '{PATH} deve ter exatamente 15 elementos'] },
  arrecadacaoTotal: { type: Number, required: true, min: 0 },
  ganhadores15: { type: Number, required: true, min: 0 },
  ganhadores14: { type: Number, required: true, min: 0 },
  ganhadores13: { type: Number, required: true, min: 0 },
  ganhadores12: { type: Number, required: true, min: 0 },
  ganhadores11: { type: Number, required: true, min: 0 },
  valorRateio15: { type: Number, required: true, min: 0 },
  valorRateio14: { type: Number, required: true, min: 0 },
  valorRateio13: { type: Number, required: true, min: 0 },
  valorRateio12: { type: Number, required: true, min: 0 },
  valorRateio11: { type: Number, required: true, min: 0 },
  acumulado15: { type: Number, required: true, min: 0 },
  dezenasNaoSorteadas: { type: [Number], required: true },
  dezenasSorteadasMasAusentesConcursoAnterior: { type: [Number], required: false },
  dezenasSorteadasERepetidasConcursoAnterior: { type: [Number], required: false },
  estaticPreConcMaisOcorrencias: { type: [Number], required: false },
  estaticPreConcMaisAtrasadas: { type: [Number], required: false }
}, {
  timestamps: true,
  versionKey: false
});

function arrayLimit(val: number[]): boolean {
  return val.length === 15;
}

const ConcursoModel = model<ConcursoDocument>('Concurso', concursoSchema);

export class MongoConcursoRepository implements ConcursoRepository {
  
  async update(numero: number, concurso: Concurso): Promise<void> {
    await ConcursoModel.updateOne(
      { numero },
      this.toDocument(concurso),
      { upsert: false }
    ).exec();
  }
  
  async findBetweenNumeros(start: number, end: number): Promise<Concurso[]> {
    const documents = await ConcursoModel
      .find({ numero: { $gte: start, $lte: end } })
      .sort({ numero: 1 })
      .exec();
    return documents.map(doc => this.toDomain(doc));
  }
  private isConnected = false;

  async connect(connectionString: string): Promise<void> {
    if (!this.isConnected) {
      await connect(connectionString);
      this.isConnected = true;
      console.log('Conectado ao MongoDB');
    }
  }

  async save(concurso: Concurso): Promise<void> {
    const document = new ConcursoModel(this.toDocument(concurso));
    await document.save();
  }

  async saveMany(concursos: Concurso[]): Promise<void> {
    if (concursos.length === 0) return;

    const documents = concursos.map(concurso => this.toDocument(concurso));
    await ConcursoModel.insertMany(documents, { ordered: false });
  }

  async findByNumero(numero: number): Promise<Concurso | null> {
    const document = await ConcursoModel.findOne({ numero }).exec();
    return document ? this.toDomain(document) : null;
  }

  async findAll(): Promise<Concurso[]> {
    const documents = await ConcursoModel.find().sort({ numero: 1 }).exec();
    return documents.map(doc => this.toDomain(doc));
  }

  async findLatest(limit: number): Promise<Concurso[]> {
    const documents = await ConcursoModel
      .find()
      .sort({ numero: -1 })
      .limit(limit)
      .exec();

    return documents.map(doc => this.toDomain(doc));
  }

  async exists(numero: number): Promise<boolean> {
    const document = await ConcursoModel.findOne({ numero }).select('numero').exec();
    return document !== null;
  }

  async count(): Promise<number> {
    return ConcursoModel.countDocuments().exec();
  }

  async deleteAll(): Promise<void> {
    await ConcursoModel.deleteMany({}).exec();
  }

  private toDocument(concurso: Concurso): any {
    const premiacoes = concurso.premiacoes;

    return {
      numero: concurso.numero,
      data: concurso.data,
      dezenas: concurso.dezenas,
      arrecadacaoTotal: concurso.arrecadacaoTotal,
      ganhadores15: premiacoes.ganhadores15,
      ganhadores14: premiacoes.ganhadores14,
      ganhadores13: premiacoes.ganhadores13,
      ganhadores12: premiacoes.ganhadores12,
      ganhadores11: premiacoes.ganhadores11,
      valorRateio15: premiacoes.valorRateio15,
      valorRateio14: premiacoes.valorRateio14,
      valorRateio13: premiacoes.valorRateio13,
      valorRateio12: premiacoes.valorRateio12,
      valorRateio11: premiacoes.valorRateio11,
      acumulado15: premiacoes.acumulado15,
      dezenasNaoSorteadas: concurso.dezenasNaoSorteadas,
      dezenasSorteadasMasAusentesConcursoAnterior: concurso.dezenasSorteadasMasAusentesConcursoAnterior,
      dezenasSorteadasERepetidasConcursoAnterior: concurso.dezenasSorteadasERepetidasConcursoAnterior,
      estaticPreConcMaisOcorrencias: concurso.estaticPreConcMaisOcorrencias,
      estaticPreConcMaisAtrasadas: concurso.estaticPreConcMaisAtrasadas
    };
  }

  private toDomain(document: ConcursoDocument): Concurso {
    return Concurso.create(
      document.numero,
      document.data,
      document.dezenas,
      document.arrecadacaoTotal,
      document.ganhadores15,
      document.ganhadores14,
      document.ganhadores13,
      document.ganhadores12,
      document.ganhadores11,
      document.valorRateio15,
      document.valorRateio14,
      document.valorRateio13,
      document.valorRateio12,
      document.valorRateio11,
      document.acumulado15,
      document.dezenasSorteadasMasAusentesConcursoAnterior,
      document.dezenasSorteadasERepetidasConcursoAnterior,
      document.estaticPreConcMaisOcorrencias,
      document.estaticPreConcMaisAtrasadas
    );
  }
}