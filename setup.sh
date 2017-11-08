#!/usr/bin/env bash

read -p "Install dependencies (yn): " should_deps;
if [[ $should_deps = "y" ]]; then
    gem install sass
    npm i -g autoprefixer postcss-cli clean-css@3.4.24
fi;

read -p "Setup MySQL (yn): " should_mysql;
if [[ $should_mysql == "y" ]]; then
    read -p "MySQL username: " sql_username
    read -s -p "MySQL password: " sql_username

    cp config.default.py config.py
    sed -i '' 'config.py' "s/root/$sql_username/g"
    sed -i '' 'config.py' "s/MYSQL_PASSWORD/$sql_password/$2/g"

    echo "CREATE DATABASE ppcg;" | mysql -u "$sql_username"
    mysql -u "$sql_password" ppcg < ppcg.sql
fi
