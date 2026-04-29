FROM python:3.11-slim
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server.py .

EXPOSE 8000

# Use production uvicorn (no --reload, single worker can be scaled via replicas)
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
