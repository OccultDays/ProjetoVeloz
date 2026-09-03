"""
Django Management Command: gerar_lista_compras
Executa o cálculo de reposição de estoque do restaurante do Seu Raimundo
e imprime a lista de compras no formato exato solicitado pelo desafio técnico.
"""

from django.core.management.base import BaseCommand
from estoque.models import Ingrediente, RegistroCompra
from estoque.services.calculo_reposicao import processar_lista_compras, formatar_quantidade


class Command(BaseCommand):
    help = "Calcula e imprime a lista de compras no formato estrito: 'Comprar: <quantidade> <unidade> de <ingrediente>'"

    def add_arguments(self, parser):
        parser.add_argument(
            "--detalhado",
            action="store_true",
            help="Exibe os motivos e detalhes das regras aplicadas para cada item",
        )
        parser.add_argument(
            "--atualizar-metas",
            action="store_true",
            help="Atualiza no banco de dados a meta dos itens que faltaram no mês para o novo valor com +20%% de margem",
        )
        parser.add_argument(
            "--exportar",
            type=str,
            default=None,
            help="Caminho do arquivo .txt para exportar a lista de compras",
        )
        parser.add_argument(
            "--salvar-historico",
            action="store_true",
            help="Salva um registro da lista gerada na tabela de histórico",
        )

    def handle(self, *args, **options):
        ingredientes = list(Ingrediente.objects.all())
        if not ingredientes:
            self.stdout.write(self.style.WARNING("Nenhum ingrediente cadastrado no banco de dados."))
            return

        resultado = processar_lista_compras(ingredientes)

        # Se solicitado modo detalhado, exibe cabeçalho explicativo
        if options["detalhado"]:
            self.stdout.write(self.style.MIGRATE_HEADING("=== CÁLCULO DETALHADO DE REPOSIÇÃO (SEU RAIMUNDO) ==="))
            for calculo in resultado["todos_calculos"]:
                status_icon = "[COMPRAR]" if calculo["deve_comprar"] else "[OK]"
                self.stdout.write(
                    f"{status_icon} {calculo['nome']} | Meta: {formatar_quantidade(calculo['meta'])} {calculo['unidade']} "
                    f"| Estoque Atual: {formatar_quantidade(calculo['estoque_atual'])} {calculo['unidade']} "
                    f"| Regra: {calculo['regra_aplicada']}"
                )
                self.stdout.write(f"     Motivo: {calculo['motivo']}")
            self.stdout.write(self.style.MIGRATE_HEADING("\n=== LISTA DE COMPRAS FINAL ==="))

        # Imprime no stdout linha por linha no formato estritamente obrigatório:
        # Comprar: <quantidade> <unidade> de <ingrediente>
        if resultado["linhas_texto"]:
            for linha in resultado["linhas_texto"]:
                self.stdout.write(linha)
        else:
            self.stdout.write("Nenhum item precisa ser comprado no momento.")

        # Atualizar metas se solicitado
        if options["atualizar_metas"]:
            atualizados = 0
            for calculo in resultado["todos_calculos"]:
                if calculo["regra_aplicada"] == "FALTA_NO_MES" and calculo["nova_meta_sugerida"]:
                    ing = Ingrediente.objects.get(id=calculo["id"])
                    meta_antiga = ing.meta
                    ing.meta = calculo["nova_meta_sugerida"]
                    ing.faltou_no_meio_do_mes = False  # Reseta o flag para o novo ciclo
                    ing.save(update_fields=["meta", "faltou_no_meio_do_mes"])
                    atualizados += 1
                    if options["detalhado"]:
                        self.stdout.write(
                            self.style.SUCCESS(
                                f"Meta de {ing.nome} atualizada: {formatar_quantidade(meta_antiga)} -> {formatar_quantidade(ing.meta)} {ing.unidade}"
                            )
                        )
            if atualizados > 0 and not options["detalhado"]:
                self.stdout.write(self.style.SUCCESS(f"{atualizados} meta(s) atualizada(s) com sucesso."))

        # Salvar histórico no banco
        if options["salvar_historico"]:
            RegistroCompra.objects.create(
                total_itens=resultado["total_itens_a_comprar"],
                conteudo_texto=resultado["texto_final"],
            )

        # Exportar para arquivo texto
        if options["exportar"]:
            caminho = options["exportar"]
            with open(caminho, "w", encoding="utf-8") as f:
                f.write(resultado["texto_final"] + "\n")
            self.stdout.write(self.style.SUCCESS(f"Lista salva com sucesso em: {caminho}"))
