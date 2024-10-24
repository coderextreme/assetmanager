#   Copyright (c) 2024 by John Carlson

import raylib, raymath, rlgl

type CubemapShader = object
  shader: Shader
  cubemapLoc: ShaderLocation
  textureLoc: ShaderLocation
  viewPosLoc: ShaderLocation
  reflectStrengthLoc: ShaderLocation

const
  screenWidth = 800
  screenHeight = 450
  vertexShader =
    """
#version 330 core
in mat4 model;
in mat4 view;
in mat4 projection;
in vec4 position;

uniform vec3 chromaticDispertion;
uniform float bias;
uniform float scale;
uniform float power;
uniform float a;
uniform float b;
uniform float c;
uniform float d;
uniform float tdelta;
uniform float pdelta;

out vec3 t;
out vec3 tr;
out vec3 tg;
out vec3 tb;
out float rfac;

vec3 cart2sphere(vec3 p) {
     float r = pow(p.x*p.x + p.y*p.y + p.z*p.z, 0.5);
     float theta = acos(p.z/r);
     float phi = atan(p.y, p.x);
     return vec3(r, theta, phi);
}
     
vec3 rose(vec3 p, float a, float b, float c, float d, float tdelta, float pdelta) {
     float rho = a + b * cos(c * p.y + tdelta) * cos(d * p.z + pdelta);
     float x = rho * cos(p.z) * cos(p.y);
     float y = rho * cos(p.z) * sin(p.y);
     float z = rho * sin(p.z);
     return vec3(x, y, z);
}

vec3 rose_normal(vec3 p, float a, float b, float c, float d, float tdelta, float pdelta) {
     /* convert cartesian position to spherical coordinates */
     vec3 base = cart2sphere(p);
     /* add a little to phi */
     vec3 td = base + vec3(0.0, 0.01, 0.0);
     /* add a little to theta */
     vec3 pd = base + vec3(0.0, 0.0, 0.01);

     /* convert back to cartesian coordinates */
     vec3 br = rose(base, a, b, c, d, tdelta, pdelta);
     vec3 bt = rose(td, a, b, c, d, tdelta, pdelta);
     vec3 bp = rose(pd, a, b, c, d, tdelta, pdelta);

     return normalize(cross(bt - br, bp - br));
}

void main()
{
    /*
    t = vec3(a, b, c);
    tr = vec3(b, c, d);
    tb = vec3(c, d, tdelta);
    tb = vec3(d, tdelta, pdelta);
    rfac = 0.5;
    */
    mat3 mvm3=mat3(
                view[0].x,
                view[0].y,
                view[0].z,
                view[1].x,
                view[1].y,
                view[1].z,
                view[2].x,
                view[2].y,
                view[2].z
    );
    gl_Position = projection * view * model * vec4(rose(cart2sphere(position.xyz), a, b, c, d, tdelta, pdelta), 1.0);
    vec3 fragNormal = mvm3*rose_normal(position.xyz, a, b, c, d, tdelta, pdelta);

    vec3 incident = normalize((view * vec4(rose(cart2sphere(position.xyz), a, b, c, d, tdelta, pdelta), 1.0)).xyz);

    t = reflect(incident, fragNormal)*mvm3;
    tr = refract(incident, fragNormal, chromaticDispertion.x)*mvm3;
    tg = refract(incident, fragNormal, chromaticDispertion.y)*mvm3;
    tb = refract(incident, fragNormal, chromaticDispertion.z)*mvm3;

    rfac = bias + scale * pow(0.5+0.5*dot(incident, fragNormal), power);
}

"""
  fragmentShader = """
#version 330 core
#extension GL_NV_shadow_samplers_cube : enable
uniform samplerCube cubemap;

in vec3 t;
in vec3 tr;
in vec3 tg;
in vec3 tb;
in float rfac;
// in vec2 texCoord;
out vec4 fragColor;

void main()
{
    vec4 ref = textureCube(cubemap, t);
    vec4 ret = vec4(1.0, 1.0, 1.0, 1.0);

    ret.r = textureCube(cubemap, tr).r;
    ret.g = textureCube(cubemap, tg).g;
    ret.b = textureCube(cubemap, tb).b;

    fragColor = ret * rfac + ref * (1.0 - rfac);
}
"""

proc initCubemap(faces: array[6, string]): TextureCubemap =
  var images: array[6, Image]
  for i in 0..5:
    images[i] = loadImage(faces[i])

  result = loadTextureCubemap(images[0], CubemapLayout.CrossThreeByFour)

proc setupCubemapShader(): CubemapShader =
  result.shader = loadShaderFromMemory(vertexShader, fragmentShader)
  
  # Get shader locations for all uniforms
  result.cubemapLoc = getShaderLocation(result.shader, "cubemap")
  result.textureLoc = getShaderLocation(result.shader, "textureSampler")
  result.viewPosLoc = getShaderLocation(result.shader, "viewPos")
  result.reflectStrengthLoc = getShaderLocation(result.shader, "reflectStrength")

