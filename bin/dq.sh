#!/usr/bin/env bash

DIR=$(dirname $0)

node -r esm "$DIR/normalize" "$@"
