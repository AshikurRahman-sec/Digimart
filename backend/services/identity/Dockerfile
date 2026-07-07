FROM python:3.12-slim

WORKDIR /app

COPY backend/shared /shared
COPY backend/services/identity /app

RUN pip install --no-cache-dir -e /shared -e .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]