proc main() =
  # Initialization
  # --------------------------------------------------------------------------------------
  initWindow(screenWidth, screenHeight, "JSONverse shaders example - rhodonea")
  defer: closeWindow()
  var mesh = genMeshCube(18.0f, 18.0f, 18.0f)
  #var mesh = genMeshSphere(4, 64, 64)
  var model = loadModelFromMesh(move(mesh))
  # var shader = loadShaderFromMemory(vertexShader, fragmentShader)
  var hdrImage = loadImage("resources/images/all_probes/stpeters_cross.png")
  var hdrTexture = loadTextureCubemap(hdrImage, CubemapLayout.CrossThreeByFour)
  #let hdrTexture = loadTextureCubemap(hdrImage, CubemapLayout.Panorama)
  #let hdrTexture = loadTextureCubemap(hdrImage, CubemapLayout.AutoDetect)
  let faces = [
    "resources/images/all_probes/stpeters_cross/stpeters_right.png",
    "resources/images/all_probes/stpeters_cross/stpeters_left.png",
    "resources/images/all_probes/stpeters_cross/stpeters_top.png",
    "resources/images/all_probes/stpeters_cross/stpeters_bottom.png",
    "resources/images/all_probes/stpeters_cross/stpeters_front.png",
    "resources/images/all_probes/stpeters_cross/stpeters_back.png"
  ]
  var cubemap = initCubemap(faces)
  var cubemapShader = setupCubemapShader()
  var shader = cubemapShader.shader
  

  # Debugging output
  if model.meshCount == 0:
    echo "Failed to load model"
  if shader.id == 0:
    echo "Failed to load shader"

  # THIS FOULS STUFF UP.  DON'T DO IT!
  # model.materials[0].shader = shader
  model.materials[0].maps[MaterialMapIndex.Cubemap].texture = hdrTexture

  let img = genImageChecked(64, 64, 32, 32, DarkBrown, DarkGray)
  let backgroundTexture = loadTextureFromImage(img)

  var camera = Camera(
    position : Vector3( x:0.0f, y:0.0f, z:10.0f ),
    target :   Vector3( x:0.0f, y:0.0f, z:0.0f ),
    up :       Vector3( x:0.0f, y:1.0f, z:0.0f ),
    fovy : 45.0f,
    projection : Perspective
  )

  let chromaticDispertionLoc = getShaderLocation(shader, "chromaticDispertion")

  let biasLoc = getShaderLocation(shader, "bias")
  let scaleLoc = getShaderLocation(shader, "scale")
  let powerLoc = getShaderLocation(shader, "power")
  let aLoc = getShaderLocation(shader, "a")
  let bLoc = getShaderLocation(shader, "b")
  let cLoc = getShaderLocation(shader, "c")
  let dLoc = getShaderLocation(shader, "d")
  let tdeltaLoc = getShaderLocation(shader, "tdelta")
  let pdeltaLoc = getShaderLocation(shader, "pdelta")
  # let texCoordLoc = getShaderLocation(shader, "t")

  echo chromaticDispertionLoc.int32
  echo biasLoc.int32
  echo scaleLoc.int32
  echo powerLoc.int32
  echo aLoc.int32
  echo bLoc.int32
  echo cLoc.int32
  echo dLoc.int32
  echo tdeltaLoc.int32
  echo pdeltaLoc.int32
  # echo texCoordLoc.int32

  let chromaticDispertion = Vector3(x:0.98, y:1, z:1.033)
  let bias: float32 = 0.5
  let scale: float32 = 0.5
  let power: float32 = 2.0
  let a: float32 = 20
  let b: float32 = 10
  let c: float32 = 4
  let d: float32 = 4
  let tdelta: float32 = 0
  let pdelta: float32 = 0

  let screenSize = [getScreenWidth().float32, getScreenHeight().float32]
  setShaderValue(shader, getShaderLocation(shader, "size"), screenSize)
  setShaderValue(shader, chromaticDispertionLoc, chromaticDispertion)
  setShaderValue(shader, biasLoc, bias.float32)
  setShaderValue(shader, scaleLoc, scale.float32)
  setShaderValue(shader, powerLoc, power.float32)
  setShaderValue(shader, aLoc, a.float32)
  setShaderValue(shader, bLoc, b.float32)
  setShaderValue(shader, cLoc, c.float32)
  setShaderValue(shader, dLoc, d.float32)
  setShaderValue(shader, tdeltaLoc, tdelta.float32)
  setShaderValue(shader, pdeltaLoc, pdelta.float32)
  # setShaderValueTexture(shader, cubemapShader.texCoordLoc, hdrTexture)
  setShaderValueTexture(shader, cubemapShader.cubemapLoc, cubemap)

  setTargetFPS(60) # Set our game to run at 60 frames-per-second
  var frame = 0
  while not windowShouldClose(): # Detect window close button or ESC key
    let rotationAngles = Vector3(x:0.0, y:frame.float32, z:0.0) # Rotate around Y-axis
    frame = frame + 1
    beginDrawing()
    clearBackground(Black)
    drawTexture(backgroundTexture,
      Rectangle(x: 0, y: 0, width: getScreenWidth().float32, height: getScreenHeight().float32),
      Vector2.zero, White)

    beginMode3D(camera)
    updateCamera(camera, Orbital)
    beginShaderMode(shader)
    #drawSphereWires(Vector3(x:0, y:0, z:0), 3.0f, 64, 64, Red)
    drawModelWires(model, Vector3(x:0, y:0, z:0), 0.5f, Blue) 
    #drawMesh(mesh, model.materials[0], rotateXYZ(rotationAngles))
    endShaderMode()
    endMode3D()
    endDrawing()

main()
