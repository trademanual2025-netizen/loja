#!/bin/bash
# Script de deploy para Giovana Dias - envia código para GitHub e aciona Vercel
# Uso: bash deploy.sh

set -e

# ─── TOKEN GITHUB ─────────────────────────────────────────────
# No Replit: lido automaticamente dos secrets
# Fora do Replit: substitua SEU_TOKEN_AQUI pelo token real
GITHUB_TOKEN_GIOVANA="${GITHUB_TOKEN_GIOVANA:-SEU_TOKEN_AQUI}"
# ──────────────────────────────────────────────────────────────

MSG="${1:-deploy: $(date '+%d/%m/%Y %H:%M')}"
REPO="Giovana2026/loja"
BRANCH="main"
AUTHOR_NAME="Giovana2026"
AUTHOR_EMAIL="projeto.giovanadias@gmail.com"
WEBHOOK_ID="599315213"
DEPLOY_HOOK="https://api.vercel.com/v1/integrations/deploy/prj_mHodShSGulP3F8DWI2OVEyjRBrsO/vgpqJm1rej"

if [ -z "$GITHUB_TOKEN_GIOVANA" ] || [ "$GITHUB_TOKEN_GIOVANA" = "SEU_TOKEN_AQUI" ]; then
  echo "ERRO: coloque seu token GitHub na variável GITHUB_TOKEN_GIOVANA no topo do script."
  exit 1
fi

echo "▶ Pausando webhook..."
curl -s -X PATCH \
  -H "Authorization: token ${GITHUB_TOKEN_GIOVANA}" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/${REPO}/hooks/${WEBHOOK_ID}" \
  -d '{"active":false}' > /dev/null

echo "▶ Enviando código para GitHub..."
git push --force "https://${GITHUB_TOKEN_GIOVANA}@github.com/${REPO}.git" main 2>&1

echo "▶ Criando commit com identidade correta para o Vercel..."
TREE_SHA=$(curl -s -H "Authorization: token ${GITHUB_TOKEN_GIOVANA}" \
  "https://api.github.com/repos/${REPO}/commits/${BRANCH}" \
  | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');const j=JSON.parse(d);console.log(j.commit.tree.sha)")

HEAD_SHA=$(curl -s -H "Authorization: token ${GITHUB_TOKEN_GIOVANA}" \
  "https://api.github.com/repos/${REPO}/commits/${BRANCH}" \
  | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');const j=JSON.parse(d);console.log(j.sha)")

NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

NEW_SHA=$(curl -s -X POST \
  -H "Authorization: token ${GITHUB_TOKEN_GIOVANA}" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/${REPO}/git/commits" \
  -d "{\"message\":\"${MSG}\",\"tree\":\"${TREE_SHA}\",\"parents\":[\"${HEAD_SHA}\"],\"author\":{\"name\":\"${AUTHOR_NAME}\",\"email\":\"${AUTHOR_EMAIL}\",\"date\":\"${NOW}\"},\"committer\":{\"name\":\"${AUTHOR_NAME}\",\"email\":\"${AUTHOR_EMAIL}\",\"date\":\"${NOW}\"}}" \
  | node -e "const d=require('fs').readFileSync('/dev/stdin','utf8');const j=JSON.parse(d);console.log(j.sha)")

curl -s -X PATCH \
  -H "Authorization: token ${GITHUB_TOKEN_GIOVANA}" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/${REPO}/git/refs/heads/${BRANCH}" \
  -d "{\"sha\":\"${NEW_SHA}\",\"force\":true}" > /dev/null

echo "▶ Reativando webhook..."
curl -s -X PATCH \
  -H "Authorization: token ${GITHUB_TOKEN_GIOVANA}" \
  -H "Content-Type: application/json" \
  "https://api.github.com/repos/${REPO}/hooks/${WEBHOOK_ID}" \
  -d '{"active":true}' > /dev/null

sleep 3

echo "▶ Acionando deploy na Vercel..."
curl -s -X POST "${DEPLOY_HOOK}" > /dev/null

echo "✓ Commit enviado: ${NEW_SHA:0:12}"
echo "✓ Deploy na Vercel iniciado — sem deploys bloqueados!"
echo "  Acompanhe em: https://vercel.com/giovana2026-2085/loja"
