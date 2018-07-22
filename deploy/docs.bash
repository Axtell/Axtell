#!/usr/bin/env bash

echo "BEGINNING JS DOCUMENTATION DEPLOYMENT"
cd "$TRAVIS_BUILD_DIR"

echo "JS DOCUMENTATION DELPOY: CWD $(pwd)"

echo "JS DOCUMENTATION DEPLOY: INSTALL"
npm i -g esdoc
npm i -g surge

echo "JS DOCUMENTATION DEPLOY: BUILDING"
esdoc

echo "JS DOCUMENTATION DEPLOY: DEPLOY"
surge --project ./docs-js --domain api.axtell.vihan.org

true
