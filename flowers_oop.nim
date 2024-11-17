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

type Flower = ref object
  cubemap: TextureCubemap
  chromaticDispersion: Vector3
  bias: float32
  scale: float32
  power: float32
  a: float32
  b: float32
  c: float32
  d: float32
  tdelta: float32
  pdelta: float32
  cubemapModelLoc: ShaderLocation
  chromaticDispersionLoc: ShaderLocation
  biasLoc: ShaderLocation
  scaleLoc: ShaderLocation
  powerLoc: ShaderLocation
  aLoc: ShaderLocation
  bLoc: ShaderLocation
  cLoc: ShaderLocation
  dLoc: ShaderLocation
  tdeltaLoc: ShaderLocation
  pdeltaLoc: ShaderLocation
  viewLoc: ShaderLocation
  model: Model
  modelShader: Shader
  translation: Vector3
  velocity: Vector3

proc initialize(self: var Flower) =
  self.translation = Vector3(x:0, y:0, z:0)
  self.velocity = Vector3( x:rand(1.0) - 0.5, y:rand(1.0) - 0.5, z:rand(1.0) - 0.5)

proc build(self: var Flower) =
  var sphere = genMeshSphere(4, 64, 64)
  self.model = loadModelFromMesh(sphere)
  self.modelShader = loadShaderFromMemory(vertexModelShader, fragmentModelShader)
  self.model.materials[0].shader = self.modelShader

  var image = loadImage("resources/images/all_probes/stpeters_cross.png")  # Replace with your texture path
  self.cubemap = loadTextureCubemap(image, CubemapLayout.AutoDetect);

  # Debugging output
  if self.model.meshCount == 0:
    echo "Failed to load model"
  if self.modelShader.id == 0:
    echo "Failed to load modelShader"

  self.model.materials[0].maps[MaterialMapIndex.Cubemap].texture = self.cubemap

  self.cubemapModelLoc = getShaderLocation(self.modelShader, "environmentMap")
  self.chromaticDispersionLoc = getShaderLocation(self.modelShader, "chromaticDispersion")
  self.biasLoc = getShaderLocation(self.modelShader, "bias")
  self.scaleLoc = getShaderLocation(self.modelShader, "scale")
  self.powerLoc = getShaderLocation(self.modelShader, "power")
  self.aLoc = getShaderLocation(self.modelShader, "a")
  self.bLoc = getShaderLocation(self.modelShader, "b")
  self.cLoc = getShaderLocation(self.modelShader, "c")
  self.dLoc = getShaderLocation(self.modelShader, "d")
  self.tdeltaLoc = getShaderLocation(self.modelShader, "tdelta")
  self.pdeltaLoc = getShaderLocation(self.modelShader, "pdelta")
  self.viewLoc = getShaderLocation(self.modelShader, "view")

  echo "environmentMap ", self.cubemapModelLoc.int32
  echo "chromaticDispersion ", self.chromaticDispersionLoc.int32
  echo "bias ", self.biasLoc.int32
  echo "scale ", self.scaleLoc.int32
  echo "power ", self.powerLoc.int32
  echo "a ", self.aLoc.int32
  echo "b ", self.bLoc.int32
  echo "c ", self.cLoc.int32
  echo "d ", self.dLoc.int32
  echo "tdelta ", self.tdeltaLoc.int32
  echo "pdelta ", self.pdeltaLoc.int32
  echo "view ", self.viewLoc.int32

  self.chromaticDispersion = Vector3(x:0.98, y:1, z:1.033)
  self.bias = 0.5
  self.scale = 0.5
  self.power = 2.0
  self.a = 20
  self.b = 10
  self.c = 4
  self.d = 4
  self.tdelta = 0.1
  self.pdelta = 0.1
  var mapIndex = MaterialMapIndex.Cubemap.int32

  var screenSize = [getScreenWidth().float32, getScreenHeight().float32]

  setShaderValue(self.modelShader, getShaderLocation(self.modelShader, "size"), screenSize)
  setShaderValue(self.modelShader, self.cubemapModelLoc, mapIndex)

  initialize(self)

