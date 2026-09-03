"""
Módulo de Regras de Negócio: Cálculo de Reposição de Estoque
Restaurante do Seu Raimundo

Regras extraídas da conversa:
1. Reposição Normal: Quantidade = Meta - Estoque Atual.
2. Ingrediente Vencido: Sobra é descartada (aproveitável = 0). Compra a Meta cheia.
3. Acabou no Meio do Mês: Meta era baixa demais. Compra o Consumo Real + 20% de margem ("gordurinha").
4. Formato de Saída Obrigatório: "Comprar: <quantidade> <unidade> de <ingrediente>"
5. Itens com quantidade <= 0 não entram na lista de compras.
"""

from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Any, Union


def formatar_quantidade(valor: Union[Decimal, float, int]) -> str:
    """
    Formata uma quantidade numérica removendo zeros decimais desnecessários.
    Exemplos:
        12.0 -> "12"
        12.5 -> "12.5"
        14.40 -> "14.4"
    """
    dec = Decimal(str(valor))
    # Normaliza eliminando zeros à direita
    dec_normalized = dec.normalize()
    # Converte para string evitando notação científica para números razoáveis
    texto = "{:f}".format(dec_normalized)
    if "." in texto:
        texto = texto.rstrip("0").rstrip(".")
    return texto


