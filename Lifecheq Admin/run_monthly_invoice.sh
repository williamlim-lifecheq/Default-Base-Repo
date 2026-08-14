#!/bin/bash
# Monthly contractor invoice generation, run locally on William's Mac.
#
# Installed as a launchd job that fires on the 14th of each month. Everything
# happens on this machine: the repo is refreshed, the invoice is generated into
# "Lifecheq Admin", and nothing is pushed to GitHub. That keeps the automation
# independent of any cloud credentials.
#
# Log: ~/Library/Logs/invoice-generate.log

set -uo pipefail

ADMIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$ADMIN_DIR/.." && pwd)"
VENV="$HOME/.invoice-venv"

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

log "Starting monthly invoice generation"

# Refresh from GitHub first so the generator numbers the new invoice from the
# latest one on record. A failure here is not fatal: the local files are enough.
cd "$REPO_DIR" || { log "ERROR: cannot cd to $REPO_DIR"; exit 1; }
if /usr/bin/git pull --quiet; then
    log "Repo up to date"
else
    log "WARNING: git pull failed, continuing with local state"
fi

# First run sets up an isolated Python environment, so this never depends on
# system Python having python-docx available.
if [ ! -x "$VENV/bin/python3" ]; then
    log "Creating Python environment at $VENV"
    if ! /usr/bin/python3 -m venv "$VENV"; then
        log "ERROR: could not create virtualenv (is python3 installed?)"
        exit 1
    fi
    "$VENV/bin/pip" install --quiet --upgrade pip
    if ! "$VENV/bin/pip" install --quiet python-docx openpyxl; then
        log "ERROR: could not install python-docx/openpyxl"
        exit 1
    fi
    log "Python environment ready"
fi

cd "$ADMIN_DIR" || { log "ERROR: cannot cd to $ADMIN_DIR"; exit 1; }
if "$VENV/bin/python3" generate_invoice.py; then
    log "Invoice generated successfully"
else
    log "ERROR: generate_invoice.py failed"
    exit 1
fi
