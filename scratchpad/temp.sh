#!/usr/bin/env bash

node -r esm ../bin/normalize \
    -n temp.norm \
    -r affine.js \
    -t Ellipse \
    ellipse.json
