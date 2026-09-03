from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    IngredienteViewSet,
    RegistroCompraViewSet,
    obter_lista_compras,
    exportar_lista_compras_txt,
    salvar_historico_compras,
    atualizar_metas_ajustadas,
    confirmar_compra_atualizar_estoque,
    dashboard_stats,
)

router = DefaultRouter()
router.register(r"ingredientes", IngredienteViewSet, basename="ingrediente")
router.register(r"historico", RegistroCompraViewSet, basename="historico")

urlpatterns = [
    path("", include(router.urls)),
    path("compras/", obter_lista_compras, name="lista-compras"),
    path("compras/texto/", exportar_lista_compras_txt, name="exportar-compras-txt"),
    path("compras/salvar/", salvar_historico_compras, name="salvar-compras"),
    path("compras/atualizar-metas/", atualizar_metas_ajustadas, name="atualizar-metas"),
    path("compras/confirmar-compra/", confirmar_compra_atualizar_estoque, name="confirmar-compra"),
    path("dashboard/", dashboard_stats, name="dashboard-stats"),
]
