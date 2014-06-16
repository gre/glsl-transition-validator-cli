#!/bin/bash

cd `dirname $0`
node ../cmd.js --glsl luma.glsl -u '{"luma":"radial-tri-lateral-4.png"}' --from from.png --to to.png --width 512 --height 512
