from decimal import Decimal
from io import StringIO
from django.test import TestCase
from django.core.management import call_command
from rest_framework.test import APIClient

from estoque.models import Ingrediente, RegistroCompra
from estoque.services.calculo_reposicao import (
    calcular_item_reposicao,
    processar_lista_compras,
    formatar_quantidade,
)


class CalculoReposicaoServiceTestCase(TestCase):
    """
    Testes de unidade para o módulo de regras de negócio puras (calculo_reposicao).
    """

    def test_reposicao_padrao(self):
        """
        Cenário Normal: Meta 50 Kg, Estoque 38 Kg.
        Deve calcular: 50 - 38 = 12 Kg.
        Formato: 'Comprar: 12 Kg de Farinha'
        """
        dados = {
            "nome": "Farinha",
            "unidade": "Kg",
            "meta": 50,
            "estoque_atual": 38,
            "vencido": False,
            "faltou_no_meio_do_mes": False,
        }
        res = calcular_item_reposicao(dados)
        self.assertTrue(res["deve_comprar"])
        self.assertEqual(res["quantidade_a_comprar"], Decimal("12"))
        self.assertEqual(res["regra_aplicada"], "NORMAL")
        self.assertEqual(res["texto_formatado"], "Comprar: 12 Kg de Farinha")

    def test_estoque_suficiente_nao_entra_na_lista(self):
        """
        Cenário Estoque Suficiente: Meta 20 Kg, Estoque 20 Kg.
        Quantidade = 0. Não deve entrar na lista de compras.
        """
        dados = {
            "nome": "Açúcar",
            "unidade": "Kg",
            "meta": 20,
            "estoque_atual": 20,
            "vencido": False,
            "faltou_no_meio_do_mes": False,
        }
        res = calcular_item_reposicao(dados)
        self.assertFalse(res["deve_comprar"])
        self.assertEqual(res["quantidade_a_comprar"], Decimal("0"))
        self.assertEqual(res["texto_formatado"], "")

    def test_estoque_excedente_nao_entra_na_lista(self):
        """
        Cenário Estoque Excedente: Meta 10 L, Estoque 15 L.
        Quantidade calculada seria negativa, deve ser 0 e não entrar na lista.
        """
        dados = {
            "nome": "Óleo",
            "unidade": "L",
            "meta": 10,
            "estoque_atual": 15,
            "vencido": False,
            "faltou_no_meio_do_mes": False,
        }
        res = calcular_item_reposicao(dados)
        self.assertFalse(res["deve_comprar"])
        self.assertEqual(res["quantidade_a_comprar"], Decimal("0"))

    def test_ingrediente_vencido_recompra_meta_integral(self):
        """
        Cenário Vencido: Meta 30 L, Estoque 6 L, Vencido = True.
        Sobra descartada. Deve comprar a meta cheia (30 L).
        Formato: 'Comprar: 30 L de Leite'
        """
        dados = {
            "nome": "Leite",
            "unidade": "L",
            "meta": 30,
            "estoque_atual": 6,
            "vencido": True,
            "faltou_no_meio_do_mes": False,
        }
        res = calcular_item_reposicao(dados)
        self.assertTrue(res["deve_comprar"])
        self.assertEqual(res["quantidade_a_comprar"], Decimal("30"))
        self.assertEqual(res["regra_aplicada"], "VENCIDO")
        self.assertEqual(res["texto_formatado"], "Comprar: 30 L de Leite")

    def test_falta_no_meio_do_mes_com_gordurinha_20_porcento(self):
        """
        Cenário Falta no Mês: Meta 100 un, Estoque 0 un, Acabou antes do fim = True.
        Consumo base = Meta (100).
        Quantidade a comprar = 100 * 1.2 = 120 un.
        Formato: 'Comprar: 120 unidade de Ovo'
        """
        dados = {
            "nome": "Ovo",
            "unidade": "unidade",
            "meta": 100,
            "estoque_atual": 0,
            "vencido": False,
            "faltou_no_meio_do_mes": True,
            "consumo_real": None,
        }
        res = calcular_item_reposicao(dados)
        self.assertTrue(res["deve_comprar"])
        self.assertEqual(res["quantidade_a_comprar"], Decimal("120.00"))
        self.assertEqual(res["regra_aplicada"], "FALTA_NO_MES")
        self.assertEqual(res["nova_meta_sugerida"], Decimal("120.00"))
        self.assertEqual(res["texto_formatado"], "Comprar: 120 unidade de Ovo")

    def test_falta_no_meio_do_mes_com_consumo_real_informado(self):
        """
        Cenário Falta no Mês com Consumo Extra Registrado:
        Meta 10 Kg, Estoque 0 Kg, Consumo Real = 15 Kg.
        Quantidade a comprar = 15 * 1.2 = 18 Kg.
        Formato: 'Comprar: 18 Kg de Café'
        """
        dados = {
            "nome": "Café",
            "unidade": "Kg",
            "meta": 10,
            "estoque_atual": 0,
            "vencido": False,
            "faltou_no_meio_do_mes": True,
            "consumo_real": 15,
        }
        res = calcular_item_reposicao(dados)
        self.assertTrue(res["deve_comprar"])
        self.assertEqual(res["quantidade_a_comprar"], Decimal("18.00"))
        self.assertEqual(res["texto_formatado"], "Comprar: 18 Kg de Café")


