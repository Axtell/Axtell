# PPCG-v2
An improved user experience for Programming Puzzles &amp; Code Golf

## Setup
### Prereqs
To get started make sure you have the following installed:

 - Python 3
 - MySQL
 
and the python plugins (may be missing certain see `requirements.txt` for all):

 - All plugins in `requirements.txt` (`pip install -r requirements.txt`)
 - MySQL (available at: https://dev.mysql.com/downloads/file/?id=472643)

additionally you need to know:

 - MySQL username + password

### Setup

 1. Copy `config.default.py` to `config.py`
 2. Replace `USERNAME` and `PASSWORD` with appropriate MySQL credentials
 3. Run `mysql -u MYSQL_USERNAME` and then in the prompt type `CREATE DATABASE ppcg;`
 4. Run `mysql -u MYSQL_USERNAME ppcg < ppcg.sql`

### Run
To run do:

```bash
$ python3 main.py
```
