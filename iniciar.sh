#!/bin/bash
# Script de inicializacao - Ubuntu VPS
# Uso: bash iniciar.sh

set -e

echo "Lab Marketing - Inicializando..."

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "ATENCAO: .env criado. Edite o arquivo e rode novamente."
  exit 1
fi

echo "Subindo containers..."
docker compose up -d --build

echo "Aguardando banco..."
sleep 10

echo "Rodando migrations..."
docker compose exec app npx prisma migrate deploy

echo "Rodando seed..."
docker compose exec app npx prisma db seed

echo ""
echo "Pronto! App rodando na porta 3000."
echo "Login: ti@laboratorio.com / lab@2025"
echo "Login: diretor@laboratorio.com / lab@2025"
