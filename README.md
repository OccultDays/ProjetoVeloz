# 🍲 Sistema de Controle de Estoque — Restaurante do Seu Raimundo

> Desafio Técnico de Processo Seletivo: Sistema inteligente de reposição mensal de insumos gastronômicos, cálculo automatizado de compras e margem de segurança.

![Python](https://img.shields.io/badge/Python-3.12%2B-blue?logo=python)
![Django](https://img.shields.io/badge/Django-5.1%2B-092e20?logo=django)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Vite](https://img.shields.io/badge/Vite-6%2B-646cff?logo=vite)
![Status](https://img.shields.io/badge/Testes-100%25%20Aprovados-10b981)

---

## 📋 Contexto e Regras de Negócio

A partir da conversa com o **Seu Raimundo**, dono do restaurante, identificamos a lógica de funcionamento do estoque e as regras exatas para o cálculo da reposição:

### 1. Entidades Fundamentais
* **Meta:** Quantidade ideal que o Seu Raimundo gosta de manter no início de cada mês.
* **Estoque Atual:** Sobra de ingredientes verificada no final do mês após o consumo diário.
* **Unidade de Medida:** Farinha em quilo (`Kg`), leite em litro (`L`), ovo por unidade (`unidade`), etc.

### 2. Lógica de Reposição (Cálculo das Compras)

* **Regra 1 — Reposição Padrão (Normal):**
  * Quando o ingrediente não estragou e não faltou antes do fim do mês:
  $$\text{Quantidade a Comprar} = \text{Meta} - \text{Estoque Atual}$$
  * Se $\text{Quantidade a Comprar} \le 0$: o estoque já atende ou supera a meta, **nada a comprar** (o item **não entra** na lista).

* **Regra 2 — Ingrediente Vencido (Estragou):**
  * *"Quando o troço vence eu tenho que jogar tudo fora, não interessa quanto sobrou — e nesse caso eu preciso comprar tudo de novo, a quantidade cheia da minha meta"*
  * Toda a sobra física é descartada ($\text{Sobra Aproveitável} = 0$).
  $$\text{Quantidade a Comprar} = \text{Meta Integral}$$

* **Regra 3 — Falta no Meio do Mês (Acabou antes da hora):**
  * *"quando acaba no meio do mês quer dizer que eu errei a mão na meta, tava baixa demais pro tanto que a gente gasta. Nesses casos eu não quero mais voltar pra aquela meta antiga, quero comprar puxando pelo que realmente foi consumido, e ainda bota uma gordurinha a mais, uns 20% a mais do que consumi, pra não passar aperto de novo mês que vem."*
  * Como o estoque zerou antes do fim, a meta anterior era insuficiente:
  $$\text{Quantidade a Comprar} = \text{Consumo Real} \times 1.20$$
  *(Consumo Real acrescido de 20% de margem de segurança / "gordurinha").*
  * O sistema também calcula e permite salvar a **nova meta sugerida** para os próximos ciclos.

### 3. Formato Estrito de Saída
O programa gera e imprime a lista de compras legível, **um item por linha**, rigorosamente no padrão:
```text
Comprar: <quantidade> <unidade> de <ingrediente>
```
*Exemplo:* `Comprar: 12 Kg de Farinha`

---

## 🚀 Requisitos e Diferenciais Atendidos

| Requisito | Tipo | Situação | Implementação |
| :--- | :--- | :--- | :--- |
| **Backend em Django** | Obrigatório | ✅ Concluído | Aplicação Django estruturada (`estoque`), com models, ORM, services, views e testes. |
| **Lógica dentro do Framework** | Obrigatório | ✅ Concluído | Módulo isolado `services/calculo_reposicao.py` consumido por views e command. |
| **Saída no Formato Exato** | Obrigatório | ✅ Concluído | Geração de texto estrito via Management Command e endpoints REST. |
| **Repositório Público GitHub** | Obrigatório | ✅ Concluído | Estrutura modular, `.gitignore` completo e README detalhado. |
| **Frontend em React** | **Diferencial** | 🌟 **Concluído** | Interface completa em React 19 + Vite com Dashboard, Gestão de Itens e Modo Feira. |
| **Hospedagem Online** | **Diferencial** | 🌟 **Concluído** | Configurado para deploy 1-click no **Render.com** (`render.yaml`), Railway e Docker. |

---

## 🛠️ Tecnologias Utilizadas

* **Backend:** Python 3.12+, Django 5+, Django REST Framework, Django CORS Headers, WhiteNoise, Gunicorn.
* **Frontend:** React 19, Vite, Lucide React (ícones modernos), Vanilla CSS Design System com Glassmorphism.
* **Banco de Dados:** SQLite (desenvolvimento e testes) / Compatível com PostgreSQL (produção).
* **DevOps / Containers:** Docker, Docker Compose, Render Blueprint (`render.yaml`), Procfile.

---

## 💻 Como Rodar o Projeto Localmente

### Pré-requisitos
* Python 3.10+ instalado
* Node.js 18+ e npm instalados
* Git

### 1. Clonar o Repositório
```bash
git clone https://github.com/SEU_USUARIO/controle-estoque-restaurante.git
cd controle-estoque-restaurante
```

### 2. Configurar e Iniciar o Backend (Django)
```bash
# Criar ambiente virtual
python -m venv .venv

# Ativar o ambiente virtual:
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux / macOS:
source .venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Entrar na pasta do backend
cd backend

# Executar migrações do banco
python manage.py migrate

# Carregar dados iniciais de exemplo do Seu Raimundo
python manage.py loaddata dados_iniciais.json

# Iniciar o servidor Django
python manage.py runserver 8000
```
O backend estará rodando em `http://127.0.0.1:8000/`.

---

## 🖥️ Executando o Management Command (Terminal CLI)

Para rodar a lógica de reposição diretamente no terminal e imprimir a lista de compras no formato solicitado:

```bash
cd backend
python manage.py gerar_lista_compras
```

### Exemplo de Saída:
```text
Comprar: 18 Kg de Café
Comprar: 12 Kg de Farinha
Comprar: 30 L de Leite
Comprar: 7.5 Kg de Manteiga
Comprar: 120 unidade de Ovo
```
*(Ingredientes com estoque suficiente, como Açúcar, não entram na lista).*

#### Flags adicionais do comando:
* **Modo Detalhado (exibe justificativas):**
  ```bash
  python manage.py gerar_lista_compras --detalhado
  ```
* **Atualizar Metas dos itens que faltaram no mês (+20%):**
  ```bash
  python manage.py gerar_lista_compras --atualizar-metas
  ```
* **Exportar para arquivo texto:**
  ```bash
  python manage.py gerar_lista_compras --exportar lista_feira.txt
  ```

---

## 🧪 Executando os Testes Automatizados

O sistema conta com suíte de testes unitários e de integração cobrindo 100% dos cenários:
* Reposição normal
* Estoque suficiente/excedente
* Ingredientes vencidos
* Falta no meio do mês (+20% de margem)
* Formatação obrigatória da saída
* Management command e endpoints REST

Para rodar os testes:
```bash
cd backend
python manage.py test estoque
```
*Resultado:*
```text
Ran 9 tests in 0.012s
OK
```

---

## 🎨 Como Rodar o Frontend em React (Diferencial)

Em outro terminal:

```bash
cd frontend

# Instalar dependências
npm install

# Iniciar o servidor de desenvolvimento Vite
npm run dev
```
Acesse `http://localhost:5173/` no seu navegador.

> **Nota:** Se preferir rodar tudo em uma única porta sem precisar de dois terminais, basta rodar `npm run build` na pasta `frontend` e o próprio Django servirá o React completo diretamente em `http://127.0.0.1:8000/` através do WhiteNoise!

---

## 🐳 Como Rodar com Docker (Opcional)

Se preferir rodar toda a aplicação encapsulada em container com um único comando:

```bash
docker compose up --build
```
Acesse `http://localhost:8000/`.

---

## ☁️ Como Hospedar Online Gratuitamente (Diferencial)

O projeto já inclui as configurações completas para deploy gratuito:

### Opção 1: Render.com (Recomendado - 1 Clique)
1. Suba o código para o seu repositório no GitHub.
2. Acesse [Render.com](https://render.com) e conecte sua conta do GitHub.
3. Clique em **New +** > **Blueprint**.
4. Selecione o seu repositório. O Render detectará automaticamente o arquivo [`render.yaml`](render.yaml) e provisionará o serviço web com migrações, dados iniciais e build estático do React configurados!
5. Copie a URL pública gerada (ex: `https://estoque-seu-raimundo.onrender.com`) e inclua no seu README e e-mail de entrega.

### Opção 2: Railway / Vercel
* O repositório contém o arquivo [`Procfile`](Procfile) pronto para o Railway.
* Caso prefira hospedar o frontend separado na Vercel e o backend no Render, configure a variável de ambiente `VITE_API_BASE_URL` no painel da Vercel apontando para a URL da API Django.

---

## 📬 Instruções para Entrega do Processo Seletivo

Conforme as instruções do edital:

* **E-mail de Destino:** `ecossistema.v3l0z@gmail.com`
* **Prazo Final:** 14/09/2026

### Modelo de Mensagem de Entrega:

```text
Assunto: Entrega Desafio Técnico - Controle de Estoque [Seu Nome Completo]

Prezada equipe do Processo Seletivo,

Segue a entrega do Desafio Técnico de Controle de Estoque (Restaurante do Seu Raimundo).

Nome Completo: [Seu Nome Completo]
Matrícula: [Sua Matrícula]

Link do Repositório GitHub: https://github.com/[seu-usuario]/[nome-do-repositorio]
Link da Aplicação Hospedada (Diferencial): [URL do Render / Railway / Vercel]

Principais Destaques da Solução:
- Backend em Django com módulo desacoplado de regras de negócio (calculo_reposicao.py)
- Suíte completa de testes unitários automatizados (python manage.py test estoque)
- Django Management Command (python manage.py gerar_lista_compras) com saída estrita
- Frontend completo em React 19 + Vite com Dashboard, Gestão de Estoque e Modo "Rapaz da Feira"
- Suporte a containerização Docker e configuração de deploy contínuo na nuvem

Atenciosamente,
[Seu Nome Completo]
```
