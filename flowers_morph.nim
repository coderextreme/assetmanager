#   Copyright (c) 2024 by John Carlson

import raylib, raymath, rlgl, random, math

const
  screenWidth = 960
  screenHeight = 540
  vertexSkyboxShader =
    """
#version 330 core
uniform mat4 mvp;

in vec3 vertexPosition;
in vec2 vertexTexCoord;
in vec3 vertexNormal;
in vec4 vertexColor;

out vec2 fragTexCoord;
out vec4 fragColor;
out vec3 fragNormal;
out vec3 fragPosition;

uniform mat4 view;

void main()
{
    gl_Position = mvp * vec4(vertexPosition, 1.0);
    fragNormal = vertexNormal;
    fragTexCoord = vertexTexCoord;
    fragColor = vertexColor;
    fragPosition = vertexPosition;
}
"""
  fragmentSkyboxShader = """
#version 330 core
#extension GL_NV_shadow_samplers_cube : enable

in vec3 fragPosition;
uniform samplerCube environmentMap;
out vec4 finalColor;

void main() {
    vec3 color = vec3(0.0);
    color = texture(environmentMap, fragPosition).rgb;
    finalColor = vec4(color, 1.0);
}
"""

  vertexModelShader =
    """
#version 330 core
uniform mat4 mvp;

in vec3 vertexPosition;
in vec2 vertexTexCoord;
in vec3 vertexNormal;
in vec4 vertexColor;

out vec2 fragTexCoord;
out vec4 fragColor;
out vec3 fragNormal;

uniform mat4 view;
uniform vec3 chromaticDispersion;
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
out vec3 fragPosition;

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
    gl_Position = mvp * vec4(rose(cart2sphere(vertexPosition), a, b, c, d, tdelta, pdelta), 1.0);

    fragNormal = mvm3*rose_normal(vertexPosition, a, b, c, d, tdelta, pdelta);
    fragTexCoord = vertexTexCoord;
    fragColor = vertexColor;
    fragPosition = vertexPosition;

    vec3 incident = normalize((view * vec4(rose(cart2sphere(vertexPosition), a, b, c, d, tdelta, pdelta), 1.0)).xyz);

    t = reflect(incident, fragNormal)*mvm3;
    tr = refract(incident, fragNormal, chromaticDispersion.x)*mvm3;
    tg = refract(incident, fragNormal, chromaticDispersion.y)*mvm3;
    tb = refract(incident, fragNormal, chromaticDispersion.z)*mvm3;
    rfac = bias + scale * pow(0.5+0.5*dot(incident, fragNormal), power);
}

"""
  fragmentModelShader = """
#version 330 core
#extension GL_NV_shadow_samplers_cube : enable

uniform samplerCube environmentMap;
in vec3 fragPosition;
in vec3 t;
in vec3 tr;
in vec3 tg;
in vec3 tb;
in float rfac;

out vec4 finalColor;

void main() {

    vec4 ref = textureCube(environmentMap, t);
    vec4 ret = vec4(1.0);

    ret.r = textureCube(environmentMap, tr).r;
    ret.g = textureCube(environmentMap, tg).g;
    ret.b = textureCube(environmentMap, tb).b;
    finalColor = ret * rfac + ref * (1.0 - rfac);
}
"""

#proc initCubemap(faces: array[6, string]): TextureCubemap =
#  var images: array[6, Image]
#  for i in 0..5:
#    images[i] = loadImage(faces[i])
#
#  result = loadTextureCubemap(images[0], CubemapLayout.CrossThreeByFour)


