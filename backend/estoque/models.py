from django.db import models
from django.utils import timezone
from .services.calculo_reposicao import calcular_item_reposicao


class Ingrediente(models.Model):
    """
    Representa um ingrediente do estoque do Seu Raimundo.
    """
    nome = models.CharField(
        max_length=120,
        unique=True,
        verbose_name="Nome do Ingrediente",
        help_text="Ex: Farinha, Leite, Ovo"
    )
    unidade = models.CharField(
        max_length=30,
        verbose_name="Unidade de Medida",
        default="Kg",
        help_text="Ex: Kg, L, Unidade, g, dz"
    )
    meta = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Meta Mensal",
        help_text="Quantidade que o Seu Raimundo gosta de manter no início do mês"
    )
    estoque_atual = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
        verbose_name="Estoque Atual",
        help_text="Sobra encontrada no final do mês"
    )
    vencido = models.BooleanField(
        default=False,
        verbose_name="Venceu / Estragou?",
        help_text="Se verdadeiro, todo o estoque atual é descartado e recompra-se a meta cheia"
    )
    faltou_no_meio_do_mes = models.BooleanField(
        default=False,
        verbose_name="Acabou no meio do mês?",
        help_text="Se verdadeiro, a meta foi insuficiente: calcula sobre consumo real + 20% de margem"
    )
    consumo_real = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        verbose_name="Consumo Real Registrado",
        help_text="Opcional. Se não informado e faltou no mês, assume o valor da meta consumida"
    )
    observacao = models.TextField(
        blank=True,
        default="",
        verbose_name="Observações"
    )
    criado_em = models.DateTimeField(default=timezone.now, verbose_name="Data de Criação")
    atualizado_em = models.DateTimeField(default=timezone.now, verbose_name="Última Atualização")

    def save(self, *args, **kwargs):
        self.atualizado_em = timezone.now()
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Ingrediente"
        verbose_name_plural = "Ingredientes"
        ordering = ["nome"]

    def __str__(self):
        return f"{self.nome} ({self.unidade})"

    def calcular_necessidade(self):
        """Executa a regra de negócio para este ingrediente."""
        return calcular_item_reposicao(self)


class RegistroCompra(models.Model):
    """
    Histórico de listas de compras geradas para auditoria e controle.
    """
    criado_em = models.DateTimeField(auto_now_add=True)
    total_itens = models.PositiveIntegerField(default=0)
    conteudo_texto = models.TextField(verbose_name="Lista em Texto")

    class Meta:
        verbose_name = "Registro de Compra"
        verbose_name_plural = "Registros de Compras"
        ordering = ["-criado_em"]

    def __str__(self):
        return f"Compra em {self.criado_em.strftime('%d/%m/%Y %H:%M')} ({self.total_itens} itens)"
