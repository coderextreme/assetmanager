import raylib, rlgl
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

proc getImageSizeInBytes(image: Image): int =
  let bytesPerPixel = 4
  result = image.width * image.height * bytesPerPixel

#proc initCubemap(faces: array[6, string]): Texture2D =
#  # Load each face of the cubemap
#  var images: array[6, Image]
#  var size_sum = 0
#  for i in 0..5:
#    images[i] = loadImage(faces[i])
#  size_sum = getImageSizeInBytes(images[0])
#    
#  result = loadTextureCubemap(images.addr, size_sum.int32, PixelFormat.UncompressedR8g8b8a8)
##  let hdrImage = loadImage("resources/images/all_probes/stpeters_cross.png")
##  result = loadTextureCubemap(hdrImage, CubemapLayout.CrossThreeByFour)
##  #result = loadTextureCubemap(images[0], CubemapLayout.CrossThreeByFour)

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
  setTargetFPS(60)
  
  # Load textures and cubemap
  let modelTexture = loadTexture("resources/images/all_probes/stpeters_cross.png")
  let cubemapImage = loadImage("resources/images/all_probes/stpeters_cross.png")
  # let cubemap = loadTextureCubemap(cubemapImage, CubemapLayout.AutoDetect)
  let faces = [
    "resources/images/all_probes/stpeters_cross/stpeters_right.png",
    "resources/images/all_probes/stpeters_cross/stpeters_left.png",
    "resources/images/all_probes/stpeters_cross/stpeters_top.png",
    "resources/images/all_probes/stpeters_cross/stpeters_bottom.png",
    "resources/images/all_probes/stpeters_cross/stpeters_front.png",
    "resources/images/all_probes/stpeters_cross/stpeters_back.png"
  ]
  
  let cubemap = initCubemap(faces)
  let cubemapShader = setupCubemapShader()
  
  # Set the textures in the shader
  setShaderValueTexture(cubemapShader.shader, cubemapShader.cubemapLoc, cubemap)
  #setShaderValueTexture(cubemapShader.shader, cubemapShader.textureLoc, modelTexture)
  
  var camera = Camera(
    position: Vector3(x: 0.0f, y: 0.0f, z: 10.0f),
    target: Vector3(x: 0.0f, y: 0.0f, z: 0.0f),
    up: Vector3(x: 0.0f, y: 1.0f, z: 0.0f),
    fovy: 45.0f,
    projection: Perspective
  )
  
  #var mesh = genMeshSphere(4, 64, 64)
  var mesh = genMeshCube(18.0f, 18.0f, 18.0f)
  var model = loadModelFromMesh(move(mesh))
  model.materials[0].maps[MaterialMapIndex.Albedo].texture = modelTexture
  #model.materials[0].maps[MaterialMapIndex.Cubemap].texture = cubemap
  
  var reflectStrength = 0.5f  # Blend factor between texture and reflection
  
  while not windowShouldClose():
    beginDrawing()
    clearBackground(RAYWHITE)
    
    beginMode3D(camera)
    updateCamera(camera, Orbital)
    
    # Update shader uniforms
    setShaderValue(cubemapShader.shader, cubemapShader.viewPosLoc, camera.position)
    setShaderValue(cubemapShader.shader, cubemapShader.reflectStrengthLoc, reflectStrength)
    
    beginShaderMode(cubemapShader.shader)
    drawModel(model, Vector3(x:0, y:0, z:0), 0.5f, WHITE)
    endShaderMode()
    
    endMode3D()
    
    # Optional: Add UI controls for reflectStrength
    if isKeyDown(KeyboardKey.Up): reflectStrength = min(reflectStrength + 0.01f, 1.0f)
    if isKeyDown(KeyboardKey.Down): reflectStrength = max(reflectStrength - 0.01f, 0.0f)
    
    drawText("Use Up/Down arrows to adjust reflection strength", 10, 10, 20, BLACK)
    drawText(fmt"Reflection Strength: {reflectStrength:.2f}", 10, 40, 20, BLACK)
    
    endDrawing()
  
  #unloadTexture(modelTexture)
  #unloadTexture(cubemap)
  #unloadShader(cubemapShader.shader)
  closeWindow()

main()
