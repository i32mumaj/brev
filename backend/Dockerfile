FROM python:3.12-slim

WORKDIR /app

COPY ./requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

RUN useradd -m appuser

COPY --chown=appuser:appuser . .
RUN chown appuser:appuser /app

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0"]