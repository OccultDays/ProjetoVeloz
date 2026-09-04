#Sistema de Controle de Estoque — Restaurante do Seu Raimundo

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
