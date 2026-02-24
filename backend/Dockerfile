# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set the working directory in the container
WORKDIR /app

# Create a non-root user
RUN groupadd -r mlstudio && useradd -r -g mlstudio mlstudio

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN python -m pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend directory into the container at /app
COPY . .

# Create necessary directories and set permissions
RUN mkdir -p logs && \
    chown -R mlstudio:mlstudio /app

# Switch to non-root user
USER mlstudio

# Expose port 8000 for the FastAPI app
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Command to run the application
CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
