import raylib
import std/[math]

const 
  screenWidth = 800
  screenHeight = 450
  glslVersion = 330

# Vertex shader that modifies the mesh vertices
const vertexShader = """
#version 330

// Input vertex attributes
in vec3 vertexPosition;
in vec2 vertexTexCoord;
in vec3 vertexNormal;
in vec4 vertexColor;

// Input uniform values
uniform mat4 mvp;
uniform float time;

// Output vertex attributes (to fragment shader)
out vec2 fragTexCoord;
out vec4 fragColor;

void main() {
    // Transform vertex position based on time
    vec3 position = vertexPosition;
    position.y += sin(time + position.x) * 0.5;
    
    // Calculate final vertex position
    gl_Position = mvp * vec4(position, 1.0);
    
    // Pass vertex attributes to fragment shader
    fragTexCoord = vertexTexCoord;
    fragColor = vertexColor;
}
"""

# Simple fragment shader
const fragmentShader = """
#version 330

// Input vertex attributes (from vertex shader)
in vec2 fragTexCoord;
in vec4 fragColor;

// Output fragment color
out vec4 finalColor;

void main() {
    finalColor = fragColor;
}
"""

proc main() =
  # Initialize window
  initWindow(screenWidth, screenHeight, "Vertex Shader - Mesh Deformation")
  setTargetFPS(60)

  # Create a simple cube mesh
  let mesh = genMeshCube(1.0, 1.0, 1.0)
  let model = loadModelFromMesh(mesh)

  # Load shader and set up uniforms
  var shader = loadShaderFromMemory(vertexShader, fragmentShader)
  let timeLoc = getShaderLocation(shader, "time")
  # model.materials[0].shader = shader

  # Set up camera
  var camera = Camera3D(
    position: Vector3(x: 0.0, y: 1.0, z: -5.0),
    target: Vector3(x: 0.0, y: 0.0, z: 0.0),
    up: Vector3(x: 0.0, y: 1.0, z: 0.0),
    fovy: 45.0,
    projection: Perspective
  )

  while not windowShouldClose():
    # Update shader uniform
    let time = 0.int32 #getTime().float32
    setShaderValue(shader, timeLoc, time)

    # Update camera
    updateCamera(camera, Free)

    beginDrawing()
    clearBackground(RAYWHITE)
    
    beginMode3D(camera)
    drawModel(model, Vector3(x: 0, y: 0, z: 0), 1.0, WHITE)
    drawGrid(10, 1.0)
    
    drawFPS(10, 10)
    drawText("Use mouse wheel to zoom in-out", 10, 40, 20, GRAY)
    drawText("Use mouse to rotate camera", 10, 70, 20, GRAY)
    endMode3D()
    endDrawing()

  # Clean up
  #unloadShader(shader)
  #unloadModel(model)
  closeWindow()

main()
