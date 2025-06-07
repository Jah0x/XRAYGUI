#!/bin/bash
# Автоматическое обновление XRAYGUI
set -e
LOG=/var/log/xraygui-deploy.log
{
  cd /opt/XRAYGUI
  git pull
  /usr/bin/pnpm install --frozen-lockfile
  /usr/bin/pnpm run build
  echo "Deployment successful $(date)" >> "$LOG"
} >> "$LOG" 2>&1
