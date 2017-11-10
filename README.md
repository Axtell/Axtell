# PPCG-v2
An improved user experience for Programming Puzzles &amp; Code Golf

## Setup
### Prereqs
To get started make sure you have the following installed:

 - Python 3
 - MySQL
 - `bundle`
 - `node`/`npm`
 
and the plugins (may be missing certain see `requirements.txt` for all):

 - Ruby gems (`bundle install`)
 - Node.js packages (`npm install`)
 - All plugins in `requirements.txt` (`pip install -r requirements.txt`)

additionally you need to know:

 - MySQL username + password

You can use `setup.sh` to try to automatically setup most things.

### Setup

 1. Copy `config.default.py` to `config.py`
 2. Replace `USERNAME` and `PASSWORD` with appropriate MySQL credentials
 3. Run `mysql -u MYSQL_USERNAME` and then in the prompt type `CREATE DATABASE ppcg;`
 4. Run `mysql -u MYSQL_USERNAME ppcg < ppcg.sql`
 4. Set `secret_skey` to some random string. It doesn't matter what it is as long as it is random.

### Run
To run do:

```bash
$ python3 main.py
```
