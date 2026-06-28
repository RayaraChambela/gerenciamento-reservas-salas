# 📅 Aplicativo de Reserva de Salas

Aplicativo mobile para **reserva e gerenciamento de salas**, desenvolvido como projeto acadêmico do curso de Análise e Desenvolvimento de Sistemas (ADS).

O sistema permite que usuários consultem as salas disponíveis e façam reservas, enquanto administradores gerenciam as salas (cadastro, edição e exclusão) e as reservas. A autenticação é feita por e-mail e senha, com controle de acesso por perfil (usuário comum e administrador).

## 👥 Integrantes

| Nome | RA |
|------|----|
| Hugo Barbosa dos Santos | gu301553x |
| Rayara Chambela Geronimo | gu3088552 |
| Igor Mazeti de Oliveira | gu3080561 |

## 🛠️ Tecnologias

**Frontend (mobile)**
- React Native + [Expo](https://expo.dev) (SDK 56)
- Expo Router (navegação baseada em arquivos)
- TypeScript

**Backend (API)**
- Node.js + Express
- Prisma ORM + SQLite
- Autenticação com JWT e bcrypt

## 📂 Estrutura do projeto

```
reservas-salas/
├── src/            # aplicativo mobile (telas, componentes, contextos, serviços)
└── backend/        # API REST (controllers, rotas, middlewares, banco)
```

## 🚀 Como executar

### Backend

```bash
cd backend
npm install
npx prisma migrate dev      # cria/atualiza o banco SQLite
npm run dev                 # inicia a API em http://localhost:3000
```

### Frontend (mobile)

```bash
npm install
npx expo start              # inicia o Expo
```

No terminal do Expo é possível abrir o app em um emulador Android, simulador iOS, no navegador (web) ou no **Expo Go** (escaneando o QR Code).

> 💡 Para testar em um celular físico, o aparelho precisa estar na **mesma rede Wi-Fi** do computador, pois o app acessa a API pelo IP local da máquina.

## 📌 Funcionalidades

- Cadastro e login de usuários com persistência de sessão
- Controle de acesso por perfil (usuário comum / administrador)
- Listagem de salas com indicação de disponibilidade
- Gerenciamento de salas pelo administrador (CRUD)
- Reserva de salas com validação de conflito de horário
