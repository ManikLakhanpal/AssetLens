# Simple Dockerfile for the LangChain service
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy requirements file
COPY pyproject.toml ./

# Install dependencies
RUN pip install fastapi uvicorn pydantic langchain langchain-openai langchain-google-genai

# Copy all files
COPY . .

# Expose port
EXPOSE 8000

# Start the app
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
