#   Copyright (c) 2024 by John Carlson

import raylib, raymath, rlgl, random

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
uniform float time;

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
    // fragNormal = vertexNormal;
    fragTexCoord = vertexTexCoord;
    fragColor = vertexColor;

    /*
    // Add some vertex animation based on time
    vec3 position = vertexPosition;
    position.y += sin(time * 2.0 + position.x) * 0.5;
    
    fragTexCoord = vertexTexCoord;
    fragNormal = vertexNormal;
    gl_Position = mvp * vec4(position, 1.0);
    */
}

"""
  fragmentShader = """
#version 330 core
#extension GL_NV_shadow_samplers_cube : enable

in vec3 t;
in vec3 tr;
in vec3 tg;
in vec3 tb;
in float rfac;
uniform samplerCube cubemap;

in vec2 fragTexCoord;
in vec3 fragNormal;
in vec4 fragColor;
uniform sampler2D texture0;
uniform float time;
uniform vec3 lightPos;

out vec4 finalColor;

void main() {
    vec4 texelColor = texture(texture0, fragTexCoord);
    vec3 light = normalize(lightPos);
    vec3 normal = normalize(fragNormal);
    float diff = max(dot(normal, light), 0.0);

    vec4 ref = textureCube(cubemap, t);
    vec4 ret = vec4(1.0);

    ret.r = textureCube(cubemap, tr).r;
    ret.g = textureCube(cubemap, tg).g;
    ret.b = textureCube(cubemap, tb).b;
    vec4 rrColor = ret * rfac + ref * (1.0 - rfac);
    finalColor = vec4(rrColor * (diff * 0.8 + 0.2));
    /*
    */
    /*
    finalColor = vec4(1.0, 0.0, 0.0, 1.0);
    */
    /*
        vec4 texelColor = texture(texture0, fragTexCoord);
	vec3 normal = normalize(fragNormal);
	vec3 light = normalize(lightPos);

	// Basic lighting 
	float diff = max(dot(normal, light), 0.0);

	// Add time-based color shifting
	vec3 color = texelColor.rgb;
	color.r *= abs(sin(time));
	color.g *= abs(cos(time * 0.5));
	finalColor = vec4(color * (diff * 0.8 + 0.2), texelColor.a);
    */
}
"""

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
  var cubeMesh = genMeshCube(60.0f, 60.0f, 60.0f)
  var cubeModel = loadModelFromMesh(move(cubeMesh))
  var cubeModelTexture = loadTexture("resources/images/all_probes/stpeters_cross.png")

  var mesh = genMeshSphere(4, 64, 64)
  var model = loadModelFromMesh(move(mesh))
  var shader = loadShaderFromMemory(vertexShader, fragmentShader)
  var modelImage = loadImage("resources/images/all_probes/stpeters_cross/stpeters_right.png")
  #var modelTexture = loadTextureFromImage(modelImage)
  # Cubemap
  # var cubemap = loadTexture("resources/images/all_probes/stpeters_cross.png")

  var modelTexture = loadTexture("resources/images/all_probes/stpeters_cross.png")  # Replace with your texture path
  var image = loadImage("resources/images/all_probes/stpeters_cross.png")  # Replace with your texture path
  var cubemap = loadTextureCubemap(image, CrossThreeByFour)


  var faces = [
    "resources/images/all_probes/stpeters_cross/stpeters_right.png",
    "resources/images/all_probes/stpeters_cross/stpeters_left.png",
    "resources/images/all_probes/stpeters_cross/stpeters_top.png",
    "resources/images/all_probes/stpeters_cross/stpeters_bottom.png",
    "resources/images/all_probes/stpeters_cross/stpeters_front.png",
    "resources/images/all_probes/stpeters_cross/stpeters_back.png"
  ]
  # var cubemap = initCubemap(faces)

  # Debugging output
  if model.meshCount == 0:
    echo "Failed to load model"
  if shader.id == 0:
    echo "Failed to load shader"

  model.materials[0].shader = shader
  #model.materials[0].maps[MaterialMapIndex.Albedo].color = Orange
  #model.materials[0].maps[MaterialMapIndex.Emission].color = Orange
  model.materials[0].maps[MaterialMapIndex.Albedo].texture = modelTexture
  cubeModel.materials[0].maps[MaterialMapIndex.Albedo].texture = cubeModelTexture
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
  var timeLoc = getShaderLocation(shader, "time")
  var lightPosLoc = getShaderLocation(shader, "lightPos")
  var viewLoc = getShaderLocation(shader, "view")

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
  echo "time ", timeLoc.int32
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
  var tdelta: float32 = 0.1
  var pdelta: float32 = 0.1
  var time: float32 = 0.0
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

  setTargetFPS(6) # Set our game to run at 60 frames-per-second
  var frame = 0
  while not windowShouldClose(): # Detect window close button or ESC key
    time += getFrameTime()
    setShaderValueTexture(shader, cubemapLoc, cubemap)
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
    setShaderValue(shader, timeLoc, time)
    setShaderValue(shader, lightPosLoc, lightPos)
    setShaderValueMatrix(shader, viewLoc, viewMatrix)

    var rotationAngles = Vector3(x:0.0, y:0.0, z:0.0) # Rotate around Y-axis
    frame = frame + 1
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

    # drawMesh(model.meshes[0], model.materials[0], rotateXYZ(rotationAngles))
    #drawModelWires(model, Vector3(x:0, y:0, z:0), 0.5f, Blue)
    drawModel(model, Vector3(x:0, y:0, z:0), 0.5f, White)
    endShaderMode()
    drawModel(cubeModel, Vector3(x:0, y:0, z:0), 0.5f, White)
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
    c += rand(1.0) - 0.5f
    if c > 5:
      c = 5
    if c < -5:
      c = -5
    d += rand(1.0) - 0.5f
    if d > 5:
      d = 5
    if d < -5:
      d = -5

    drawFPS(0,0)
    endDrawing()

main()
