# EVNT

O **EVNT** é uma solução Full Stack moderna para o gerenciamento de eventos técnicos. A plataforma permite cadastrar eventos com suporte a geolocalização, upload de imagens para a nuvem e gerenciamento estratégico de cupons de desconto.

![Java](https://img.shields.io/badge/Java-25-orange?style=for-the-badge&logo=openjdk)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-4-brightgreen?style=for-the-badge&logo=springboot)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![AWS](https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)
![AWS](https://img.shields.io/badge/AWS_S3-569A31?style=for-the-badge&logo=amazon-aws&logoColor=white)
![AWS](https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
---

## 🛠️ Tecnologias & Stack

### **Backend**
* **Java 25 & Spring Boot 4**: Core da aplicação com alta performance.
* **Spring Security**: Autenticação e proteção de rotas administrativas.
* **Spring Web**: Desenvolvimento de APIs RESTful com suporte a JWT.
* **Spring Data JPA & PostgreSQL**: Persistência de dados robusta.
* **Flyway**: Migrations e controle de versionamento de banco de dados.
* **AWS SDK S3**: Integração nativa para armazenamento de imagens.
* **AWS EC2**: Backend configurado como serviço para alta disponibilidade.
* **Tratamento de Exceções**: Handler global para respostas de erro padronizadas.

### **Frontend**
* **React + Vite**: Setup moderno e rápido para desenvolvimento.
* **Responsividade**: Design fluido com suporte a múltiplos breakpoints.
* **Animações Premium**: Efeitos de *Typewriter*, *Shimmer* e Transições Suaves para melhor UI/UX.

### **Infraestrutura (DevOps)**
* **AWS EC2**: Backend Linux configurado como serviço via **systemd**.
* **AWS S3**: Bucket configurado para armazenamento de assets.
* **Vercel**: Deploy automatizado do frontend.

---

## ✨ Funcionalidades Principais

* ✅ **CRUD Completo**: Gestão total de eventos e cupons de desconto.
* ✅ **Login Administrativo**: Acesso restrito para organizadores gerenciar eventos e cupons.
* ✅ **Upload de Imagens**: Processamento e storage de banners na nuvem.
* ✅ **Busca & Filtros**: Localize eventos por cidade, UF, data ou modalidade (remoto/presencial).
* ✅ **Interface Adaptável**: Layout otimizado para Mobile, Tablet e Desktop.

---

## ⚙️ Configuração do Ambiente

Crie um arquivo `.env` no backend com as seguintes chaves (ou configure no seu ambiente de Deploy):

```env
# Database Configuration
SPRING_DATASOURCE_URL=jdbc:postgresql://<host>:5432/postgres
SPRING_DATASOURCE_USERNAME=postgres
SPRING_DATASOURCE_PASSWORD=<sua_senha>

# AWS Cloud Credentials
AWS_REGION=us-east-1
AWS_BUCKET_NAME=eventostec-photoss
AWS_ACCESS_KEY=<sua_access_key>
AWS_SECRET_KEY=<sua_secret_key>

# Admin Security
ADMIN_USERNAME=admin
ADMIN_PASSWORD=sua_senha_segura
```
---
## 📡 API Endpoints (Principais)

### **Eventos**
* `POST /api/events`: Criar novo evento (Admin)
* `GET /api/events`: Listar eventos com filtros
* `GET /api/events/{id}`: Detalhes de um evento específico
* `PUT /api/events/{id}`: Atualizar evento (Admin)
* `DELETE /api/events/{id}`: Excluir evento (Admin)

### **Cupons de Desconto**
* `GET /api/events/{id}/coupons`: Listar cupons associados a um evento
* `POST /api/events/{id}/coupons`: Criar cupom para um evento (Admin)
* `PUT /api/events/{id}/coupons/{couponId}`: Atualizar cupom (Admin)
* `DELETE /api/events/{id}/coupons/{couponId}`: Excluir cupom (Admin)

---

## Testes Unitários
* Cobertura de testes para serviços, controladores e repositórios usando JUnit e Mockito.

---

## 🎨 Frontend Details
* **Home Page**: Exibe eventos em destaque com filtros avançados.
* **Event Details**: Página dedicada para cada evento, mostrando informações completas e cupons disponíveis.
* **Admin Dashboard**: Interface exclusiva para gerenciar eventos e cupons.
* **Responsividade**: Layout adaptável para garantir uma experiência consistente em qualquer dispositivo.
* **Animações**: Efeitos visuais para melhorar a interação do usuário, como carregamento de eventos e transições suaves.
* **Formulários**: Validação robusta para criação e edição de eventos e cupons, garantindo dados consistentes.
* **Feedback Visual**: Notificações para ações bem-sucedidas ou erros, melhorando a comunicação com o usuário.

---

## 🚀 Deploy & Acesso
* **Backend**: Hospedado na AWS EC2, acessível via `http://44.223.88.66:8080`
* **Frontend**: Deploy automático no Vercel, disponível em `https://eventos-api-umber.vercel.app/`
* **Admin Login**: Use as credenciais definidas no `.env` para acessar a área administrativa(admin/login).

---

* ## 📌 Considerações Finais
O **EVNT** é uma plataforma robusta e escalavel, projetada para atender às necessidades de organizadores de eventos técnicos. Com uma arquitetura moderna e integração com serviços AWS, a aplicação oferece uma experiência fluida tanto para administradores quanto para usuários finais. O sistema de cupons de desconto e a funcionalidade de upload de imagens enriquecem a gestão de eventos, tornando o EVNT uma solução completa para o mercado de eventos técnicos.

---

### Desenvolvido por **Rodrigo Alexandre** - [LinkedIn](https://www.linkedin.com/in/rodrigo-alexandre-dev/) | [GitHub](https://github.com/0064558)