# Agenda

Micro SaaS de agendamento para lava-jatos, detalhamento automotivo e estética
automotiva. Cada estabelecimento gerencia sua agenda, clientes, serviços e
faturamento, e tem uma página pública própria para agendamentos online.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS 4**
- **Supabase** (PostgreSQL + Auth + Row Level Security)
- **Zod** (validação), **date-fns / date-fns-tz** (datas e timezone)
- **lucide-react** (ícones)
- Deploy na **Vercel**

## Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Copie o arquivo de variáveis de ambiente e preencha com os valores do
   Supabase:
   ```bash
   cp .env.example .env.local
   ```
3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
4. Abra <http://localhost:3000>.

## Estrutura (em construção)

O desenvolvimento segue em etapas numeradas (banco de dados, autenticação,
agenda, página pública, financeiro, configurações, deploy). Consulte o
histórico de commits para acompanhar cada fase.
