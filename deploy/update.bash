#!/usr/bin/env bash

# Ensure correct directory
cd /var/www/ppcg-v2

git fetch origin
git reset --hard origin/master

# Ensure webasset dirs exist
mkdir -p static/css
mkdir -p static/lib
