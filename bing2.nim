import raylib, raymath, rlgl, std/[strformat, lenientops]

const
  screenWidth = 800
  screenHeight = 450
  vertexCode =
    """
#version 330 core

in mat4 model;
in mat4 view;
in mat4 projection;
varying vec4 position;

void main()
{
    gl_Position = projection * view * model * position;
}
"""
  fragmentCode = """
#version 330 core

out vec4 fragColor;

void main()
{

    fragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
"""


proc main =
  initWindow(screenWidth, screenHeight, "Basic hader test")
  defer: closeWindow()
  var mesh = genMeshSphere(4, 64, 64)
  var model = loadModelFromMesh(move(mesh))
  var shader = loadShaderFromMemory(vertexCode, fragmentCode)

  if model.meshCount == 0:
    echo "FAILED to load model"
  if shader.id == 0:
    echo "FAILED to load shader"

  #model.materials[0].shader = shader

  var camera = Camera(
    position : Vector3( x:0.0f, y:0.0f, z:10.0f ),
    target :   Vector3( x:0.0f, y:0.0f, z:0.0f ),
    up :       Vector3( x:0.0f, y:1.0f, z:0.0f ),
    fovy : 45.0f,
    projection : Perspective
  )

  setTargetFPS(60)

  while not windowShouldClose():
    beginDrawing()
    clearBackground(Black)
    beginMode3D(camera)
    beginShaderMode(shader)
    drawModelWires(model, Vector3(x:0, y:0, z:0), 0.5f, Blue)
    endShaderMode()
    endMode3D()
    endDrawing()

main()
