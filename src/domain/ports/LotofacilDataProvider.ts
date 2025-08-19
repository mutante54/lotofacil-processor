import { Concurso } from "../entities/Concurso";

export interface LotofacilDataProvider {
  downloadHistoricalData(): Promise<Concurso[]>;
}