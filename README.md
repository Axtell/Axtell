# Axtell
An improved user experience for competitive programming.

[![Build Status](https://travis-ci.org/Axtell/Axtell.svg?branch=master)](https://travis-ci.org/Axtell/Axtell) [![codecov](https://codecov.io/gh/Axtell/Axtell/branch/master/graph/badge.svg)](https://codecov.io/gh/Axtell/Axtell)

## Project Structure
An overview of the Axtell project and key components:

 - Axtell backend (`app/`)
    - Database models (`app/models`)
    - Controllers to manage interaction logic (`app/controllers`)
    - Routes (which talk to controllers) to serve and parse requests (`app/routes`)
    - Socket routes (`app/socket_routes`)
    - Session management code (`app/session`)
    - Celery tasks (`app/tasks`). We offload more expensive tasks to Celery which manages worker processes, this includes things like the markdown renderer.
    - Instances (`app/instances`) global object instances e.g. database or redis instances are located here
    - Helpers (`app/helpers`). Various functions in classes that can be used generically to do things.
        - OAuth callbacks (`app/helpers/oauth`). These are a part of OAuth login and return a profile for a new OAuth user
        - Macros (`app/helpers/macros`). These macros are available to Jinja2 templates
 - JavaScripts source (`js/`). This is setup similar to the Axtell backend.
    - Controllers to manage interaction logic with HTML (`js/controllers`)
    - Templates are JavaScript components (`js/templates`)
    - Models are your typical models (`js/models`). Important modules:
        - `Request` is a subclassable abstract class that centralizes all requests and handles CSRF etc.
        - `PagedRequest` is a subclass of `Request` to interact with pages
        - `Data` manages structured information associated with a page
        - `Auth` manages the authorization instance of a user
    - `js/helpers/ErrorManager` centralizes ErrorManagement and sends detailed reports to bugsnag along with pretty-printing reporting.
 - SCSS source (`scss/`)
 - HTML Templates (`templates/`) which are Jinja2

You can build Axtell's JavaScript documentation using `npm run docs` which will create the `docs-js` directory. Additionally you may reference the [hosted API documentation](https://api.axtell.vihan.org)

## Setting up Axtell
### 1. rereqs
To get started make sure you have the following installed:

 - Python 3
 - MySQL
 - Probably Ruby (not 100% sure if actually required)
 - `node`/`npm`
 - Redis
 - memcached

and the plugins (may be missing certain see `requirements.txt` for all):

 - Node.js packages (`npm install`)
 - All plugins in `requirements.txt` (`pip install -r requirements.txt`)

additionally you need to know:

 - MySQL username + password
 - Redis password

You can use `setup.sh` to try to automatically setup most things. Run this with `sudo`.

### 2. Setup
The setup script automatically does most of this

 1. Copy `config.default.py` to `config.py`
 1. Replace `MYSQL_USERNAME` and `MYSQL_PASSWORD` with appropriate MySQL credentials
 1. Replace `REDIS_PASSWORD` with appropriate Redis credential
 1. Set `secret_skey` to some random string. It doesn't matter what it is as long as it is random.
 1. Run `mysql -u MYSQL_USERNAME -e "CREATE DATABASE ppcg;"`

If you look within `config.py`, you need to fill in various API keys from google, StackExchange, etc. Additionally in the configuration file you'll see various other fields you can modify

#### Setting up Safari Push Notifications
To integrate with iOS and macOS's Push Notification service you'll first need an Apple Developer Account. In the portal you'll need to create a Web Push Notification ID. Place this token in the `notifications.web_apn_id` field in the configuration file.

You may need to clear your web-servers/reverse-proxy's cache since the `/static/webapn` routes qualify for caching (and they should). The app will automatically generate the bundles etc. as applicable

### 3. Build
You will need to build the assets (CSS and JS) before running Axtell. You can do this using:

Production build:
```sh
./build_all.sh
```

Debug build. This will not minify and will also enable a "watcher" program (rebuilds assets everytime you make a change):
```sh
./build_all_debug.sh
```

### 4. Run

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
