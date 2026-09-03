from django.conf import settings
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.static import serve
from estoque.views import index_view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('estoque.urls')),
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': settings.FRONTEND_DIR / 'assets'}),
    path('', index_view, name='index'),
    # Catch-all fallback para SPA do React quando o build estiver presente
    re_path(r'^(?!api/|admin/|static/|assets/).*$', index_view, name='spa-fallback'),
]
