#!/bin/bash

set -ev

DEPLOY_URL=https://http://72.48.166.68:5000/update

if [ "${TRAVIS_BRANCH}" = "master" ]; then
    curl --data "commit=${TRAVIS_COMMIT}&key=${DEPLOY_KEY}" $DEPLOY_URL
fi