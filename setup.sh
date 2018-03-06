#!/usr/bin/env bash

read -p "Install gems (yn): " should_gems
if [[ $should_gems = "y" ]]; then
    gem install bundle
    bundle install
fi

read -p "Install npm packages (yn): " should_npm
if [[ $should_npm = "y" ]]; then
    npm install
    cd static
    npm install
    cd ..
fi

read -p "Install python packages (yn): " should_pip
if [[ $should_pip = "y" ]]; then
    pip3 install -r requirements.txt
fi

read -p "Setup MySQL (yn): " should_mysql
if [[ $should_mysql == "y" ]]; then
    read -p "MySQL username: " sql_username
    read -s -p "MySQL password: " sql_password

    cp config.default.py config.py
    sed -i "s/MYSQL_USERNAME/$sql_username/g" config.py
    sed -i "s/MYSQL_PASSWORD/$sql_password/g" config.py

    echo "CREATE DATABASE ppcg IF NOT EXISTS;" | mysql -u "$sql_username" -p"$sql_password"
fi

read -p "Setup Redis (yn): " should_redis
if [[ $should_redis == "y" ]]; then
    read -s -p "Redis password: " redis_password

    sed -i "s/REDIS_PASSWORD/$redis_password/g" config.py
fi