proc animate(self: var Flower, camera: var Camera3D) =
  
  var viewMatrix = getCameraMatrix(camera)

  setShaderValue(self.modelShader, self.chromaticDispersionLoc, self.chromaticDispersion)
  setShaderValue(self.modelShader, self.biasLoc, self.bias.float32)
  setShaderValue(self.modelShader, self.scaleLoc, self.scale.float32)
  setShaderValue(self.modelShader, self.powerLoc, self.power.float32)
  setShaderValue(self.modelShader, self.aLoc, self.a.float32)
  setShaderValue(self.modelShader, self.bLoc, self.b.float32)
  setShaderValue(self.modelShader, self.cLoc, self.c.float32)
  setShaderValue(self.modelShader, self.dLoc, self.d.float32)
  setShaderValue(self.modelShader, self.tdeltaLoc, self.tdelta.float32)
  setShaderValue(self.modelShader, self.pdeltaLoc, self.pdelta.float32)
  setShaderValueMatrix(self.modelShader, self.viewLoc, viewMatrix)

  beginShaderMode(self.modelShader)
  drawModel(self.model, self.translation, 0.04f, White)
  endShaderMode()

  self.a += rand(1.0) - 0.5f
  if self.a > 5:
    self.a = 5
  if self.a < -5:
    self.a = -5
  self.b += rand(1.0) - 0.5f
  if self.b > 5:
    self.b = 5
  if self.b < -5:
    self.b = -5
  self.c += trunc((rand(10) - 5).float32)
  if self.c > 5:
    self.c = 5
  if self.c < -5:
    self.c = -5
  self.d += trunc((rand(10) - 5).float32)
  if self.d > 5:
    self.d = 5
  if self.d < -5:
    self.d = -5

  self.translation = Vector3(
    x:self.translation.x + self.velocity.x,
    y:self.translation.y + self.velocity.y,
    z:self.translation.z + self.velocity.z)

  iterator countTo(n: int): int =
    var i = 0
    while i <= n:
      yield i
      inc i

  for j in countTo(2):
    if system.abs(self.translation.x) > 10:
      initialize(self);
    elif system.abs(self.translation.y) > 10:
      initialize(self);
    elif system.abs(self.translation.z) > 10:
      initialize(self);
    else:
      self.velocity.x += rand(1.0) * 0.2 - 0.1;
      self.velocity.y += rand(1.0) * 0.2 - 0.1;
      self.velocity.z += rand(1.0) * 0.2 - 0.1;

proc main() =
  # Initialization
  # --------------------------------------------------------------------------------------
  initWindow(screenWidth, screenHeight, "JSONverse shaders example - rhodonea")
  defer: closeWindow()

  var cube = genMeshCube(4.0f, 4.0f, 4.0f)
  var skybox = loadModelFromMesh(cube)
  var skyboxShader = loadShaderFromMemory(vertexSkyboxShader, fragmentSkyboxShader)
  skybox.materials[0].shader = skyboxShader

  var image = loadImage("resources/images/all_probes/stpeters_cross.png")  # Replace with your texture path
  imageFlipHorizontal(image)
  var cubemap = loadTextureCubemap(image, CubemapLayout.AutoDetect);

  # Debugging output
  if skyboxShader.id == 0:
    echo "Failed to load skyboxShader"

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

  var flowers: seq[Flower]

  let FLOWERS = 7

  for f in 0..FLOWERS:
    flowers.add(Flower())

  for f in 0..FLOWERS:
    build(flowers[f])

  var cubemapSkyboxLoc = getShaderLocation(skyboxShader, "environmentMap")
  echo "environmentMap ", cubemapSkyboxLoc.int32

  var screenSize = [getScreenWidth().float32, getScreenHeight().float32]
  var mapIndex: int32 = MaterialMapIndex.Cubemap.int32

  setShaderValue(skyboxShader, getShaderLocation(skyboxShader, "size"), screenSize)
  setShaderValue(skyboxShader, cubemapSkyboxLoc, mapIndex)

  setTargetFPS(6) # Throttle to 6 FPS
  while not windowShouldClose(): # Detect window close button or ESC key

    beginDrawing()
    clearBackground(White)
    drawTexture(backgroundTexture,
      Rectangle(x: 0, y: 0, width: getScreenWidth().float32, height: getScreenHeight().float32),
      Vector2.zero, White)
    beginMode3D(camera)
    updateCamera(camera, Orbital)

    disableBackfaceCulling()

    for f in 0..FLOWERS:
      animate(flowers[f], camera)

    beginShaderMode(skyboxShader)
    drawModel(skybox, Vector3(x: 0, y: 0, z: 0), 10.0f, White)
    endShaderMode()

    enableBackfaceCulling()
    endMode3D()

    drawFPS(0,0)
    endDrawing()

main()
