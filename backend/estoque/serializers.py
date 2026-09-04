from rest_framework import serializers
from .models import Ingrediente, RegistroCompra
from .services.calculo_reposicao import calcular_item_reposicao, formatar_quantidade


class IngredienteSerializer(serializers.ModelSerializer):
    calculo_reposicao = serializers.SerializerMethodField()

    class Meta:
        model = Ingrediente
        fields = [
            "id",
            "nome",
            "unidade",
            "meta",
            "estoque_atual",
            "vencido",
            "faltou_no_meio_do_mes",
            "consumo_real",
            "observacao",
            "calculo_reposicao",
            "criado_em",
            "atualizado_em",
        ]

    def get_calculo_reposicao(self, obj):
        return calcular_item_reposicao(obj)


class RegistroCompraSerializer(serializers.ModelSerializer):
    data_formatada = serializers.SerializerMethodField()

    class Meta:
        model = RegistroCompra
        fields = [
            "id",
            "criado_em",
            "data_formatada",
            "total_itens",
            "conteudo_texto",
        ]

    def get_data_formatada(self, obj):
        return obj.criado_em.strftime("%d/%m/%Y às %H:%M")
