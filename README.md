# Lotofácil Processor

Sistema de processamento de dados históricos da Lotofácil utilizando arquitetura hexagonal e clean code com Node.js, TypeScript e MongoDB.

## 🏗️ Arquitetura

O projeto segue os princípios da **Arquitetura Hexagonal** (Ports and Adapters), organizando o código em camadas bem definidas:

- **Domain**: Entidades, Value Objects e Ports (interfaces)
- **Application**: Use Cases (regras de negócio)
- **Infrastructure**: Adaptadores para fontes de dados externas, APIs, banco de dados

## 🚀 Funcionalidades

- ✅ Download automático de dados históricos da Caixa Econômica Federal
- ✅ Processamento de planilha Excel com todos os concursos históricos
- ✅ Persistência em MongoDB
- ✅ API REST para consulta de dados
- ✅ Cálculo de estatísticas:
  - Top 10 dezenas mais sorteadas nos últimos 50 concursos
  - Top 10 dezenas mais ausentes nos últimos 50 concursos

## 📋 Pré-requisitos

- Node.js >= 18.x
- MongoDB >= 5.x
- npm ou yarn

## 🛠️ Instalação e Execução

### 1. Clone o repositório

```bash
git clone <repository-url>
cd lotofacil-processor
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=<porta>
NODE_ENV=<env>
MONGODB_URI=mongodb://<host>:27017/lotofacil
LOTOFACIL_CAIXA_SPREADSHEET_DOWNLOAD_URL=<url_download>
LOTOFACIL_CAIXA_SPREADSHEET_FILE_PATH=<file_path>
```

### 4. Execute o projeto

#### Desenvolvimento
```bash
npm run dev
```

#### Produção
```bash
npm run build
npm start
```

### 5. Teste a aplicação

Acesse http://localhost:3000/health para verificar se a API está funcionando.

## 📚 Endpoints da API

### GET /health
Verifica o status da aplicação

### POST /process
Processa os dados históricos da Lotofácil
- Baixa a planilha da Caixa
- Processa e salva no MongoDB
- Calcula estatísticas dos últimos 50 concursos

### GET /concursos
Lista todos os concursos
- Query param `limit`: limita a quantidade de resultados (máx: 100)

### GET /concursos/:numero
Busca um concurso específico pelo número

### GET /stats
Retorna estatísticas gerais

## 🧪 Exemplo de Uso

### 1. Processar dados históricos
```bash
curl -X POST http://localhost:3000/process
```

### 2. Listar últimos 10 concursos
```bash
curl http://localhost:3000/concursos?limit=10
```

### 3. Buscar concurso específico
```bash
curl http://localhost:3000/concursos/3000
```

## 🏗️ Estrutura do Projeto

```
src/
├── domain/
│   ├── entities/
│   │   └── Concurso.ts
│   ├── value-objects/
│   │   └── DezenasEstatisticas.ts
│   └── ports/
│       ├── ConcursoRepository.ts
│       ├── LotofacilDataProvider.ts
│       └── ExcelProcessor.ts
├── application/
│   └── use-cases/
│       ├── ProcessLotofacilData.ts
│       └── QueryConcursos.ts
├── infrastructure/
│   ├── adapters/
│   │   ├── CaixaDataProvider.ts
│   │   ├── XlsxProcessor.ts
│   │   ├── MongoConcursoRepository.ts
│   │   └── ExpressApi.ts
│   └── container/
│       └── Container.ts
└── main.ts
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch

# Gerar relatório de cobertura
npm test -- --coverage
```

## 🔍 Linting

```bash
# Verificar código
npm run lint

# Corrigir automaticamente
npm run lint:fix
```

## 📦 Build

```bash
npm run build
```

## 🐳 Docker (Opcional)

Você pode usar Docker Compose para executar a aplicação com MongoDB:

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/lotofacil
    depends_on:
      - mongo
  
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## 🎯 Princípios Aplicados

### Clean Code
- Nomes descritivos
- Funções pequenas e focadas
- Separação de responsabilidades
- Tratamento adequado de erros

### SOLID
- **S**ingle Responsibility: Cada classe tem uma única responsabilidade
- **O**pen/Closed: Extensível via interfaces
- **L**iskov Substitution: Implementações podem ser substituídas
- **I**nterface Segregation: Interfaces específicas
- **D**ependency Inversion: Depende de abstrações, não implementações

### Arquitetura Hexagonal
- Domain independente de frameworks
- Ports como contratos
- Adapters implementam ports
- Inversão de dependências

## 🤝 Contribuição

1. Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🔧 Troubleshooting

### Erro de conexão com MongoDB
- Verifique se o MongoDB está rodando
- Confirme a string de conexão no `.env`

### Erro no download da planilha
- Verifique sua conexão com a internet
- O site da Caixa pode estar temporariamente indisponível

### Erro de parsing da planilha
- A estrutura da planilha pode ter mudado
- Verifique os logs para mais detalhes