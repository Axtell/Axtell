#!/usr/bin/env bash
npm install
cat =(echo "import os") config.default.py > config.py
sed -E "s/'([A-Z_]+)'/os.environ['\1']/" config.py
./build_all.sh
