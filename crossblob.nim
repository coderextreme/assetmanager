import raylib, raymath, rlgl

const 
  screenWidth = 800
  screenHeight = 450

# Vertex shader (basic MVP transformation)
const vertexShader = """
#version 330
in vec3 vertexPosition;
in vec2 vertexTexCoord;
in vec3 vertexNormal;

uniform mat4 mvp;
uniform float time;

out vec2 fragTexCoord;
out vec3 fragNormal;

void main() {
    // Add some vertex animation based on time
    vec3 position = vertexPosition;
    position.y += sin(time * 2.0 + position.x) * 0.5;
    
    fragTexCoord = vertexTexCoord;
    fragNormal = vertexNormal;
    gl_Position = mvp * vec4(position, 1.0);
}
"""

# Fragment shader (color manipulation)
const fragmentShader = """
#version 330
in vec2 fragTexCoord;
in vec3 fragNormal;

uniform sampler2D texture0;
uniform float time;
uniform vec3 lightPos;

out vec4 finalColor;

void main() {
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
}
"""

initWindow(screenWidth, screenHeight, "Model with Custom Shader")
setTargetFPS(60)

# Camera setup
var camera = Camera3D(
  position: Vector3(x: 10.0, y: 10.0, z: 10.0),
  target: Vector3(x: 0.0, y: 0.0, z: 0.0),
  up: Vector3(x: 0.0, y: 1.0, z: 0.0),
  fovy: 45.0,
  projection: Perspective
)

# Load model and texture
var mesh = genMeshSphere(4, 64, 64)
var model = loadModelFromMesh(move(mesh))
var texture = loadTexture("resources/images/all_probes/stpeters_cross.png")

# Load and compile shader
var shader = loadShaderFromMemory(vertexShader, fragmentShader)

# Get shader locations for uniforms
let timeLoc = getShaderLocation(shader, "time")
let lightPosLoc = getShaderLocation(shader, "lightPos")

# Apply shader and texture to model
model.materials[0].shader = shader
model.materials[0].maps[MaterialMapIndex.Albedo].texture = texture

var time: float32 = 0.0
let lightPos = Vector3(x: 10.0, y: 10.0, z: 10.0)

while not windowShouldClose():
  time += getFrameTime()
  
  # Update shader uniforms
  setShaderValue(shader, timeLoc, time)
  setShaderValue(shader, lightPosLoc, lightPos)
  
  updateCamera(camera, Orbital)
  
  beginDrawing()
  clearBackground(RayWhite)
    
  beginMode3D(camera)
  drawModel(model, Vector3(x: 0, y: 0, z: 0), 1.0, White)
  drawGrid(10, 1.0)
    
  drawFPS(10, 10)
  endMode3D()
  endDrawing()

closeWindow()
