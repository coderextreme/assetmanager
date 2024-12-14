#   Copyright (c) 2024 by John Carlson

import raylib, raymath, rlgl

const
  screenWidth = 960
  screenHeight = 540
  vertexShader =
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
    vec3 incident = normalize((view * vec4(rose(cart2sphere(vertexPosition), a, b, c, d, tdelta, pdelta), 1.0)).xyz);

    t = reflect(incident, fragNormal)*mvm3;
    tr = refract(incident, fragNormal, chromaticDispersion.x)*mvm3;
    tg = refract(incident, fragNormal, chromaticDispersion.y)*mvm3;
    tb = refract(incident, fragNormal, chromaticDispersion.z)*mvm3;
    rfac = bias + scale * pow(0.5+0.5*dot(incident, fragNormal), power);

    fragNormal = vertexNormal;
    fragTexCoord = vertexTexCoord;
    fragColor = vertexColor;
}

"""
  fragmentShader = """
#version 330 core
#extension GL_NV_shadow_samplers_cube : enable

#define MAX_LIGHTS              4
#define LIGHT_DIRECTIONAL       0
#define LIGHT_POINT             1
#define PI 3.14159265358979323846

struct Light {
    int enabled;
    int type;
    vec3 position;
    vec3 target;
    vec4 color;
    float intensity;
};

uniform int numOfLights;
// Input lighting values
uniform Light lights[MAX_LIGHTS];
uniform vec3 viewPos;


in vec3 t;
in vec3 tr;
in vec3 tg;
in vec3 tb;
in float rfac;
uniform samplerCube cubemap;

in vec2 fragTexCoord;
in vec3 fragNormal;
in vec4 fragColor;
// uniform sampler2D texture0;
// uniform float time;
uniform vec3 lightPos;

out vec4 finalColor;

