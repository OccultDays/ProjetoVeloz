#Sistema de Controle de Estoque — Restaurante do Seu Raimundo

> Desafio Técnico de Processo Seletivo: Sistema inteligente de reposição mensal de insumos gastronômicos, cálculo automatizado de compras e margem de segurança.

![Python](https://img.shields.io/badge/Python-3.12%2B-blue?logo=python)
![Django](https://img.shields.io/badge/Django-5.1%2B-092e20?logo=django)
![React](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Vite](https://img.shields.io/badge/Vite-6%2B-646cff?logo=vite)

---

## Contexto e Regras de Negócio

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
  *(Consumo Real acrescido de 20% de margem de segurança.*
  * O sistema também calcula e permite salvar a **nova meta sugerida** para os próximos ciclos.

---
## Funcionalidades do Sistema

* **Dashboard com KPIs em Tempo Real:** Painel com cartões informativos que destacam instantaneamente o total de ingredientes, itens pendentes de compra, produtos vencidos, itens que faltaram no mês e porcentagem de abastecimento do estoque.
* **Gestão Completa de Insumos:** Cadastro, edição e exclusão de ingredientes com validações de dados e suporte a múltiplas unidades de medida (Kg, L, unidade, g, ml, dz, pct e unidades personalizadas).
* **Ações Rápidas por Item:** Botões de um clique na tabela e nos cards para alternar instantaneamente o status de "Vencido" ou "Falta no Mês", recalculando as necessidades de compra em tempo real.
* **Atualização de Estoque em Lote:** Modal dedicado para lançamento rápido de todas as contagens de fim de mês em uma única tela, com filtro de busca integrado e preenchimento ágil.
* **Lista de Compras Oficial:** Visualização em formato de código com a saída estrita do edital, botão para cópia rápida com 1 clique para a área de transferência e cards explicativos com as justificativas detalhadas de cada cálculo.
* **Lista Interativa:** Checklist dinâmico para acompanhamento presencial das compras, contendo barra de progresso percentual, atalhos para seleção em lote e confirmação integrada na tela para dar baixa e reabastecer o estoque do restaurante automaticamente.
* **Histórico de Listas Arquivadas:** Consulta e gestão de listas de compras fechadas em meses anteriores, com opção de exclusão e diálogo de segurança nativo.
* **Design Responsivo Touch-First:** Layout otimizado para dispositivos móveis com barra de navegação inferior estilo app, modais como bottom sheets e áreas de toque confortáveis.

---
## Backend, Arquitetura e CLI (Django 5 + REST Framework)

* **Módulo Desacoplado de Regras de Negócio(services/calculo_reposicao.py):** Lógica pura em Python, sem acoplamento rígido ao framework web, facilitando testes unitários, manutenção e reaproveitamento por comandos de terminal.
* **API RESTful Completa:**  Endpoints organizados para operações de CRUD, alternância de flags de status, cálculo sob demanda da reposição, atualização em lote e histórico de compras.
* **Management Command para Terminal(gerar_lista_compras):** Interface de linha de comando para gerar a lista diretamente pelo terminal, com suporte a argumentos avançados:
  * --detalhado: exibe os motivos e regras aplicadas a cada item.
  * --atualizar-metas: recalcula e salva permanentemente as novas metas com a margem de +20%.
  * --exportar <caminho>: salva a lista gerada diretamente em arquivo .txt.
* **Pronto para Produção & Deploy em Nuvem:** Configuração multi-stage via Docker (Dockerfile), suporte ao WhiteNoise para entrega de arquivos estáticos em alta performance e arquivos de orquestração prontos para deploy no Render.com (render.yaml).

