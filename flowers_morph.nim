#   Copyright (c) 2024 by John Carlson

import raylib, raymath, rlgl

const
  screenWidth = 960
  screenHeight = 540
  vertexShader =
    """
#version 330 core
uniform mat4 mvp;
uniform mat4 matView;

in vec3 vertexPosition;
in vec2 vertexTexCoord;
in vec3 vertexNormal;
in vec4 vertexColor;

uniform float a;
uniform float b;
uniform float c;
uniform float d;
uniform float tdelta;
uniform float pdelta;

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
    vec3 position = vertexPosition;
    gl_Position = mvp * vec4(rose(cart2sphere(position), a, b, c, d, tdelta, pdelta), 1.0);
}

"""
  fragmentShader = """
#version 330 core

uniform vec4 myColor;
out vec4 finalColor;

void main()
{
    finalColor = myColor;
}
"""

proc main() =
  # Initialization
  # --------------------------------------------------------------------------------------
  initWindow(screenWidth, screenHeight, "JSONverse shaders example - rhodonea")
  defer: closeWindow()
  var mesh = genMeshSphere(4, 64, 64)
  var model = loadModelFromMesh(move(mesh))
  var shader = loadShaderFromMemory(vertexShader, fragmentShader)

  # Debugging output
  if model.meshCount == 0:
    echo "Failed to load model"
  if shader.id == 0:
    echo "Failed to load shader"

  model.materials[0].shader = shader
  model.materials[0].maps[MaterialMapIndex.Albedo].color = Orange
  #model.materials[0].maps[MaterialMapIndex.Albedo].texture = modelTexture
  #model2.materials[0].maps[MaterialMapIndex.Albedo].texture = modelTexture

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

  var aLoc = getShaderLocation(shader, "a")
  var bLoc = getShaderLocation(shader, "b")
  var cLoc = getShaderLocation(shader, "c")
  var dLoc = getShaderLocation(shader, "d")
  var tdeltaLoc = getShaderLocation(shader, "tdelta")
  var pdeltaLoc = getShaderLocation(shader, "pdelta")
  var colorLoc = getShaderLocation(shader, "myColor")

  echo "a ", aLoc.int32
  echo "b ", bLoc.int32
  echo "c ", cLoc.int32
  echo "d ", dLoc.int32
  echo "tdelta ", tdeltaLoc.int32
  echo "pdelta ", pdeltaLoc.int32
  echo "color ", colorLoc.int32

  var a: float32 = 20
  var b: float32 = 10
  var c: float32 = 4
  var d: float32 = 4
  var tdelta: float32 = 0
  var pdelta: float32 = 0

  var normalColor = Orange
  var shaderColor = Vector4(
    x:normalColor.r.float32/255.0'f32,
    y:normalColor.g.float32/255.0'f32,
    z:normalColor.b.float32/255.0'f32,
    w:normalColor.a.float32/255.0'f32
    )

  var screenSize = [getScreenWidth().float32, getScreenHeight().float32]
  setShaderValue(shader, getShaderLocation(shader, "size"), screenSize)

  setTargetFPS(60) # Set our game to run at 60 frames-per-second
  var frame = 0
  while not windowShouldClose(): # Detect window close button or ESC key
    setShaderValue(shader, aLoc, a.float32)
    setShaderValue(shader, bLoc, b.float32)
    setShaderValue(shader, cLoc, c.float32)
    setShaderValue(shader, dLoc, d.float32)
    setShaderValue(shader, tdeltaLoc, tdelta.float32)
    setShaderValue(shader, pdeltaLoc, pdelta.float32)
    setShaderValue(shader, colorLoc, shaderColor)

    var rotationAngles = Vector3(x:0.0, y:0.0, z:0.0) # Rotate around Y-axis
    frame = frame + 1
    beginDrawing()
    clearBackground(White)
    drawTexture(backgroundTexture,
      Rectangle(x: 0, y: 0, width: getScreenWidth().float32, height: getScreenHeight().float32),
      Vector2.zero, White)

    beginMode3D(camera)
    updateCamera(camera, Free)
    beginShaderMode(shader)
    # Works, but color has no effect, since shader overrides
    #drawSphereWires(Vector3(x:0, y:0, z:0), 3.0f, 64, 64, Green)
    # Works, but color has no effect, since shader overrides
    # drawSphere(Vector3(x:0, y:0, z:0), 3.0f, 64, 64, Green)

    # works, but no morphing
    # drawMesh(mesh, model.materials[0], rotateXYZ(rotationAngles))

    #drawModelWires(model, Vector3(x:0, y:0, z:0), 0.5f, Blue)
    drawModel(model, Vector3(x:0, y:0, z:0), 0.5f, Green)

    endShaderMode()
    endMode3D()
    endDrawing()

main()
