import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { ProcessLotofacilData } from '@application/use-cases/ProcessLotofacilData';
import { QueryConcursos } from '@application/use-cases/QueryConcursos';

export class LotofacilRESTApi {
  private app: express.Application;

  constructor(
    private readonly processLotofacilData: ProcessLotofacilData,
    private readonly queryConcursos: QueryConcursos
  ) {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddlewares(): void {
    this.app.use(helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "script-src": ["'self'", "'unsafe-inline'"],
        },
      },
    })
    );
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());

    // Servir arquivos estáticos da pasta 'static-html'
    this.app.use(express.static('static-html'));

    // Log das requisições
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'Lotofácil Processor API'
      });
    });

    // Processar dados históricos
    this.app.post('/process', async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log('Iniciando processamento de dados...');
        const result = await this.processLotofacilData.execute();

        res.json({
          success: true,
          message: 'Dados processados com sucesso',
          data: result
        });
      } catch (error) {
        next(error);
      }
    });

    // Listar todos os concursos
    this.app.get('/concursos', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { limit } = req.query;
        let concursos;

        if (limit) {
          const limitNum = parseInt(limit as string);
          if (isNaN(limitNum) || limitNum <= 0 || limitNum > 100) {
            return res.status(400).json({
              success: false,
              message: 'Parâmetro limit deve ser um número entre 1 e 100'
            });
          }
          concursos = await this.queryConcursos.getLatest(limitNum);
        } else {
          concursos = await this.queryConcursos.findAll();
        }

        return res.json({
          success: true,
          data: concursos.map(concurso => ({
            numero: concurso.numero,
            data: concurso.data,
            dezenas: concurso.dezenas,
            dezenasAusentes: concurso.dezenasNaoSorteadas,
            dezenasNovasConcursoAnterior: concurso.dezenasSorteadasMasAusentesConcursoAnterior,
            dezenasRepetidasConcursoAnterior: concurso.dezenasSorteadasERepetidasConcursoAnterior,
            estaticPreConcMaisOcorrencias: concurso.estaticPreConcMaisOcorrencias,
            estaticPreConcMaisAtrasadas: concurso.estaticPreConcMaisAtrasadas
            
          })),
          total: concursos.length
        });
      } catch (error) {
        return next(error);
      }
    });

    // Buscar concurso específico
    this.app.get('/concursos/:numero', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const numero = parseInt(req.params.numero || '0');

        if (isNaN(numero) || numero <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Número do concurso deve ser um inteiro positivo'
          });
        }

        const concurso = await this.queryConcursos.findByNumero(numero);

        if (!concurso) {
          return res.status(404).json({
            success: false,
            message: 'Concurso não encontrado'
          });
        }

        return res.json({
          success: true,
          data: {
            numero: concurso.numero,
            data: concurso.data,
            dezenas: concurso.dezenas,
            arrecadacaoTotal: concurso.arrecadacaoTotal,
            premiacoes: concurso.premiacoes
          }
        });
      } catch (error) {
        return next(error);
      }
    });

    // Estatísticas
    this.app.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
      try {
        const estatisticas = await this.queryConcursos.getDezenasEstatisticas(50);

        res.json({
          success: true,
          data: {
            estatisticas,
            message: 'Para obter estatísticas atualizadas, execute o processamento primeiro'
          }
        });
      } catch (error) {
        next(error);
      }
    });

    // Rota não encontrada
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        message: 'Endpoint não encontrado',
        availableEndpoints: [
          'GET /health',
          'POST /process',
          'GET /concursos',
          'GET /concursos?limit=N',
          'GET /concursos/:numero',
          'GET /stats'
        ]
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Erro na API:', error);

      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Erro interno'
      });
    });
  }

  start(port: number): void {
    this.app.listen(port, () => {
      console.log(`🚀 API Lotofácil rodando na porta ${port}`);
      console.log(`📍 Endpoints disponíveis:`);
      console.log(`   GET  http://localhost:${port}/health`);
      console.log(`   POST http://localhost:${port}/process`);
      console.log(`   GET  http://localhost:${port}/concursos`);
      console.log(`   GET  http://localhost:${port}/concursos/:numero`);
      console.log(`   GET  http://localhost:${port}/stats`);
    });
  }
}