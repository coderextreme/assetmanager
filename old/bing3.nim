import raylib
import strformat

type CubemapShader = object
  shader: Shader
  cubemapLoc: ShaderLocation
  textureLoc: ShaderLocation
  viewPosLoc: ShaderLocation
  reflectStrengthLoc: ShaderLocation

const vertexShader = """
#version 330
in vec3 vertexPosition;
in vec2 vertexTexCoord;
in vec3 vertexNormal;
in mat4 model;
in mat4 view;
in mat4 projection;

out vec3 fragPosition;
out vec2 fragTexCoord;
out vec3 fragNormal;
out vec3 worldPos;

void main() {
    // Pass texture coordinates and normal to fragment shader
    fragTexCoord = vertexTexCoord;
    fragNormal = mat3(transpose(inverse(model))) * vertexNormal;

    // Calculate world position for reflection
    worldPos = vec3(model * vec4(vertexPosition, 1.0));
    fragPosition = worldPos;

    gl_Position = projection * view * model * vec4(vertexPosition, 1.0);
}
"""

const fragmentShader = """
#version 330
in vec3 fragPosition;
in vec2 fragTexCoord;
in vec3 fragNormal;
in vec3 worldPos;

uniform samplerCube environmentMap;
uniform sampler2D textureSampler;  // Regular texture
uniform vec3 viewPos;              // Camera position
uniform float reflectStrength;     // Blend factor between texture and reflection (0-1)

out vec4 finalColor;

void main() {
    // Sample the regular texture
    vec4 textureColor = texture(textureSampler, fragTexCoord);

    // Calculate reflection vector
    vec3 normal = normalize(fragNormal);
    vec3 viewDir = normalize(worldPos - viewPos);
    vec3 reflection = reflect(viewDir, normal);

    // Sample the environment map
    vec4 reflectionColor = texture(environmentMap, reflection);

    // Blend between texture and reflection based on reflectStrength
    finalColor = mix(textureColor, reflectionColor, reflectStrength);
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
  result.cubemapLoc = getShaderLocation(result.shader, "environmentMap")
  result.textureLoc = getShaderLocation(result.shader, "textureSampler")
  result.viewPosLoc = getShaderLocation(result.shader, "viewPos")
  result.reflectStrengthLoc = getShaderLocation(result.shader, "reflectStrength")

proc main() =
  initWindow(800, 600, "Textured Cubemap Example")
  var camera = Camera(
    position : Vector3( x:0.0f, y:0.0f, z:10.0f ),
    target :   Vector3( x:0.0f, y:0.0f, z:0.0f ),
    up :       Vector3( x:0.0f, y:1.0f, z:0.0f ),
    fovy : 45.0f,
    projection : Perspective
  )
  setTargetFPS(60)
  
  # Load textures and cubemap
  let faces = [
    "resources/images/all_probes/stpeters_cross/stpeters_right.png",
    "resources/images/all_probes/stpeters_cross/stpeters_left.png",
    "resources/images/all_probes/stpeters_cross/stpeters_top.png",
    "resources/images/all_probes/stpeters_cross/stpeters_bottom.png",
    "resources/images/all_probes/stpeters_cross/stpeters_front.png",
    "resources/images/all_probes/stpeters_cross/stpeters_back.png"
  ]
  let cubemap = initCubemap(faces)
  let shader = setupCubemapShader()

  while not windowShouldClose():
    beginDrawing()
    clearBackground(RAYWHITE)
    
    beginMode3D(camera)
    drawTexture(cubemap, Vector3(x:0, y:0, z:0), 2.0, 2.0, 2.0, WHITE)
    endMode3D()
    
    drawFPS(10, 10)
    endDrawing()
  
  closeWindow()

main()