proc main() =
  # Initialization
  # --------------------------------------------------------------------------------------
  initWindow(screenWidth, screenHeight, "JSONverse shaders example - rhodonea")
  defer: closeWindow()
  var cube = genMeshCube(1.0f, 1.0f, 1.0f)
  var skybox = loadModelFromMesh(cube)

  var sphere = genMeshSphere(4, 64, 64)
  var model = loadModelFromMesh(sphere)

  var modelShader = loadShaderFromMemory(vertexModelShader, fragmentModelShader)
  var skyboxShader = loadShaderFromMemory(vertexSkyboxShader, fragmentSkyboxShader)

  model.materials[0].shader = modelShader
  skybox.materials[0].shader = skyboxShader

  var image = loadImage("resources/images/all_probes/stpeters_cross.png")  # Replace with your texture path
  var cubemap = loadTextureCubemap(image, CubemapLayout.AutoDetect);

  # Debugging output
  if model.meshCount == 0:
    echo "Failed to load model"
  if modelShader.id == 0:
    echo "Failed to load modelShader"
  if skyboxShader.id == 0:
    echo "Failed to load skyboxShader"

  model.materials[0].maps[MaterialMapIndex.Cubemap].texture = cubemap
  skybox.materials[0].maps[MaterialMapIndex.Cubemap].texture = cubemap

  var img = genImageChecked(64, 64, 32, 32, DarkBrown, DarkGray)
  var backgroundTexture = loadTextureFromImage(img)

  # Define camera
  var camera = Camera3D(
    position: Vector3(x: 1.0f, y: 1.0f, z: 1.0f),
    target: Vector3(x: 0.0f, y: 0.0f, z: 0.0f),
    up: Vector3(x: 0.0f, y: 1.0f, z: 0.0f),
    fovy: 45.0f,
    projection: Perspective
  )

  var cubemapSkyboxLoc = getShaderLocation(skyboxShader, "environmentMap")
  var cubemapModelLoc = getShaderLocation(modelShader, "environmentMap")
  var chromaticDispersionLoc = getShaderLocation(modelShader, "chromaticDispersion")
  var biasLoc = getShaderLocation(modelShader, "bias")
  var scaleLoc = getShaderLocation(modelShader, "scale")
  var powerLoc = getShaderLocation(modelShader, "power")
  var aLoc = getShaderLocation(modelShader, "a")
  var bLoc = getShaderLocation(modelShader, "b")
  var cLoc = getShaderLocation(modelShader, "c")
  var dLoc = getShaderLocation(modelShader, "d")
  var tdeltaLoc = getShaderLocation(modelShader, "tdelta")
  var pdeltaLoc = getShaderLocation(modelShader, "pdelta")
  var viewLoc = getShaderLocation(modelShader, "view")

  echo "environmentMap ", cubemapSkyboxLoc.int32
  echo "environmentMap ", cubemapModelLoc.int32
  echo "chromaticDispersion ", chromaticDispersionLoc.int32
  echo "bias ", biasLoc.int32
  echo "scale ", scaleLoc.int32
  echo "power ", powerLoc.int32
  echo "a ", aLoc.int32
  echo "b ", bLoc.int32
  echo "c ", cLoc.int32
  echo "d ", dLoc.int32
  echo "tdelta ", tdeltaLoc.int32
  echo "pdelta ", pdeltaLoc.int32
  echo "view ", viewLoc.int32

  var chromaticDispersion = Vector3(x:0.98, y:1, z:1.033)
  var bias: float32 = 0.5
  var scale: float32 = 0.5
  var power: float32 = 2.0
  var a: float32 = 20
  var b: float32 = 10
  var c: float32 = 4
  var d: float32 = 4
  var tdelta: float32 = 0.1
  var pdelta: float32 = 0.1
  var viewMatrix = getCameraMatrix(camera)

  var screenSize = [getScreenWidth().float32, getScreenHeight().float32]
  var mapIndex: int32 = MaterialMapIndex.Cubemap.int32

  setShaderValue(modelShader, getShaderLocation(modelShader, "size"), screenSize)
  setShaderValue(skyboxShader, getShaderLocation(skyboxShader, "size"), screenSize)
  setShaderValue(skyboxShader, cubemapSkyboxLoc, mapIndex)
  setShaderValue(modelShader, cubemapModelLoc, mapIndex)

  setTargetFPS(10) # Set our game to run at 60 frames-per-second
  var frame = 0
  while not windowShouldClose(): # Detect window close button or ESC key
    # setShaderValueTexture(modelShader, cubemapLoc, cubemap)
    setShaderValue(modelShader, chromaticDispersionLoc, chromaticDispersion)
    setShaderValue(modelShader, biasLoc, bias.float32)
    setShaderValue(modelShader, scaleLoc, scale.float32)
    setShaderValue(modelShader, powerLoc, power.float32)
    setShaderValue(modelShader, aLoc, a.float32)
    setShaderValue(modelShader, bLoc, b.float32)
    setShaderValue(modelShader, cLoc, c.float32)
    setShaderValue(modelShader, dLoc, d.float32)
    setShaderValue(modelShader, tdeltaLoc, tdelta.float32)
    setShaderValue(modelShader, pdeltaLoc, pdelta.float32)
    setShaderValueMatrix(modelShader, viewLoc, viewMatrix)

    var rotationAngles = Vector3(x:0.0, y:0.0, z:0.0) # Rotate around Y-axis
    frame = frame + 1
    beginDrawing()
    clearBackground(White)
    drawTexture(backgroundTexture,
      Rectangle(x: 0, y: 0, width: getScreenWidth().float32, height: getScreenHeight().float32),
      Vector2.zero, White)
    beginMode3D(camera)
    updateCamera(camera, Orbital)

    disableBackfaceCulling()

    beginShaderMode(modelShader)
    drawModel(model, Vector3(x:0, y:0, z:0), 0.04f, White)
    endShaderMode()

    beginShaderMode(skyboxShader)
    drawModel(skybox, Vector3(x: 0, y: 0, z: 0), 10.0f, White)
    endShaderMode()

    enableBackfaceCulling()
    endMode3D()
    a += rand(1.0) - 0.5f
    if a > 5:
      a = 5
    if a < -5:
      a = -5
    b += rand(1.0) - 0.5f
    if b > 5:
      b = 5
    if b < -5:
      b = -5
    c += trunc((rand(10) - 5).float32)
    if c > 5:
      c = 5
    if c < -5:
      c = -5
    d += trunc((rand(10) - 5).float32)
    if d > 5:
      d = 5
    if d < -5:
      d = -5

    drawFPS(0,0)
    endDrawing()

main()
