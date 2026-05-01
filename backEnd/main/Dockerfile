FROM python:3.12-slim

WORKDIR /main

COPY requirements/requirements.txt .
RUN pip install --no-cache-dir -r requirementsr.txt

COPY . .

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]