glsl-transition-validator-cli
=========================

Validate a GLSL Transition from the CLI. Using `glsl-transition-validator`.

Example
----

```bash
$ glsl-transition-validator --glsl cube.glsl -u '{"persp":0.7,"unzoom":0.3,"reflection":0.4,"floating":3}' --from from.png --to to.png --width 512 --height 512
Status: Using GLEW 1.10.0
compiles: OK.
satisfy uniforms: OK.
is valid for from: OK.
is valid for to: OK.
Result: 4 passed. 0 failed.

$ echo $?
0
```

and when removing the 'persp' GLSL uniform:

```bash
$ glsl-transition-validator --glsl cube.glsl -u '{"unzoom":0.3,"reflection":0.4,"floating":3}' --from from.png --to to.png --width 512 --height 512
Status: Using GLEW 1.10.0
compiles: OK.
satisfy uniforms: Failed.
[ { message: 'persp uniform should be provided.',
    reasonId: 'UniformNotProvided',
    uniformId: 'persp' } ]
is valid for from: OK.
is valid for to: OK.
Result: 3 passed. 1 failed.

$ echo $?
1
```


Current status
---

* Project Status: **Under Development** – it is currently based on node-webgl which needs a graphical interface and even is creating a window for each CLI...
