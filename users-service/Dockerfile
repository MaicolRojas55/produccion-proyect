# Etapa 1: dependencias
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Etapa 2: imagen final mínima
FROM python:3.11-slim
WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /install /usr/local
COPY app ./app
COPY init_db.py entrypoint.py ./

ENV PYTHONUNBUFFERED=1
ENV SEED_DEFAULT_USERS=true
EXPOSE 8000

CMD ["python", "entrypoint.py"]
