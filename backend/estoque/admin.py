from django.contrib import admin
from .models import Ingrediente, RegistroCompra


@admin.register(Ingrediente)
class IngredienteAdmin(admin.ModelAdmin):
    list_display = (
        "nome",
        "unidade",
        "meta",
        "estoque_atual",
        "vencido",
        "faltou_no_meio_do_mes",
        "necessidade_compra_resumo",
    )
    list_filter = ("vencido", "faltou_no_meio_do_mes", "unidade")
    search_fields = ("nome", "observacao")

    def necessidade_compra_resumo(self, obj):
        res = obj.calcular_necessidade()
        if res["deve_comprar"]:
            return f"{res['quantidade_formatada']} {res['unidade']} ({res['regra_aplicada']})"
        return "OK"
    necessidade_compra_resumo.short_description = "A Comprar"


@admin.register(RegistroCompra)
class RegistroCompraAdmin(admin.ModelAdmin):
    list_display = ("id", "criado_em", "total_itens")
    readonly_fields = ("criado_em", "total_itens", "conteudo_texto")
