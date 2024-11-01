import raylib

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
    // Create morphing effect based on time
    vec3 morphedPosition = vertexPosition;
    
    // Sine wave displacement
    float freq = 3.0;
    float amplitude = 0.2;
    morphedPosition.x += sin(vertexPosition.y * freq + time) * amplitude;
    morphedPosition.y += cos(vertexPosition.x * freq + time) * amplitude;
    morphedPosition.z += sin(vertexPosition.z * freq + time * 0.5) * amplitude;
    
    // Calculate position
    gl_Position = mvp * vec4(morphedPosition, 1.0);
    
    // Pass texture coordinates and normals to fragment shader
    fragTexCoord = vertexTexCoord;
    fragNormal = vertexNormal;
}
"""

const fragmentShader = """
#version 330
in vec2 fragTexCoord;
in vec3 fragNormal;

uniform sampler2D texture0;
uniform vec4 colDiffuse;

out vec4 finalColor;

void main() {
    vec4 texelColor = texture(texture0, fragTexCoord);
    finalColor = texelColor * colDiffuse;
}
"""

# Initialize window
const 
  screenWidth = 800
  screenHeight = 450

initWindow(screenWidth, screenHeight, "Morphing Sphere Example")

# Set up camera
var camera = Camera3D(
  position : Vector3( x:0.0f, y:0.0f, z:15.0f ),
  target :   Vector3( x:0.0f, y:0.0f, z:0.0f ),
  up :       Vector3( x:0.0f, y:1.0f, z:0.0f ),
  fovy : 45.0f,
  projection : Perspective
) 

# Generate sphere mesh with higher resolution for better morphing
var sphereMesh = genMeshSphere(2.0, 64, 64)  # radius, rings, slices

# Create model from mesh
var sphereModel = loadModelFromMesh(move(sphereMesh))

# Load and set up texture
var texture = loadTexture("resources/images/all_probes/stpeters_cross.png")  # Replace with your texture path
var image = loadImage("resources/images/all_probes/stpeters_cross.png")  # Replace with your texture path
var cubemap = loadTextureCubemap(image, CrossThreeByFour)

# Load shader and set up uniforms
var shader = loadShaderFromMemory(vertexShader, fragmentShader)
var timeLoc = getShaderLocation(shader, "time")

# Apply shader and texture to model
sphereModel.materials[0].shader = shader
sphereModel.materials[0].maps[MaterialMapIndex.Albedo].texture = texture
sphereModel.materials[0].maps[MaterialMapIndex.Cubemap].texture = cubemap

setTargetFPS(60)

var timeValue: float32 = 0.0

# Main game loop
while not windowShouldClose():
  # Update time value for shader
  timeValue += getFrameTime()
  setShaderValue(shader, timeLoc, timeValue)
  
  # Update camera
  updateCamera(camera, Orbital)
  
  beginDrawing()
  clearBackground(RayWhite)
  
  beginMode3D(camera)
  # Draw the morphing sphere
  drawModel(sphereModel, Vector3(x: 0, y: 0, z: 0), 1.0, White)
  
  # Draw grid for reference
  drawGrid(10, 1.0)
    
  # Draw FPS
  drawFPS(10, 10)
  endMode3D()
  endDrawing()
  
closeWindow()
