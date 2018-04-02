#!/usr/bin/env bash

# Ensure correct directory
cd /var/www/ppcg-v2

echo "HEAD initially at version:"
echo "$(git rev-parse @)"

git fetch origin
git reset --hard origin/master

echo "Deployed to version:"
echo "$(git rev-parse @)"

# Ensure webasset dirs exist
mkdir -p static/css
mkdir -p static/lib

# Echo checksums
shasum static/lib/main.js
shasum static/lib/css/all-light.css
shasum static/lib/css/all-dark.css

# Restart service
sudo service ppcg-v2 restart
