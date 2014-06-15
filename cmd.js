 var GlslTransitionValidator = require("glsl-transition-validator");
var Q = require("q");
var _ = require("lodash");
var Qimage = require("qimage");
var WebGL = require("node-webgl");

var document = WebGL.document();
var Image = WebGL.Image;

// Configure libs for this context
Qimage.Image = Image;

/////////////////////
// Parameters

var glsl = "#ifdef GL_ES\nprecision mediump float;\n#endif\n\nuniform vec2 resolution;\nuniform float progress;\nuniform sampler2D from, to;\nuniform vec2 f;\nvoid main (void) {\n  vec2 p = gl_FragCoord.xy / resolution.xy;\n  gl_FragColor = mix(texture2D(from, p), texture2D(to, p), progress);\n}\n";

var uniforms = {};

var width = 400;
var height = 300;

var fromSrc = "./from.png";
var toSrc = "./to.png";

/////////////////////

function createCanvas () {
  return document.createElement("canvas");
}

function validate (from, to) {
  var validator = new GlslTransitionValidator(from, to, createCanvas, width, height);
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

  it("is valid for from",
    _.bind(validation.isValidFrom, validation, uniforms));

  it("is valid for to",
    _.bind(validation.isValidTo, validation, uniforms));

  return { success: failed===0, passed: passed, failed: failed };
}

Q.all([
  Qimage(fromSrc),
  Qimage(toSrc)
]).spread(validate)
  .then(function (result) {
    var msg = "Result: "+result.passed+" passed. "+result.failed+" failed.";
    if (result.success)
      console.log(msg);
    else
      console.error(msg);
    process.exit(result.success ? 0 : 1);
  })
  .done();

