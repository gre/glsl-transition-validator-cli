#!/usr/bin/env node

var program = require('commander');
var GlslTransitionValidator = require("glsl-transition-validator");
var GlslioTextureResolver = require("glslio-texture-resolver");
var Q = require("q");
var _ = require("lodash");
var WebGL = require("node-webgl");
var fs = require("fs");

///// Configure libs for this context + some adapters
var document = WebGL.document();
var Qimage = require("node-webgl-qimage")(WebGL.Image);
var uniformsResolver = new GlslioTextureResolver(Qimage);
GlslTransitionValidator.createCanvas = function () {
  return document.createElement("canvas");
};

/////////////////////
// Parameters

var pkg = require("./package.json");

program
  .version(pkg.version)
  .description(pkg.description)
  .option("-g, --glsl <glsl>", "The GLSL source (a file or the source code)", function (glsl) {
    return glsl.match(/\.glsl$/) ? Q.nfcall(fs.readFile, glsl, "utf8") : Q(glsl);
  })
  .option("-u, --uniforms [json]", "The uniforms in json format", _.compose(_.bind(uniformsResolver.resolve, uniformsResolver), JSON.parse), Q({}))
  .option("-f, --from [image]", "The from image file", Qimage, Q(null))
  .option("-t, --to [image]", "The to image file", Qimage, Q(null))
  .option("-w, --width [int]", "The width to use in the validation", function (s) { return parseInt(s, 10); }, 40)
  .option("-h, --height [int]", "The height to use in the validation", function (s) { return parseInt(s, 10); }, 30)
  .parse(process.argv);

/////////////////////
// Run the validator

// TODO: instead of console.logging, we should log a JSON result.

Q.all([ program.glsl, program.from, program.to, program.uniforms ])
.spread(function validate (glsl, from, to, uniforms) {
  var validator = new GlslTransitionValidator(from, to, program.width, program.height);
  var validation = validator.forGlsl(glsl);

  var passed = 0;
  var failed = 0;

  function it (message, fn, moreReasonIfError) {
    try {
      var value = fn();
      if (value) {
        ++ passed;
        console.log(message+": OK.");
      }
      else {
        ++ failed;
        console.error(message+": Failed.");
        if (moreReasonIfError)
          console.error(moreReasonIfError());
      }
    }
    catch (e) {
      console.error(message+": Got Exception");
      console.error(e && e.stack || e);
      ++ failed;
    }
  }

  it("compiles",
    validation.compiles,
    validation.compile);
 
  it("satisfy uniforms",
    _.bind(validation.satisfyUniforms, validation, uniforms),
    _.bind(validation.validateUniforms, validation, uniforms));

  from && it("is valid for from",
        _.bind(validation.isValidFrom, validation, uniforms));

  to && it("is valid for to",
    _.bind(validation.isValidTo, validation, uniforms));

  return { success: failed===0, passed: passed, failed: failed };
})
.then(function (result) {
  var msg = "Result: "+result.passed+" passed. "+result.failed+" failed.";
  if (result.success)
    console.log(msg);
  else
    console.error(msg);
  process.exit(result.success ? 0 : 1);
})
.done();
