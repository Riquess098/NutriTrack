# 🍎 NutriTrack — Sistema de Monitoramento Nutricional e Controle de Metas

O **NutriTrack** é uma aplicação completa (Full-Stack) projetada para auxiliar no acompanhamento nutricional, cálculo de gasto calórico diário (TMB) e registro de refeições. Desenvolvido com uma arquitetura moderna e desacoplada, o sistema divide-se em uma API robusta no Back-end e uma interface responsiva no Front-end.

---
## Documentação

Os documentos do projeto estão na pasta `/docs`.

## 🛠️ Arquitetura e Tecnologias Utilizadas

O projeto foi construído utilizando os pilares mais sólidos do desenvolvimento de software atual:
* **Front-end:** Angular CLI (Componentes Standalone, Bootstrap 5 para estilização responsiva, SweetAlert2 para notificações dinâmicas).
* **Back-end:** Java 17 com Spring Boot 3.2 (Spring Data JPA, Hibernate, REST Controllers).
* **Banco de Dados:** PostgreSQL (Persistência relacional robusta).

---

## 📦 1. Pré-requisitos para Instalação (Do Zero)

Caso o computador de execução não possua o ecossistema de desenvolvimento instalado, siga a ordem abaixo para preparar o ambiente:

### A. Java Development Kit (JDK 17)
* O Back-end exige obrigatoriamente a **versão 17** do Java.
* [Download do Eclipse Temurin JDK 17 (LTS)](https://adoptium.net/temurin/releases/?version=17) ou utilize o gerenciador de sua preferência.
* Certifique-se de configurar a variável de ambiente `JAVA_HOME` corretamente após a instalação.

### B. Node.js (Versão LTS)
* O ecossistema do Angular necessita do Node.js para gerenciamento e compilação de pacotes.
* [Download do Node.js LTS](https://nodejs.org/) (Recomendado: v18 ou v20).
* A instalação do Node automaticamente inclui o gerenciador de pacotes `npm`.

### C. PostgreSQL & pgAdmin
* [Download do PostgreSQL](https://www.postgresql.org/download/) (Recomendado: Versão 14 ou superior).
* Durante a instalação, configure a senha do usuário padrão `postgres` e lembre-se dela.
* Instale também o **pgAdmin** para gerenciar o banco através de uma interface visual simples.

### D. Angular CLI (Global)
* Após instalar o Node.js, abra o terminal do seu sistema (PowerShell/CMD) e instale o Angular CLI globalmente executando:
    ```bash
    npm install -g @angular/cli
    ```

---

## 🗄️ Passo 1: Configuração do Banco de Dados

1. Abra o **pgAdmin** e conecte-se ao seu servidor local do PostgreSQL.
2. Clique com o botão direito em *Databases* -> *Create* -> *Database...*
3. Defina o nome do banco de dados exatamente como: **`nutritrack`**.
4. Acesse o código-fonte do seu Back-end Java e localize o arquivo de propriedades: `api/src/main/resources/application.properties`.
5. Garanta que as credenciais estejam de acordo com a sua instalação local:
    ```properties
    spring.datasource.url=jdbc:postgresql://localhost:5123/nutritrack
    spring.datasource.username=postgres
    spring.datasource.password=SUA_SENHA_AQUI
    spring.jpa.hibernate.ddl-auto=update
    spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
    ```
    *(Nota: A propriedade `ddl-auto=update` fará com que o Hibernate crie todas as tabelas necessárias no banco automaticamente assim que a API for ligada).*

---

## 🚀 Passo 2: Inicialização do Back-end (Spring Boot)

1. Abra um terminal do sistema e navegue até o diretório raiz da API do Java:
    ```bash
    cd api
    ```
2. Execute o comando do Maven Wrapper para baixar as dependências e iniciar o servidor:
    ```bash
    ./mvnw spring-boot:run
    ```
3. Aguarde o término da inicialização. Quando visualizar a mensagem abaixo, o Back-end estará pronto e escutando na porta `8080`:
    ```text
    INFO  [main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port 8080 (http) with context path ''
    INFO  [main] com.nutritrack.api.ApiApplication         : Started ApiApplication in X.XXX seconds
    ```
*⚠️ **Atenção:** Mantenha este terminal aberto durante todo o teste da aplicação.*

---

## 💻 Passo 3: Inicialização do Front-end (Angular)

1. Abra um **segundo terminal** (mantenha o terminal do Java rodando) e navegue até a pasta do Front-end:
    ```bash
    cd nutritrack-front
    ```
2. Instale todos os pacotes de dependências locais do projeto (isso recriará a pasta `node_modules` necessária):
    ```bash
    npm install
    ```
3. Inicie o servidor de desenvolvimento local do Angular:
    ```bash
    ng serve
    ```
4. Assim que a compilação terminar com sucesso, abra o seu navegador e acesse o endereço da aplicação:
    ```text
    http://localhost:4200
    ```

---

## 📱 Passo 4: Como Testar e Executar no Celular (Mesmo Wi-Fi)

Se desejar realizar a apresentação do projeto diretamente em um smartphone ou tablet conectado na mesma rede Wi-Fi que o computador:

1. Abra o prompt de comando (CMD) no Windows e digite `ipconfig` para descobrir o **Endereço IPv4** do seu computador (exemplo: `192.168.1.15`).
2. Substitua a palavra `localhost` pelo número do seu IP em todas as chamadas HTTP dos arquivos TypeScript do Angular (`login.ts`, `cadastro.ts`, `questionario.ts`, `dashboard.ts`).
    * *Exemplo:* Mude de `http://localhost:8080/api/login` para `http://192.168.1.15:8080/api/login`.
3. Inicie o servidor do Angular com a flag de hospedagem ampla:
    ```bash
    ng serve --host 0.0.0.0
    ```
4. No navegador do smartphone, acesse utilizando o IP do computador na porta do Angular:
    ```text
    http://192.168.1.15:4200
    ```

---

## 🛑 Resolução de Problemas Comuns 

### 1. Erro de CORS (Cross-Origin Resource Sharing)
* **Sintoma:** O console do navegador exibe uma mensagem vermelha dizendo que a requisição foi bloqueada pela política de CORS.
* **Solução:** Certifique-se de que a anotação `@CrossOrigin(origins = "*")` está declarada exatamente no topo das classes de controle do seu Back-end Java (`UsuarioController.java`, etc.).

### 2. Erro Interno 500 ao enviar Dados Nulos/Vazios
* **Sintoma:** Ao avançar do questionário ou tentar realizar ações, o console exibe `status 500`.
* **Solução:** O Java tenta invocar `.toString()` em campos mapeados que vieram sem valor do formulário. Certifique-se de usar validações de segurança ou métodos como `(dados.get("campo") != null) ? dados.get("campo").toString() : ""` para blindar as conversões de tipos.

### 3. Conexão Recusada (`net::ERR_CONNECTION_REFUSED`)
* **Sintoma:** O Front-end não consegue completar nenhuma ação de rede.
* **Solução:** O servidor do Back-end Java não está ligado ou caiu devido a algum erro crítico. Verifique o console do terminal do Spring Boot, reinicie a aplicação com `./mvnw spring-boot:run` e assegure-se de que o PostgreSQL está ativo em segundo plano.