class DjangoIntegrationTestCase(TestCase):
    """
    Testes de integração com banco de dados, Management Command e API REST.
    """

    def setUp(self):
        self.client = APIClient()
        self.farinha = Ingrediente.objects.create(
            nome="Farinha",
            unidade="Kg",
            meta=Decimal("50.00"),
            estoque_atual=Decimal("38.00"),
        )
        self.leite = Ingrediente.objects.create(
            nome="Leite",
            unidade="L",
            meta=Decimal("30.00"),
            estoque_atual=Decimal("6.00"),
            vencido=True,
        )
        self.acucar = Ingrediente.objects.create(
            nome="Açúcar",
            unidade="Kg",
            meta=Decimal("20.00"),
            estoque_atual=Decimal("20.00"),
        )

    def test_management_command_gerar_lista_compras(self):
        """
        Verifica se o comando no terminal imprime a lista de compras
        exatamente no formato solicitado pelo edital.
        """
        out = StringIO()
        call_command("gerar_lista_compras", stdout=out)
        output = out.getvalue().strip()

        # Deve conter Farinha e Leite
        self.assertIn("Comprar: 12 Kg de Farinha", output)
        self.assertIn("Comprar: 30 L de Leite", output)
        # Açúcar tem estoque suficiente, NÃO pode aparecer
        self.assertNotIn("Açúcar", output)

    def test_api_compras_endpoint(self):
        """
        Verifica o endpoint REST /api/compras/
        """
        response = self.client.get("/api/compras/")
        self.assertEqual(response.status_code, 200)
        dados = response.json()
        self.assertEqual(dados["total_itens_a_comprar"], 2)
        self.assertIn("Comprar: 12 Kg de Farinha", dados["linhas_texto"])
        self.assertIn("Comprar: 30 L de Leite", dados["linhas_texto"])

    def test_api_compras_texto_puro(self):
        """
        Verifica o endpoint de download /api/compras/texto/
        """
        response = self.client.get("/api/compras/texto/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "text/plain; charset=utf-8")
        conteudo = response.content.decode("utf-8")
        self.assertIn("Comprar: 12 Kg de Farinha", conteudo)

    def test_confirmar_compra_atualizar_estoque(self):
        """
        Verifica se a confirmação da compra reabastece o estoque e
        reseta o status de vencido.
        """
        response = self.client.post("/api/compras/confirmar-compra/")
        self.assertEqual(response.status_code, 200)

        # Farinha reabastece até a meta (50)
        self.farinha.refresh_from_db()
        self.assertEqual(self.farinha.estoque_atual, Decimal("50.00"))

        # Leite reabastece até a meta (30) e desmarca vencido
        self.leite.refresh_from_db()
        self.assertEqual(self.leite.estoque_atual, Decimal("30.00"))
        self.assertFalse(self.leite.vencido)
