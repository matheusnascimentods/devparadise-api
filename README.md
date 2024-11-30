
### Devparadise API

A DevParadise API é uma API RESTful desenvolvida em JavaScript utilizando o framework A DevParadise API é parte do projeto de TCC do curso técnico de Desenvolvimento de Sistemas da ETEC Professor Camargo Aranha. Ela fornece os serviços essenciais para o funcionamento do DevParadise, uma plataforma web criada para conectar desenvolvedores iniciantes ao mercado de trabalho, promovendo visibilidade, networking e aprendizado contínuo.

Essa API foi desenvolvida com foco em flexibilidade, escalabilidade e facilidade de uso, utilizando tecnologias modernas como Express e MongoDB.
#### Requisitos/dependências
- Nodejs >= 20 (LTS version) 
- MongoDB

#### Rodando
Na raiz do projeto, execute o seguinte comando para realizar a configuração do projeto:
```ruby
npm install
```
Em seguida será necessário criar um arquivo `.env` na raiz do projeto, fica abaixo um exemplo de como deve ser o arquivo:
```ruby
PORT=300
MONGO_URI='minhauridomongodb'
FRONT_URL='urldofrontend'
```

`PORT`, é a porta onde a API vai rodar, `MONGO_URI` é a uri da base de dados no MongoDB, `FRONT_URL` é a url do front ent (caso você esteja rodando localmente essa url será `http://localhost:5173`)

Agora basta rodar:
```ruby
npm run dev
```
e API estará rodando na sua maquina
## Endpoints

**API_URL**: `http://localhost:3000`

#### Endpinsts referentes a usuários

`POST` **Criar user**
```Ruby
http://localhost:3000/user/signup
```
```Ruby
{
    "name": "",
    "username": "",
    "email": "",
    "skils": [],
    "cpf": "",
    "phone": "",
    "description": "",
    "password": "123456"
}
```

`POST` **Login**
```Ruby
http://localhost:3000/user/login
```
```Ruby
{
    "login": "",
    "password": ""
}
```
**Obs:** Login é o username ou email do user

`GET` **Buscar todos os users**
```Ruby
http://localhost:3000/user
```

`GET` **Buscar user autenticado**
```Ruby
http://localhost:3000/user/me
```
**Authorization Bearer Token**
```Ruby
Token:<token>
```

`PATCH` **Atualizar user**
```Ruby
http://localhost:3000/user
```
| Campo        | Tipo       | Obrigatório | Descrição                                              |
|--------------|------------|-------------|------------------------------------------------------|
| `name`       | String     | Sim         | Nome completo do usuário.                           |
| `username`   | String     | Sim         | Nome de usuário único para o perfil.                |
| `email`      | String     | Sim         | Endereço de email válido do usuário.                |
| `description`| String     | Não         | Breve descrição ou biografia do usuário.            |
| `skills`     | Array      | Não         | Lista de habilidades ou tecnologias do usuário.      |
| `github`     | String     | Não         | URL do perfil no GitHub.                            |
| `linkedin`   | String     | Não         | URL do perfil no LinkedIn.                          |
| `image`      | File (PNG/JPG) | Não      | Imagem de perfil do usuário (PNG ou JPG).           |

**Obs:** Essa rota usa um form-data

**Authorization Bearer Token**
```Ruby
Token:<token>
```

`PATCH` **Trocar senha**
```Ruby
http://localhost:3000/user/change-password
```
```Ruby
{
    "password": "",
    "newPassword": "",
    "confirmPassword": ""
}
```
**Authorization Bearer Token**
```Ruby
Token:<token>
```

`DELETE` **Excluir user**
```Ruby
http://localhost:3000/user/
```
```Ruby
{
    "password": ""
}
```
**Authorization Bearer Token**
```Ruby
Token:<token>
```

#### Endpinsts referentes a projetos

`POST` **Criar projeto**
```Ruby
http://localhost:3000/project
```
| Campo         | Tipo           | Obrigatório | Descrição                                              |
|---------------|----------------|-------------|------------------------------------------------------|
| `title`       | String         | Sim         | Título do projeto.                                   |
| `description` | String         | Sim         | Breve descrição ou resumo do projeto.               |
| `repository`  | String (URL)   | Não         | URL do repositório do projeto (ex.: GitHub).        |
| `link`        | String (URL)   | Não         | URL do site ou demonstração do projeto.             |
| `technologies`| Array          | Sim         | Lista de tecnologias utilizadas no projeto.         |
| `images`      | File (PNG/JPG) | Não         | Imagens representando o projeto (PNG ou JPG).       |

**Obs:** Essa rota usa um form-data

**Authorization Bearer Token**
```Ruby
Token:<token>
```

`GET` **Buscar projetos do user autenticado**
```Ruby
http://localhost:3000/project/me
```
**Authorization Bearer Token**
```Ruby
Token:<token>
```

`GET` **Buscar todos os projetos**
```Ruby
http://localhost:3000/project
```

`PATCH` **Favoritar projeto**
```Ruby
http://localhost:3000/project/favorite
```
```Ruby
{
    id: ""
}
```
**Authorization Bearer Token**
```Ruby
Token:<token>
```

`PATCH` **Editar projeto**
```Ruby
http://localhost:3000/project/:id
```
| Campo         | Tipo           | Obrigatório | Descrição                                              |
|---------------|----------------|-------------|------------------------------------------------------|
| `title`       | String         | Sim         | Título do projeto.                                   |
| `description` | String         | Sim         | Breve descrição ou resumo do projeto.               |
| `repository`  | String (URL)   | Não         | URL do repositório do projeto (ex.: GitHub).        |
| `link`        | String (URL)   | Não         | URL do site ou demonstração do projeto.             |
| `technologies`| Array          | Sim         | Lista de tecnologias utilizadas no projeto.         |
| `images`      | File (PNG/JPG) | Não         | Imagens representando o projeto (PNG ou JPG).       |

**Authorization Bearer Token**
```Ruby
Token:<token>
```
**Obs:** `:id` Deve ser substituido pelo id do projeto, e essa rota usa um form-data

`DELETE` **Excluir projeto**
```Ruby
http://localhost:3000/project/:id
```
**Authorization Bearer Token**
```Ruby
Token:<token>
```
**Obs:** `:id` Deve ser substituido pelo id do projeto

#### Endpinsts referentes a conexões

`POST` **Seguir um user**
```Ruby
http://localhost:3000/connection/follow
```
```Ruby
{
    followedId: ""
}
```
```Ruby
Token:<token>
```

`GET` **Ver se o user autenticado segue o user X**
```Ruby
http://localhost:3000/connection/:username/status
```
```Ruby
Token:<token>
```
**Obs:** `:username` Deve ser substituido pelo username do user X 

`GET` **Ver todos os seguidores do user X**
```Ruby
http://localhost:3000/connection/:username/followers
```

**Obs:** `:username` Deve ser substituido pelo username do user X

`GET` **Ver quem o user X segue**
```Ruby
http://localhost:3000/connection/:username/following
```

**Obs:** `:username` Deve ser substituido pelo username do user X

`GET` **Ver os projetos de quem o user autenticado segue**
```Ruby
http://localhost:3000/connection/following/posts
```
```Ruby
Token:<token>
```
`DELETE` **Deixar de seguir um user**
```Ruby
http://localhost:3000/connection/unfollow
```
```Ruby
{
    followedId: ""
}
```
```Ruby
Token:<token>
```
## Stack utilizada

- Node
- Express

