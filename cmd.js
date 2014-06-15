var program = require('commander');
var GlslTransitionValidator = require("glsl-transition-validator");
var Q = require("q");
var _ = require("lodash");
var Qimage = require("qimage");
var WebGL = require("node-webgl");
var fs = require("fs");

var document = WebGL.document();
var Image = WebGL.Image;

///// Configure libs for this context + some adapters

Qimage.Image = Image;

function createCanvas () {
  return document.createElement("canvas");
}

/////////////////////
// Parameters

var pkg = require("./package.json");

program
  .version(pkg.version)
  .description(pkg.description)
  .option("-g, --glsl [glsl]", "The GLSL source (a file or the source code)")
  .option("-f, --from [image]", "The from image file")
  .option("-t, --to [image]", "The to image file")
  .option("-u, --uniforms [json]", "The uniforms in json format", JSON.parse)
  .option("-w, --width [int]", "The width to use in the validation", parseInt)
  .option("-h, --height [int]", "The height to use in the validation", parseInt)
  .parse(process.argv);

if (!program.glsl) throw new Error("--glsl is required.");
if (!program.from) throw new Error("--from is required.");
if (!program.to) throw new Error("--to is required.");

var glsl = program.glsl.match(/\.glsl$/) ? Q.nfcall(fs.readFile, program.glsl, "utf8") : Q(program.glsl);
var from = Qimage(program.from);
var to = Qimage(program.to);
var uniforms = Q(program.uniforms || {}); // FIXME In the future we will have to resolve the uniform textures
var width = program.width || 40;
var height = program.height || 30;

/////////////////////
// Run the validator

Q.all([ glsl, from, to, uniforms ])
.spread(function validate (glsl, from, to, uniforms) {
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
