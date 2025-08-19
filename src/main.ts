import dotenv from 'dotenv';
import { Container } from '@infrastructure/container/Container';

// Carrega variáveis de ambiente
dotenv.config();

async function main(): Promise<void> {
  try {
    console.log('🎯 Iniciando Lotofácil Processor...');
    
    // Configurações
    const PORT = parseInt(process.env.PORT || '3000');
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lotofacil';
    
    console.log(`📦 Conectando ao MongoDB: ${MONGODB_URI}`);
    
    // Dependência do container
    const container = Container.getInstance();
    
    // Conecta ao MongoDB
    await container.concursoRepository.connect(MONGODB_URI);
    
    // Inicia o servidor da API
    container.lotofacilRESTApi.start(PORT);
    
    console.log('✅ Sistema iniciado com sucesso!');
    console.log(`📖 Para processar os dados, faça uma requisição POST para http://localhost:${PORT}/process`);
    
  } catch (error) {
    console.error('❌ Erro ao iniciar o sistema:', error);
    process.exit(1);
  }
}

// Manipula o encerramento gracioso
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando aplicação...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando aplicação...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Inicia a aplicação
main().catch(error => {
  console.error('❌ Erro fatal na inicialização:', error);
  process.exit(1);
});