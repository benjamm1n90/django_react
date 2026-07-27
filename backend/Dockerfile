FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# libpq-dev + gcc are needed to build psycopg2-binary's dependencies on some
# platforms; kept minimal and removed from the final layer via slim base.
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc \
    && rm -rf /var/lib/apt/lists/*

# requirements.txt lives at the repo root, so the build context for this
# image is the repo root (see docker-compose.yml).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

COPY backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]
