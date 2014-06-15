glsl-transition-validator-cli
=========================

Validate a GLSL Transition from the CLI.

Using `glsl-transition-validator`.

* Project Status: **Under Development** – it is currently based on node-webgl which needs a graphical interface and even is creating a window for each CLI...

Current status
---
There is not yet parameters but:

```bash
$ node cmd.js 
Status: Using GLEW 1.10.0
compiles: OK.
satisfy uniforms: OK.
is valid for from: OK.
is valid for to: OK.
Result: 4 passed. 0 failed.

$ echo $?
0
```

and when adding a 'f' GLSL uniform:

```bash
$ node cmd.js
Status: Using GLEW 1.10.0
compiles: OK.
satisfy uniforms: Failed.
[ { message: 'f uniform should be provided.',
    reasonId: 'UniformNotProvided',
    uniformId: 'f' } ]
is valid for from: OK.
is valid for to: OK.
Result: 3 passed. 1 failed.

$ echo $?
1
```
