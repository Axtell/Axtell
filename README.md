<p align="center">
  <img alt="Axtell" src="https://user-images.githubusercontent.com/15314511/44938903-56267400-ad36-11e8-939e-2fa436926fc1.png"/>
</p>
<h3 align="center">An improved user experience for competitive programming.</h3>
<p align="center">
  <a href="https://travis-ci.org/Axtell/Axtell"><img alt="Build Status" src="https://travis-ci.org/Axtell/Axtell.svg?branch=master"/></a>
  <a href="https://codecov.io/gh/Axtell/Axtell"><img alt="codecov" src="https://codecov.io/gh/Axtell/Axtell/branch/master/graph/badge.svg"/></a>
</p>

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

## Installing Axtell
### 1. Prereqs
To get started make sure you have the following installed:

 - Python 3.6 or higher
 - MySQL (we recommend 8.0)
 - Probably Ruby (not 100% sure if actually required)
 - `node`/`npm` (Node.js 8 or higher is reccomended)
 - Redis
 - memcached
 - OpenSSL
    - macOS users should run `brew install openssl && brew link openssl --force`

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

If you look within `config.py`, you need to fill in various API keys from Google, StackExchange, etc. Additionally in the configuration file you'll see various other fields you can modify.

#### (Optional) Setup HTTPS
It's highly reccomend to run Axtell under a reverse proxy such as Nginx however for HTTPS, in the root directory of the Axtell instance, place a `server.crt` and `server.key` file.

#### (Optional) Setting up Safari Push Notifications
To integrate with iOS and macOS's Push Notification service you'll first need an Apple Developer Account. In the portal you'll need to create a Web Push Notification ID. Place this token in the `notifications.web_apn_id` field in the configuration file.

Additionally the certificate (.p12) should be placed in the cwd of the server and (i.e. the root) named 'webapn.p12'. The password should be placed in a text file 'webapn.passsword' (will be trimmed).

You may need to clear your web-servers/reverse-proxy's cache since the `/static/webapn` routes qualify for caching (and they should). The app will automatically generate the bundles etc. as applicable.

#### (Optional) Setting up APNS
If you're setting up Safari Push Notifications, for those notifications to be actually delivered you'll need to setup APNS. To integrate with APNS you'll need to enter your Apple Developer Team ID in the `config.py` under notifications. Additionally you need to place your APN key in the root directory of Axtell (i.e. execution CWD) as `apns.p8`. Fort hsi provide the `apns_key_id` and `apns_team_id` and `web_apn_id` under `notifications`

#### (Optional) Setting up Web Push
Web Push is a protocol for push notifications that extends to Chrome, Firefox, and potentially more browsers. This uses service workers to dispatch notifications. To setup Web Push you need to generate a VAPID key pair (same as a EC NIST P-256 key pair) which can be done by running these OpenSSL commands:

```
openssl ecparam -name prime256v1 -genkey -noout -out webpush-private.pem
openssl ec -in webpush-private.pem -pubout -out webpush-public.pem
```

These files are searched for in the root directory and are used for encrypting things such as Web Push messages.

Additionally you will need to supply the `notifications.support_email` config field.

**Note:** They are a finite amount of Web Push devices registerable per user, you can configure this using `notifications.max_push_devices` in the config

#### (Optional) Search
Axtell search uses [Algolia](https://www.algolia.com/) to index and search Axtell content. Axtell will index stale/unindexed data in these conditions:

 - The server starts
 - Every 2 minutes

Axtell's Algolia worker will scan the database for unindexed items and index them in Algolia. To use Algolia you will need to provide the parameters in `auth.algolia`. **Do NOT** provide an admin key as a search key as this will allow unconditional client access to your Algolia application.

Additionally the `auth.algolia.prefix` is prefixed to all index names. For a production, it's recommended to use `prod`, and for development to use `dev`. This can be anything; if this is empty then no prefix is used but this is not recommended.

#### (Optional) Bug Tracking
Axtell uses [Bugsnag](https://www.bugsnag.com/) to track bugs. To setup bugsnag, first setup the API keys in `auth.bugsnag` in the config. To deploy JavaScript source maps to bugsnag, run:

```bash
for js_source in static/lib/axtell~*.js; do
  JS_SOURCES+=($PROTOCOL://$HOSTNAME/$js_source@$js_source)
done

echo "SUBMITTING FRONTEND BUGSNAG SOURCEMAP..."
http -f POST https://upload.bugsnag.com/ \
  apiKey=$BUGSNAG_FRONTEND_API_KEY \
  appVersion=$(git rev-parse @) \
  minifiedUrl=$PROTOCOL://$HOSTNAME/static/lib/axtell.main.js \
  minifiedFile@static/lib/axtell.main.js \
  sourceMap@static/lib/axtell.main.js.map \
  "${JS_SOURCES[@]}"
```

and pass `PROTOCOL`, `HOSTNAME` and `BUGSNAG_FRONTEND_API_KEY` as parameters.

#### (Optional) Google Analytics
To track pageviews etc. you can setup Google Analytics. In the dashboard you need to do some setup:

##### Property Settings

Field | Value
------|-------
Advertising Features > Enable Demographics and Interest Reports | Off

##### Tracking Info

Field | Value
------|------
Data Collection > Remarketing | Off
Data Collection > Advertising Reporting Features | Off
Data Collection > Advertising Reporting Features | Off

##### Filters

 Name | Type | Option | Field | Value
------|------|--------|-------|-------
Post Preview | Custom | Search and Replace | Request URI | Replace `/post/preview.*` with `/post/preview` **not** case sensitive |



### 3. Build
You will need to build the assets (CSS and JS) before running Axtell. You can do this using:

Production build:
```sh
./build_all.sh
```

Debug build. This will not minify and will also enable a "watcher" program (rebuilds assets every time you make a change):
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

#### uWSGI
Some notes for uWSGI configurations is that the following config options are needed:

```ini
[uwsgi]
enable-threads = true
wsgi-disable-file-wrapper = true
```

## Building Documentation
After installing the dependencies. You can build the documentation using:

```sh
npx esdoc
```

## Run Server Tests
If you wish to run tests locally you can run:

```sh
python -m unittest discover tests -vf --locals
```
## Run UI App Tests
These tests are written with Nightwatch, you may run locally using the following
command. Do note that they are complex dependencies required:

```sh
npx nightwatch --env default
```

To run ensure these env vars are provided:

```sh
AXTELL_URL  # Root path of Axtell to use.
```

### Using Sauce Labs
To run using Sauce Labs, first setup Sauce Connect. Then ensure these env vars
are provided:

```sh
SAUCE_USERNAME
SAUCE_ACCESS_KEY
SAUCE_TUNNEL_IDENTIFIER
```

## Special Thanks
Axtell is able to run thanks to the generosity of the following companies:

<a href="https://www.algolia.com"><img alt="Algolia" src="https://www.algolia.com/static_assets/images/v3/shared/logos/algolia/logo-algolia-nebula-blue-whitespaces-bf76438c.svg" height="80"></a>&nbsp;
<a href="https://bugsnag.com"><img alt="Bugsnag" src="https://dka575ofm4ao0.cloudfront.net/pages-transactional_logos/retina/5227/JnJzriMRjuc8VGOYDCFR" height="40"></a>
