# Validacao manual - salas e reservas

Collection: `docs/postman/salas-reservas.postman_collection.json`

## Preparacao

1. Subir o backend em `http://localhost:3000`.
2. Rodar `Register admin - sucesso` e `Register user - sucesso`.
3. Confirmar que as variaveis `adminToken` e `userToken` foram preenchidas.

## Salas

- `GET /rooms`: sucesso autenticado `200`, sem token `401`.
- `POST /rooms`: sucesso como ADMIN `201`, campos obrigatorios `400`, nome duplicado `409`, usuario comum `403`.
- `GET /rooms/:id`: sucesso `200`.
- `PUT /rooms/:id`: sucesso como ADMIN `200`, capacidade invalida `400`.
- `DELETE /rooms/:id`: usuario comum `403`; com reserva futura ativa deve retornar `409`.

## Reservas

- `POST /reservations`: sucesso `201`, conflito de horario `409`, intervalo invalido `400`.
- `GET /reservations/me`: sucesso para o proprio usuario `200`.
- `GET /reservations`: sucesso como ADMIN `200`, usuario comum `403`.
- `DELETE /reservations/:id`: dono da reserva cancela `200`; outro usuario deve receber `403`; ADMIN pode cancelar qualquer reserva `200`.

## Observacoes

- Erros seguem o formato `{ "error": "...", "code": "..." }`.
- A exclusao de sala bloqueia reservas ativas atuais/futuras. Quando nao ha reserva ativa atual/futura, reservas antigas/canceladas sao removidas junto da sala por cascata controlada no controller.
