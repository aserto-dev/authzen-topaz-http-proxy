#!/bin/bash

REGISTRY=${REGISTRY:-gcr.io}
PROJECT=${PROJECT:-authzen-457117}
IMAGE=${IMAGE:-authzen-topaz-http-proxy}
SERVICE=${SERVICE:-authzen-topaz-http-proxy}

# extract version from package.json
VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g' \
  | tr -d '[[:space:]]')

gcloud run deploy $SERVICE \
  --image $REGISTRY/$PROJECT/$IMAGE:$VERSION \
  --platform managed --allow-unauthenticated \
  --region us-central1