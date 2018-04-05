# PPCG-v2
An improved user experience for competitive programming.

[![Build Status](https://travis-ci.org/PPCG-v2/PPCG-v2.svg?branch=master)](https://travis-ci.org/PPCG-v2/PPCG-v2) [![codecov](https://codecov.io/gh/PPCG-v2/PPCG-v2/branch/master/graph/badge.svg)](https://codecov.io/gh/PPCG-v2/PPCG-v2)

## Setup
### Prereqs
To get started make sure you have the following installed:

 - Python 3
 - MySQL
 - `bundle`
 - `node`/`npm`
 - Redis
 - memcached

and the plugins (may be missing certain see `requirements.txt` for all):

 - Ruby gems (`bundle install`)
 - Node.js packages (`npm install`)
 - All plugins in `requirements.txt` (`pip install -r requirements.txt`)

additionally you need to know:

 - MySQL username + password
 - Redis password

You can use `setup.sh` to try to automatically setup most things. Run this with `sudo`.

### Setup
The setup script automatically does most of this

 1. Copy `config.default.py` to `config.py`
 1. Replace `MYSQL_USERNAME` and `MYSQL_PASSWORD` with appropriate MySQL credentials
 1. Replace `REDIS_PASSWORD` with appropriate Redis credential
 1. Set `secret_skey` to some random string. It doesn't matter what it is as long as it is random.
 1. Run `mysql -u MYSQL_USERNAME -e "CREATE DATABASE ppcg;"`

If you look within `config.py`, you need to fill in various API keys from google, StackExchange, etc.

### Run

Make sure that your Redis server is running!

Production run:

```bash
$ celery multi start w1 -A celery_server
$ ./run.py
```

Development run:

```bash
$ celery multi start w1 -A celery_server
$ ./debug.sh
```
