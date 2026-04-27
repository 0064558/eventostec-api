# EventosTec API

API REST para cadastro e consulta de eventos, com suporte a cupons de desconto e upload de imagem para AWS S3.

## Stack

- Java 25
- Spring Boot 4
- Spring Web MVC
- Spring Data JPA
- PostgreSQL
- Flyway
- AWS S3 (`aws-java-sdk-s3`)

## Variaveis de ambiente

Defina estas variaveis antes de subir a aplicacao:

```env
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<senha>
AWS_REGION=us-east-1
AWS_BUCKET_NAME=eventostec-photoss
```

## Executar localmente

```bash
./mvnw spring-boot:run
```

No Windows:

```powershell
mvnw.cmd spring-boot:run
```

## Endpoints

Base principal: `http://localhost:8080`

### 1) Criar evento

`POST /api/events`  
`Content-Type: multipart/form-data`

Campos:

- `title` (string, obrigatorio)
- `description` (string, opcional)
- `date` (long, obrigatorio, timestamp em milissegundos)
- `city` (string, obrigatorio)
- `uf` (string, obrigatorio)
- `remote` (boolean, obrigatorio)
- `eventUrl` (string, obrigatorio)
- `image` (arquivo, opcional)

Exemplo cURL:

```bash
curl -X POST "http://localhost:8080/api/events" \
  -F "title=Evento Java" \
  -F "description=Backend e AWS" \
  -F "date=1777286400000" \
  -F "city=Sao Paulo" \
  -F "uf=SP" \
  -F "remote=false" \
  -F "eventUrl=https://eventostec.com/evento-java" \
  -F "image=@./banner.png"
```

### 2) Listar eventos futuros

`GET /api/events?page=0&size=10`

### 3) Filtrar eventos

`GET /api/events/filter?page=0&size=10&title=java&city=Sao%20Paulo&uf=SP&startDate=2026-04-01&endDate=2026-04-30`

Observacao: `startDate` e `endDate` seguem formato `yyyy-MM-dd`.

### 4) Buscar detalhes de evento

`GET /api/events/{eventId}`

Retorna dados do evento + cupons validos.

### 5) Criar cupom para evento

`POST /events/{eventId}`  
`Content-Type: application/json`

Body:

```json
{
  "code": "DESCONTO10",
  "discount": 10,
  "valid": 1777891200000
}
```

Observacao importante: esta rota de cupom esta sem prefixo `/api` no codigo atual.

## Banco e migracoes

As tabelas sao criadas via Flyway em:

- `src/main/resources/db/migration/V1__create_event_table.sql`
- `src/main/resources/db/migration/V2__create-table-coupon.sql`
- `src/main/resources/db/migration/V3__create-table-address.sql`

## Deploy com systemd (EC2)

Arquivos de apoio:

- `deploy/eventostec-api.service`
- `deploy/eventostec-api.env.example`

Instalacao basica na EC2:

```bash
sudo mkdir -p /opt/eventostec-api /etc/eventostec-api
sudo cp eventostec-api-0.0.1-SNAPSHOT.jar /opt/eventostec-api/eventostec-api.jar
sudo cp deploy/eventostec-api.service /etc/systemd/system/eventostec-api.service
sudo cp deploy/eventostec-api.env.example /etc/eventostec-api/eventostec-api.env

sudo systemctl daemon-reload
sudo systemctl enable --now eventostec-api
sudo systemctl status eventostec-api
```

## Seguranca

- Nao versionar credenciais reais no repositorio.
- Usar apenas variaveis de ambiente para senha de banco e credenciais AWS.
