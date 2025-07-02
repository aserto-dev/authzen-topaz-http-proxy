# authzen-topaz-http-proxy

Implementation of the AuthZEN evaluations API for Topaz.

This repo contains code that translates the AuthZEN evaluation and evaluation API calls into a Topaz `is` call, over the REST binding as opposed to the gRPC binding.

The latter can be found at https://github.com/aserto-dev/authzen-topaz-proxy.

## Install dependencies

yarn install

## Build

yarn build-all

## Run in local developer mode

yarn dev

## Run in production mode

yarn prod

## Build and run a local docker image

yarn docker-build

yarn docker-run

## Build and deploy on GCP / Google Cloud Run

yarn gcp-build

yarn gcp-deploy

## Release a new version

yarn release

