#!/bin/bash
# Script de deploy para Giovana Dias - envia código para GitHub e aciona Vercel
# Uso: bash deploy.sh "mensagem do commit"

set -e

MSG="${1:-deploy: $(date '+%d/%m/%Y %H:%M')}"
REPO="Giovana2026/loja"
BRANCH="main"
AUTHOR_NAME="Giovana2026"
AUTHOR_EMAIL="projeto.giovanadias@gmail.com"

if [ -z "$GITHUB_TOKEN_GIOVANA" ]; then
  echo "ERRO: variável GITHUB_TOKEN_GIOVANA não encontrada."
  exit 1
fi

echo "▶ Enviando código para GitHub..."

# 1. Force push do código local para o GitHub
git push --force "https://${GITHUB_TOKEN_GIOVANA}@github.com/${REPO}.git" main 2>&1

echo "▶ Criando commit com identidade correta para o Vercel..."

# 2. Pegar tree e HEAD do commit recém-enviado
TREE_SHA=$(curl -s -H "Authorization: token ${GITHUB_TOKEN_GIOVANA}" \
  "https://api.github.com/repos/${REPO}/commits/${BRANCH}" \
  | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');const j=JSON.parse(d);console.log(j.commit.tree.sha)")

HEAD_SHA=$(curl -s -H "Authorization: token ${GITHUB_TOKEN_GIOVANA}" \
  "https://api.github.com/repos/${REPO}/commits/${BRANCH}" \
  | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');const j=JSON.parse(d);console.log(j.sha)")

NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# 3. Criar novo commit com autoria correta (Giovana2026) sobre a mesma árvore
NEW_SHA=$(curl -s -X POST \
  -H "Authorization: token ${GITHUB_TOKEN_GIOVANA}" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/${REPO}/git/commits" \
  -d "{\"message\":\"${MSG}\",\"tree\":\"${TREE_SHA}\",\"parents\":[\"${HEAD_SHA}\"],\"author\":{\"name\":\"${AUTHOR_NAME}\",\"email\":\"${AUTHOR_EMAIL}\",\"date\":\"${NOW}\"},\"committer\":{\"name\":\"${AUTHOR_NAME}\",\"email\":\"${AUTHOR_EMAIL}\",\"date\":\"${NOW}\"}}" \
  | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');const j=JSON.parse(d);console.log(j.sha)")

# 4. Atualizar branch main para o novo commit
curl -s -X PATCH \
  -H "Authorization: token ${GITHUB_TOKEN_GIOVANA}" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/${REPO}/git/refs/heads/${BRANCH}" \
  -d "{\"sha\":\"${NEW_SHA}\",\"force\":true}" > /dev/null

echo "✓ Commit enviado: ${NEW_SHA:0:12}"
echo "✓ Deploy na Vercel iniciado automaticamente!"
echo "  Acompanhe em: https://vercel.com/giovana2026-2085/loja"
