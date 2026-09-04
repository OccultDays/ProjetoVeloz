# Multi-stage Dockerfile para o Sistema de Controle de Estoque
# Estágio 1: Build do Frontend React
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Estágio 2: Backend Django + WhiteNoise
FROM python:3.12-slim
WORKDIR /app

# Variáveis de ambiente
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

# Instala dependências do sistema
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Instala dependências Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia código do backend
COPY backend/ ./backend/

# Copia a build do frontend para a pasta esperada pelo Django
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

WORKDIR /app/backend

# Coleta arquivos estáticos
RUN python manage.py collectstatic --noinput

# Executa migrações e carrega dados iniciais
RUN python manage.py migrate && python manage.py loaddata dados_iniciais.json

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && python manage.py loaddata dados_iniciais.json && gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3"]
