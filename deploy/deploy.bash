#!/usr/bin/env bash
# Travis should verify we're on the correct branch but just in case
if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "master" ]; then
    echo "Not a deploy environment. Exiting..."
    exit 0
fi

echo "DEPLOY: JS SHASHUMS"
shasum "$TRAVIS_BUILD_DIR/static/lib/"*.js

notify_build () {
  http POST https://build.bugsnag.com/ \
    apiKey=$1 \
    appVersion=$(git rev-parse @) \
    releaseStage=production \
    builderName="$(git show -s --format='%an')" \
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

for js_source in static/lib/axtell~*.js; do
  JS_SOURCES+=(https://axtell.vihan.org/$js_source@$js_source)
done

echo "SUBMITTING FRONTEND BUGSNAG SOURCEMAP..."
http -f POST https://upload.bugsnag.com/ \
  apiKey=$BUGSNAG_FRONTEND_API_KEY \
  appVersion=$(git rev-parse @) \
  minifiedUrl=https://axtell.vihan.org/static/lib/axtell.main.js \
  minifiedFile@static/lib/axtell.main.js \
  sourceMap@static/lib/axtell.main.js.map \
  "${JS_SOURCES[@]}"
