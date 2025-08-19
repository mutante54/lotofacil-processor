import { ProcessLotofacilData } from '@application/use-cases/ProcessLotofacilData';
import { QueryConcursos } from '@application/use-cases/QueryConcursos';
import { CaixaDataProvider } from '@infrastructure/adapters/CaixaDataProvider';
import { MongoConcursoRepository } from '@infrastructure/adapters/MongoConcursoRepository';
import { LotofacilRESTApi } from '@infrastructure/adapters/LotofacilRESTApi';

export class Container {
  private static instance: Container;

  private readonly _concursoRepository: MongoConcursoRepository;
  private readonly _dataProvider: CaixaDataProvider;
  private readonly _processLotofacilData: ProcessLotofacilData;
  private readonly _queryConcursos: QueryConcursos;
  private readonly _lotofacilRESTApi: LotofacilRESTApi;

  private constructor() {
    // Adapters (Infrastructure layer)
    this._concursoRepository = new MongoConcursoRepository();
    this._dataProvider = new CaixaDataProvider();

    // Use Cases (Application layer)
    this._processLotofacilData = new ProcessLotofacilData(
      this._concursoRepository,
      this._dataProvider,
    );

    this._queryConcursos = new QueryConcursos(
      this._concursoRepository
    );

    // API (Infrastructure layer)
    this._lotofacilRESTApi = new LotofacilRESTApi(
      this._processLotofacilData,
      this._queryConcursos
    );
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  get concursoRepository(): MongoConcursoRepository {
    return this._concursoRepository;
  }

  get dataProvider(): CaixaDataProvider {
    return this._dataProvider;
  }

  get processLotofacilData(): ProcessLotofacilData {
    return this._processLotofacilData;
  }

  get queryConcursos(): QueryConcursos {
    return this._queryConcursos;
  }

  get lotofacilRESTApi(): LotofacilRESTApi {
    return this._lotofacilRESTApi;
  }
}