def calcular_item_reposicao(ingrediente: Any) -> Dict[str, Any]:
    """
    Calcula a necessidade de compra para um único ingrediente.
    Aceita tanto uma instância do modelo Django Ingrediente quanto um dicionário.
    """
    # Extração de atributos suportando dict ou model instance
    if isinstance(ingrediente, dict):
        nome = ingrediente.get("nome", "").strip()
        unidade = ingrediente.get("unidade", "").strip()
        meta = Decimal(str(ingrediente.get("meta", 0)))
        estoque_atual = Decimal(str(ingrediente.get("estoque_atual", 0)))
        vencido = bool(ingrediente.get("vencido", False))
        faltou_no_meio_do_mes = bool(ingrediente.get("faltou_no_meio_do_mes", False))
        consumo_informado = ingrediente.get("consumo_real")
        item_id = ingrediente.get("id")
    else:
        nome = ingrediente.nome.strip()
        unidade = ingrediente.unidade.strip()
        meta = Decimal(str(ingrediente.meta))
        estoque_atual = Decimal(str(ingrediente.estoque_atual))
        vencido = bool(ingrediente.vencido)
        faltou_no_meio_do_mes = bool(ingrediente.faltou_no_meio_do_mes)
        consumo_informado = getattr(ingrediente, "consumo_real", None)
        item_id = getattr(ingrediente, "id", None)

    quantidade_a_comprar = Decimal("0")
    regra_aplicada = ""
    motivo = ""
    nova_meta_sugerida = None

    # Caso 1: Ingrediente Vencido (Estragou)
    # Seu Raimundo: "Quando o troço vence eu tenho que jogar tudo fora, não interessa
    # quanto sobrou — e nesse caso eu preciso comprar tudo de novo, a quantidade cheia da minha meta"
    if vencido:
        regra_aplicada = "VENCIDO"
        quantidade_a_comprar = meta
        motivo = (
            f"Ingrediente vencido: sobra de {formatar_quantidade(estoque_atual)} {unidade} descartada. "
            f"Recomprando a meta integral de {formatar_quantidade(meta)} {unidade}."
        )

    # Caso 2: Acabou no Meio do Mês (Falta Crítica)
    # Seu Raimundo: "quando acaba no meio do mês quer dizer que eu errei a mão na meta,
    # tava baixa demais pro tanto que a gente gasta. Nesses casos eu não quero mais voltar pra aquela meta antiga,
    # quero comprar puxando pelo que realmente foi consumido, e ainda bota uma gordurinha a mais, uns 20% a mais do que consumi"
    elif faltou_no_meio_do_mes:
        regra_aplicada = "FALTA_NO_MES"
        
        # Se um consumo_real foi explicitado (ex: compras extras que também foram usadas), usa ele.
        # Caso contrário, o consumo foi no mínimo a meta estipulada que zerou.
        if consumo_informado is not None and Decimal(str(consumo_informado)) > 0:
            consumo_base = Decimal(str(consumo_informado))
        else:
            consumo_base = meta

        # Aplica a "gordurinha" de 20% (multiplicador 1.20)
        quantidade_a_comprar = (consumo_base * Decimal("1.2")).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )
        nova_meta_sugerida = quantidade_a_comprar
        motivo = (
            f"Falta no meio do mês: calculado sobre consumo real ({formatar_quantidade(consumo_base)} {unidade}) "
            f"+ 20% de margem de segurança ('gordurinha'). Nova meta sugerida: {formatar_quantidade(nova_meta_sugerida)} {unidade}."
        )

    # Caso 3: Reposição Padrão (Normal)
    # Seu Raimundo: "no fim do mês sobra um tanto... Essa sobra eu chamo de estoque atual.
    # Aí eu preciso comprar a diferença pra voltar na meta."
    else:
        regra_aplicada = "NORMAL"
        diferenca = meta - estoque_atual
        if diferenca > 0:
            quantidade_a_comprar = diferenca.quantize(
                Decimal("0.01"), rounding=ROUND_HALF_UP
            )
            motivo = (
                f"Reposição padrão: meta ({formatar_quantidade(meta)} {unidade}) "
                f"menos estoque atual ({formatar_quantidade(estoque_atual)} {unidade})."
            )
        else:
            quantidade_a_comprar = Decimal("0")
            motivo = (
                f"Estoque atual ({formatar_quantidade(estoque_atual)} {unidade}) "
                f"já atende ou supera a meta ({formatar_quantidade(meta)} {unidade}). Nada a comprar."
            )

    deve_comprar = quantidade_a_comprar > 0
    texto_formatado = ""
    if deve_comprar:
        # Formato estrito exigido pelo desafio: "Comprar: <quantidade> <unidade> de <ingrediente>"
        texto_formatado = f"Comprar: {formatar_quantidade(quantidade_a_comprar)} {unidade} de {nome}"

    return {
        "id": item_id,
        "nome": nome,
        "unidade": unidade,
        "meta": meta,
        "estoque_atual": estoque_atual,
        "vencido": vencido,
        "faltou_no_meio_do_mes": faltou_no_meio_do_mes,
        "quantidade_a_comprar": quantidade_a_comprar,
        "quantidade_formatada": formatar_quantidade(quantidade_a_comprar),
        "nova_meta_sugerida": nova_meta_sugerida,
        "deve_comprar": deve_comprar,
        "regra_aplicada": regra_aplicada,
        "motivo": motivo,
        "texto_formatado": texto_formatado,
    }


def processar_lista_compras(ingredientes: List[Any]) -> Dict[str, Any]:
    """
    Processa uma coleção de ingredientes e gera:
    1. Lista estruturada de todos os cálculos.
    2. Lista filtrada apenas dos itens que devem ser comprados (> 0).
    3. Texto final consolidado com uma linha por item no formato obrigatório.
    """
    todos_calculos = []
    itens_para_comprar = []
    linhas_texto = []

    for item in ingredientes:
        calculo = calcular_item_reposicao(item)
        todos_calculos.append(calculo)
        if calculo["deve_comprar"]:
            itens_para_comprar.append(calculo)
            linhas_texto.append(calculo["texto_formatado"])

    texto_final = "\n".join(linhas_texto)

    return {
        "total_ingredientes": len(todos_calculos),
        "total_itens_a_comprar": len(itens_para_comprar),
        "todos_calculos": todos_calculos,
        "itens_para_comprar": itens_para_comprar,
        "linhas_texto": linhas_texto,
        "texto_final": texto_final,
    }
