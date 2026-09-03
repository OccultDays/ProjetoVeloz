from decimal import Decimal
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import Ingrediente, RegistroCompra
from .serializers import IngredienteSerializer, RegistroCompraSerializer
from .services.calculo_reposicao import processar_lista_compras, formatar_quantidade


class IngredienteViewSet(viewsets.ModelViewSet):
    """
    CRUD completo para os ingredientes do Seu Raimundo.
    """
    queryset = Ingrediente.objects.all().order_by("nome")
    serializer_class = IngredienteSerializer

    @action(detail=True, methods=["post"], url_path="toggle-vencido")
    def toggle_vencido(self, request, pk=None):
        ingrediente = self.get_object()
        ingrediente.vencido = not ingrediente.vencido
        ingrediente.save(update_fields=["vencido"])
        return Response(IngredienteSerializer(ingrediente).data)

    @action(detail=True, methods=["post"], url_path="toggle-falta-mes")
    def toggle_falta_mes(self, request, pk=None):
        ingrediente = self.get_object()
        ingrediente.faltou_no_meio_do_mes = not ingrediente.faltou_no_meio_do_mes
        if ingrediente.faltou_no_meio_do_mes:
            # Ao acabar no meio do mês, o estoque zera
            ingrediente.estoque_atual = Decimal("0")
        ingrediente.save(update_fields=["faltou_no_meio_do_mes", "estoque_atual"])
        return Response(IngredienteSerializer(ingrediente).data)


class RegistroCompraViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RegistroCompra.objects.all().order_by("-criado_em")
    serializer_class = RegistroCompraSerializer


@api_view(["GET"])
def obter_lista_compras(request):
    """
    Retorna a lista de compras calculada pelo backend Django.
    """
    ingredientes = list(Ingrediente.objects.all())
    resultado = processar_lista_compras(ingredientes)
    return Response(resultado)


@api_view(["GET"])
def exportar_lista_compras_txt(request):
    """
    Retorna a lista de compras no formato texto puro (text/plain).
    """
    ingredientes = list(Ingrediente.objects.all())
    resultado = processar_lista_compras(ingredientes)
    conteudo = resultado["texto_final"]
    if not conteudo:
        conteudo = "Nenhum item precisa ser comprado no momento."
    
    response = HttpResponse(conteudo, content_type="text/plain; charset=utf-8")
    response["Content-Disposition"] = 'attachment; filename="lista_compras_seu_raimundo.txt"'
    return response


@api_view(["POST"])
def salvar_historico_compras(request):
    """
    Grava a lista de compras atual no histórico.
    """
    ingredientes = list(Ingrediente.objects.all())
    resultado = processar_lista_compras(ingredientes)
    
    registro = RegistroCompra.objects.create(
        total_itens=resultado["total_itens_a_comprar"],
        conteudo_texto=resultado["texto_final"],
    )
    return Response(
        {
            "mensagem": "Lista de compras arquivada com sucesso!",
            "registro": RegistroCompraSerializer(registro).data,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
def atualizar_metas_ajustadas(request):
    """
    Atualiza as metas dos itens que faltaram no mês para a nova meta calculada (+20%).
    """
    ingredientes = list(Ingrediente.objects.all())
    resultado = processar_lista_compras(ingredientes)
    atualizados = []

    for calculo in resultado["todos_calculos"]:
        if calculo["regra_aplicada"] == "FALTA_NO_MES" and calculo["nova_meta_sugerida"]:
            ing = Ingrediente.objects.get(id=calculo["id"])
            meta_anterior = ing.meta
            ing.meta = calculo["nova_meta_sugerida"]
            ing.faltou_no_meio_do_mes = False
            ing.save(update_fields=["meta", "faltou_no_meio_do_mes"])
            atualizados.append({
                "id": ing.id,
                "nome": ing.nome,
                "unidade": ing.unidade,
                "meta_anterior": formatar_quantidade(meta_anterior),
                "nova_meta": formatar_quantidade(ing.meta),
            })

    return Response({
        "mensagem": f"{len(atualizados)} meta(s) atualizada(s) com sucesso!",
        "itens_atualizados": atualizados,
    })


@api_view(["GET"])
def dashboard_stats(request):
    """
    Retorna indicadores agregados para o dashboard.
    """
    ingredientes = list(Ingrediente.objects.all())
    resultado = processar_lista_compras(ingredientes)

    total_ingredientes = len(ingredientes)
    total_para_comprar = resultado["total_itens_a_comprar"]
    total_vencidos = sum(1 for i in ingredientes if i.vencido)
    total_faltaram = sum(1 for i in ingredientes if i.faltou_no_meio_do_mes)
    total_ok = total_ingredientes - total_para_comprar

    return Response({
        "total_ingredientes": total_ingredientes,
        "total_para_comprar": total_para_comprar,
        "total_vencidos": total_vencidos,
        "total_faltaram": total_faltaram,
        "total_ok": total_ok,
    })


def index_view(request):
    """
    View principal: se o build do React existir, serve o index.html gerado pelo Vite.
    Caso contrário, serve uma página informativa do backend.
    """
    from django.conf import settings
    frontend_index = settings.FRONTEND_DIR / "index.html"
    if frontend_index.exists():
        return render(request, "index.html")
    return HttpResponse(
        "<h1>Restaurante do Seu Raimundo - Backend Django Ativo</h1>"
        "<p>Endpoints disponíveis em <code>/api/</code> e <code>/admin/</code>.</p>"
        "<p>Execute <code>python manage.py gerar_lista_compras</code> para a lista no terminal.</p>",
        content_type="text/html; charset=utf-8"
    )
