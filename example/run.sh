#!/bin/bash

cd `dirname $0`
node ../cmd.js --glsl cube.glsl -u '{"persp":0.7,"unzoom":0.3,"reflection":0.4,"floating":3}' --from from.png --to to.png --width 512 --height 512