void main() {
    vec4 ref = textureCube(cubemap, t);
    vec4 ret = vec4(1.0);

    ret.r = textureCube(cubemap, tr).r;
    ret.g = textureCube(cubemap, tg).g;
    ret.b = textureCube(cubemap, tb).b;
    finalColor = ret * rfac + ref * (1.0 - rfac);
}
"""

const
  MaxLights = 4

# ----------------------------------------------------------------------------------------
# Types and Structures Definition
# ----------------------------------------------------------------------------------------

type
  LightKind = enum # Light type
    Directional, Point, Spot

  Light = object # Light data
    enabled: int32
    kind: int32
    position: Vector3
    target: Vector3
    color: array[4, float32]
    intensity: float32

    enabledLoc: ShaderLocation
    typeLoc: ShaderLocation
    positionLoc: ShaderLocation
    targetLoc: ShaderLocation
    colorLoc: ShaderLocation
    intensityLoc: ShaderLocation

# ----------------------------------------------------------------------------------------
# Global Variables Definition
# ----------------------------------------------------------------------------------------

var lightCount: int32 = 0 # Current number of dynamic lights that have been created

# ----------------------------------------------------------------------------------------
# Module specific Functions Definition
# ----------------------------------------------------------------------------------------

proc updateLight(shader: Shader; light: Light) =
  # Send light properties to shader
  # NOTE: Light shader locations should be available
  setShaderValue(shader, light.enabledLoc, light.enabled)
  setShaderValue(shader, light.typeLoc, light.kind)
  # Send to shader light position values
  var position: array[3, float32] = [
    light.position.x, light.position.y, light.position.z
  ]
  setShaderValue(shader, light.positionLoc, position)
  # Send to shader light target position values
  var target: array[3, float32] = [
    light.target.x, light.target.y, light.target.z
  ]
  setShaderValue(shader, light.targetLoc, target)
  setShaderValue(shader, light.colorLoc, light.color)
  setShaderValue(shader, light.intensityLoc, light.intensity)

proc createLight(kind: LightKind; position, target: Vector3;
    color: Color; intensity: float32; shader: Shader): Light =
  # Create light with provided data
  # NOTE: It updated the global lightCount and it's limited to MAX_LIGHTS
  result = Light(enabled: 0)
  if lightCount < MaxLights:
    result = Light(
      enabled: 1,
      kind: int32(kind),
      position: position,
      target: target,
      color: [color.r/255'f32, color.g/255'f32, color.b/255'f32, color.a/255'f32],
      intensity: intensity,
      # NOTE: Lighting shader naming must be the provided ones
      enabledLoc: getShaderLocation(shader, &"lights[{lightCount}].enabled"),
      typeLoc: getShaderLocation(shader, &"lights[{lightCount}].type"),
      positionLoc: getShaderLocation(shader, &"lights[{lightCount}].position"),
      targetLoc: getShaderLocation(shader, &"lights[{lightCount}].target"),
      colorLoc: getShaderLocation(shader, &"lights[{lightCount}].color"),
      intensityLoc: getShaderLocation(shader, &"lights[{lightCount}].intensity")
    )
    updateLight(shader, result)
    inc(lightCount)


proc initCubemap(faces: array[6, string]): TextureCubemap =
  var images: array[6, Image]
  for i in 0..5:
    images[i] = loadImage(faces[i])

  result = loadTextureCubemap(images[0], CubemapLayout.CrossThreeByFour)


proc main() =
  # Initialization
  # --------------------------------------------------------------------------------------
  initWindow(screenWidth, screenHeight, "JSONverse shaders example - rhodonea")
  defer: closeWindow()
  var mesh = genMeshSphere(4, 64, 64)
  var model = loadModelFromMesh(move(mesh))
  var shader = loadShaderFromMemory(vertexShader, fragmentShader)
  var modelImage = loadImage("resources/images/all_probes/stpeters_cross/stpeters_right.png")
  var modelTexture = loadTextureFromImage(modelImage)
  # Cubemap
  # var modelTexture = loadTexture("resources/images/all_probes/stpeters_cross.png")

  var faces = [
    "resources/images/all_probes/stpeters_cross/stpeters_right.png",
    "resources/images/all_probes/stpeters_cross/stpeters_left.png",
    "resources/images/all_probes/stpeters_cross/stpeters_top.png",
    "resources/images/all_probes/stpeters_cross/stpeters_bottom.png",
    "resources/images/all_probes/stpeters_cross/stpeters_front.png",
    "resources/images/all_probes/stpeters_cross/stpeters_back.png"
  ]
  var cubemap = initCubemap(faces)

  # Debugging output
  if model.meshCount == 0:
    echo "Failed to load model"
  if shader.id == 0:
    echo "Failed to load shader"

  model.materials[0].shader = shader
  model.materials[0].maps[MaterialMapIndex.Albedo].color = Orange
  model.materials[0].maps[MaterialMapIndex.Albedo].texture = modelTexture
  model.materials[0].maps[MaterialMapIndex.Cubemap].texture = cubemap

  var img = genImageChecked(64, 64, 32, 32, DarkBrown, DarkGray)
  var backgroundTexture = loadTextureFromImage(img)

  var camera = Camera3D(
    position : Vector3( x:0.0f, y:0.0f, z:15.0f ),
    target :   Vector3( x:0.0f, y:0.0f, z:0.0f ),
    up :       Vector3( x:0.0f, y:1.0f, z:0.0f ),
    fovy : 45.0f,
    projection : Perspective
  ) 
  # Define camera
  #var camera = Camera3D(
  #  position: Vector3(x: 0.0, y: 10.0, z: 10.0),
  #  target: Vector3(x: 0.0, y: 0.0, z: 0.0),
  #  up: Vector3(x: 0.0, y: 1.0, z: 0.0),
  #  fovy: 45.0,
  #  projection: Perspective
  #)

  var cubemapLoc = getShaderLocation(shader, "cubemap")
  var chromaticDispersionLoc = getShaderLocation(shader, "chromaticDispersion")
  var biasLoc = getShaderLocation(shader, "bias")
  var scaleLoc = getShaderLocation(shader, "scale")
  var powerLoc = getShaderLocation(shader, "power")
  var aLoc = getShaderLocation(shader, "a")
  var bLoc = getShaderLocation(shader, "b")
  var cLoc = getShaderLocation(shader, "c")
  var dLoc = getShaderLocation(shader, "d")
  var tdeltaLoc = getShaderLocation(shader, "tdelta")
  var pdeltaLoc = getShaderLocation(shader, "pdelta")
  # var timeLoc = getShaderLocation(shader, "time")
  var lightPosLoc = getShaderLocation(shader, "lightPos")
  var viewLoc = getShaderLocation(shader, "view")

  # Setup additional required shader locations, including lights data
  shader.locs[VectorView] = getShaderLocation(shader, "viewPos")
  let lightCountLoc = getShaderLocation(shader, "numOfLights")
  let maxLightCount: int32 = MaxLights
  setShaderValue(shader, lightCountLoc, maxLightCount)

  echo "cubemap ", cubemapLoc.int32
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
  # echo "time ", timeLoc.int32
  echo "lightPos ",lightPosLoc.int32
  echo "view ", viewLoc.int32

  var chromaticDispersion = Vector3(x:0.98, y:1, z:1.033)
  var bias: float32 = 0.5
  var scale: float32 = 0.5
  var power: float32 = 2.0
  var a: float32 = 20
  var b: float32 = 10
  var c: float32 = 4
  var d: float32 = 4
  var tdelta: float32 = 0
  var pdelta: float32 = 0
  # var time: float32 = 0.0
  var lightPos = Vector3(x: 10.0, y: 10.0, z: 10.0)
  var viewMatrix = getCameraMatrix(camera)

  var normalColor = Red
  var shaderColor = Vector4(
    x:normalColor.r.float32/255.0'f32,
    y:normalColor.g.float32/255.0'f32,
    z:normalColor.b.float32/255.0'f32,
    w:normalColor.a.float32/255.0'f32
    )

  var screenSize = [getScreenWidth().float32, getScreenHeight().float32]
  setShaderValue(shader, getShaderLocation(shader, "size"), screenSize)
  setShaderValueTexture(shader, cubemapLoc, cubemap)

  # Create some lights
  var lights: array[MaxLights, Light]
  lights[0] = createLight(Point, Vector3(x: -1, y: 1, z: -2), Vector3(), Yellow, 4, shader)
  lights[1] = createLight(Point, Vector3(x: 2, y: 1, z: 1), Vector3(), Green, 3.3, shader)
  lights[2] = createLight(Point, Vector3(x: -2, y: 1, z: 1), Vector3(), Red, 8.3, shader)
  lights[3] = createLight(Point, Vector3(x: 1, y: 1, z: -2), Vector3(), Blue, 2, shader)

  setTargetFPS(60) # Set our game to run at 60 frames-per-second
  var frame = 0
  while not windowShouldClose(): # Detect window close button or ESC key
    setShaderValue(shader, chromaticDispersionLoc, chromaticDispersion)
    setShaderValue(shader, biasLoc, bias.float32)
    setShaderValue(shader, scaleLoc, scale.float32)
    setShaderValue(shader, powerLoc, power.float32)
    setShaderValue(shader, aLoc, a.float32)
    setShaderValue(shader, bLoc, b.float32)
    setShaderValue(shader, cLoc, c.float32)
    setShaderValue(shader, dLoc, d.float32)
    setShaderValue(shader, tdeltaLoc, tdelta.float32)
    setShaderValue(shader, pdeltaLoc, pdelta.float32)
    # setShaderValue(shader, timeLoc, time)
    setShaderValue(shader, lightPosLoc, lightPos)
    setShaderValueMatrix(shader, viewLoc, viewMatrix)

    var rotationAngles = Vector3(x:0.0, y:0.0, z:0.0) # Rotate around Y-axis
    frame = frame + 1
    for i in 0 ..< MaxLights:
      updateLight(shader, lights[i])
    beginDrawing()
    clearBackground(White)
    drawTexture(backgroundTexture,
      Rectangle(x: 0, y: 0, width: getScreenWidth().float32, height: getScreenHeight().float32),
      Vector2.zero, White)

    beginMode3D(camera)
    updateCamera(camera, Orbital)
    beginShaderMode(shader)
    # Works, but color has no effect, since shader overrides
    #drawSphereWires(Vector3(x:0, y:0, z:0), 3.0f, 64, 64, White)
    # Works, but color has no effect, since shader overrides
    # drawSphere(Vector3(x:0, y:0, z:0), 3.0f, 64, 64, White)

    # works, but no morphing
    drawMesh(model.meshes[0], model.materials[0], rotateXYZ(rotationAngles))

    #drawModelWires(model, Vector3(x:0, y:0, z:0), 0.5f, Blue)
    drawModel(model, Vector3(x:0, y:0, z:0), 0.5f, White)

    # Draw spheres to show the lights positions
    for i in 0..<MaxLights:
      let lightColor = Color(
        r: uint8(lights[i].color[0]*255),
        g: uint8(lights[i].color[1]*255),
        b: uint8(lights[i].color[2]*255),
        a: uint8(lights[i].color[3]*255)
      )
      if lights[i].enabled == 1:
        drawSphere(lights[i].position, 0.2, 8, 8, lightColor)
      else:
        drawSphereWires(lights[i].position, 0.2, 8, 8, colorAlpha(lightColor, 0.3))
    endShaderMode()
    endMode3D()
    endDrawing()

main()
