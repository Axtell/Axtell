#!/usr/bin/env bash

read -p "Install gems (yn): " should_gems
if [[ $should_gems = "y" ]]; then
    gem install sass
fi

read -p "Install npm packages (yn): " should_npm
if [[ $should_npm = "y" ]]; then
    npm i -g autoprefixer postcss-cli clean-css@3.4.24
fi

read -p "Install python packages (yn): " should_pip
if [[ $should_pip = "y" ]]; then
    pip install -r requirements.txt
fi

read -p "Setup MySQL (yn): " should_mysql
if [[ $should_mysql == "y" ]]; then
    read -p "MySQL username: " sql_username
    read -s -p "MySQL password: " sql_username

    cp config.default.py config.py
    sed -i '' 'config.py' "s/root/$sql_username/g"
    sed -i '' 'config.py' "s/MYSQL_PASSWORD/$sql_password/$2/g"

    echo "CREATE DATABASE ppcg;" | mysql -u "$sql_username"
    mysql -u "$sql_password" ppcg < ppcg.sql
fi
