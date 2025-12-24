# 🚗 V-Drive Pro - Sistema de Treinamento de Condutores

> Plataforma avançada para recém-habilitados com análise de IA, simulados e acompanhamento de progresso em tempo real.

O **V-Drive Pro** transforma a experiência de ganhar confiança no trânsito. Utilizando arquitetura de microsserviços, o sistema oferece um ambiente escalável e seguro para o gerenciamento de aulas, exames e telemetria de direção.

---

## 🏗 Arquitetura do Sistema

O sistema foi modernizado de uma aplicação monolítica para uma arquitetura distribuída de **Microsserviços**, permitindo escalabilidade horizontal e manutenção isolada.

### Stack Tecnológica
*   **Frontend**: React (Vite), Tailwind CSS, Shadcn/UI, Framer Motion.
*   **Backend**: Node.js com Express (Arquitetura pronta para migração NestJS).
*   **Infraestrutura**: Docker & Docker Compose.
*   **API Gateway**: Nginx (Load Balancer & Reverse Proxy).
*   **Bancos de Dados**: 
    *   **PostgreSQL**: Dados relacionais (Usuários, Aulas, Pagamentos).
    *   **MongoDB**: Dados não estruturados (Logs de IA, Telemetria).
    *   **Redis** (Simulado): Cache de sessões.

### Catálogo de Serviços
1.  **🔐 Auth Service** (`:3001`): Autenticação JWT, Gestão de Identidade e Perfis.
2.  **🎓 Class Service** (`:3002`): Agendamento e Histórico de Aulas Práticas.
3.  **🧠 AI Service** (`:3003`): Análise comportamental de direção e Dicas de IA.
4.  **📝 Exam Service** (`:3004`): Simulados teóricos do Detran e Provas.
5.  **💳 Payment Service** (`:3005`): Gestão de Assinaturas e Checkout.
6.  **👁️ Biometrics Service** (`:3006`): Validação de Segurança e Reconhecimento Facial.

---

## 🚀 Como Rodar o Projeto

Siga este guia passo a passo para configurar o ambiente de desenvolvimento na sua máquina local.

### 📋 Pré-requisitos

Certifique-se de ter instalado em sua máquina:
*   [Node.js](https://nodejs.org/) (versão 18 ou superior)
*   [Docker](https://www.docker.com/) e **Docker Compose**
*   [Git](https://git-scm.com/)

### 🔧 Instalação e Execução

#### 1. Clone o Repositório
```bash
git clone https://github.com/AndrewsGM/driver-pro.git
cd driver-pro
```

#### 2. Configure as Variáveis de Ambiente
O projeto já possui arquivos de configuração padrão para desenvolvimento. Se necessário, crie um arquivo `.env` na raiz (baseado nos exemplos dos serviços). Para rodar localmente com Docker, as configurações padrão do `docker-compose.yml` são suficientes.

#### 3. Suba a Infraestrutura (Backend)
Este comando irá construir as imagens dos microsserviços e iniciar os containers dos bancos de dados e da API Gateway.

```bash
docker-compose up -d --build
```
> **Nota:** Aguarde alguns instantes para que todos os bancos de dados inicializem corretamente.

#### 4. Instale e Inicie o Frontend
Em um novo terminal, na raiz do projeto:

```bash
# Instala as dependências do React
npm install

# Inicia o servidor de desenvolvimento
npm run dev
```

#### 5. Acesso
Abra seu navegador e acesse:
*   **Frontend**: `http://localhost:5173`
*   **API Gateway**: `http://localhost:80` (Acesso unificado aos microsserviços)

---

## 🛠 Comandos Úteis

| Comando | Descrição |
| :--- | :--- |
| `docker-compose up -d` | Sobe todos os serviços em background. |
| `docker-compose down` | Para e remove todos os containers. |
| `docker-compose logs -f` | Acompanha os logs de todos os serviços em tempo real. |
| `npm run dev` | Inicia o frontend (Hot Reload). |
| `npm run build` | Gera a build de produção do frontend. |

---

## � Estrutura de Diretórios

```bash
/
├── backend/                # Código fonte dos Microsserviços
│   ├── auth-service/       # Serviço de Autenticação
│   ├── class-service/      # Serviço de Aulas
│   ├── ai-service/         # Serviço de IA
│   └── ...                 # Outros serviços
├── src/                    # Código fonte do Frontend (React)
├── nginx/                  # Configuração do Gateway
├── docker-compose.yml      # Orquestração dos containers
└── README.md               # Documentação principal
```

---

## 🤝 Contribuição

1.  Faça um Fork do projeto.
2.  Crie uma Branch para sua Feature (`git checkout -b feature/NovaFeature`).
3.  Faça o Commit (`git commit -m 'Add: Nova Feature'`).
4.  Faça o Push (`git push origin feature/NovaFeature`).
5.  Abra um Pull Request.

---

**V-Drive Pro** © 2025 - Transformando novos motoristas em condutores experientes.