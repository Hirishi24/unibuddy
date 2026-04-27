FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from parent dir (since we are in hybrid/)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all files from hybrid/
COPY . .

# The app is in api.py
CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "7860"]
