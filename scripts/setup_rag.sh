#!/bin/bash

set -e

echo "=============================================="
echo "Enterprise IT Support - RAG Setup"
echo "=============================================="

PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$PROJECT_ROOT"

echo ""
echo "[1/2] Ingesting company documents..."

python -m backend.ai.rag.ingest

echo ""
echo "[2/2] Ingesting MCP instructions..."

python -m backend.ai.rag.mcp.ingest

echo ""
echo "=============================================="
echo "RAG setup completed successfully."
echo "=============================================="