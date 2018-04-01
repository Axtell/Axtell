#!/usr/bin/env bash
REMOTE_HOST='travis-deploy@198.211.104.43'

# Travis should verify we're on the correct branch but just in case
if [ "$TRAVIS_PULL_REQUEST" != "false" -o "$TRAVIS_BRANCH" != "master" ]; then
    echo "Not a deploy environment. Exiting..."
    exit 0
fi

# Run update script
ssh "$REMOTE_HOST" 'bash -s' < deploy/update.bash

rsync -vzP static/lib/main.js "$REMOTE_HOST:/var/www/ppcg-v2/static/lib/main.js"
rsync -avzP static/css/ "$REMOTE_HOST:/var/www/ppcg-v2/static/css"
