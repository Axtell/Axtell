#!/usr/bin/env bash
REMOTE_HOST='travis-deploy@198.211.104.43'

# Travis should verify we're on the correct branch but just in case
if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "master" ]; then
    echo "Not a deploy environment. Exiting..."
    exit 0
fi

# Add key
eval "$(ssh-agent -s)"
chmod 600 deploy/id_rsa
ssh-add deploy/id_rsa

# Ensure perms are correct
chmod -R 644 "$TRAVIS_BUILD_DIR/static/css/"* "$TRAVIS_BUILD_DIR/static/lib/"*

# Run update script
echo "DEPLOY: UPDATING GIT"
ssh -o "StrictHostKeyChecking no" "$REMOTE_HOST" 'bash -s' < deploy/update.bash

echo "DEPLOY: UPLOADING JS"
rsync --super --chmod=g+rw -rvzP "$TRAVIS_BUILD_DIR/static/lib/" "$REMOTE_HOST:/var/www/ppcg-v2/static/lib"

echo "DEPLOY: UPLOADING CSS"
rsync --super --chmod=g+rw -rvzP "$TRAVIS_BUILD_DIR/static/css/" "$REMOTE_HOST:/var/www/ppcg-v2/static/css"

echo "DEPLOY: CLEANING UP..."
rm deploy/id_rsa

notify_build () {
  http POST https://build.bugsnag.com/ \
    apiKey=$1 \
    appVersion=$(git rev-parse @) \
    releaseStage=production \
    builderName=$(git show -s --format='%an') \
    sourceControl:="{
      \"provider\": \"github\",
      \"repository\": \"https://github.com/$TRAVIS_REPO_SLUG\",
      \"revision\": \"$(git rev-parse @)\"
    }" \
    metadata:="{\"build_server\": \"travis\", \"build_job\": \"$TRAVIS_JOB_NUMBER\"}"
}

echo "NOTIFIYING FRONTEND BUGSNAG BUILD..."
notify_build $BUGSNAG_FRONTEND_API_KEY

echo "NOTIFIYING BACKEND BUGSNAG BUILD..."
notify_build $BUGSNAG_BACKEND_API_KEY

for [ js_source in static/lib/axtell~*.js ]; do
  JS_SOURCES+=(-F https://axtell.vihan.org/$js_source@$js_source)
done

echo "SUBMITTING FRONTEND BUGSNAG SOURCEMAP..."
http -f POST https://upload.bugsnag.com/ \
  apiKey=$BUGSNAG_FRONTEND_API_KEY \
  appVersion=$(git rev-parse @) \
  minifiedUrl=https://axtell.vihan.org/static/lib/axtell.main.js \
  minifiedFile@static/lib/axtell.main.js \
  sourceMap@static/lib/axtell.main.map \
  "${JS_SOURCES[@]}"
