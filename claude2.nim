import raylib

type CubemapShader = object
  shader: Shader
  cubemapLoc: ShaderLocation

proc getImageSizeInBytes(image: Image): int =
  let bytesPerPixel = 32
  result = image.width * image.height * bytesPerPixel

proc initCubemap(faces: array[6, string]): Texture2D =
  # Load each face of the cubemap
  var images: array[6, Image]
  var size_sum = 0
  for i in 0..5:
    images[i] = loadImage(faces[i])
    size_sum = getImageSizeInBytes(images[i])
    
  # result = loadTextureCubemap(images[0].addr, size_sum.int32, PixelFormat.UncompressedR8g8b8a8)
  # let hdrImage = loadImage("resources/images/all_probes/stpeters_cross.png")
  result = loadTextureCubemap(images[0], CubemapLayout.CrossThreeByFour)
  
proc setupCubemapShader(): CubemapShader =
  # Example vertex shader (vertex.glsl):
  const vertexShader = """
#version 330
in vec3 vertexPosition;
in vec2 vertexTexCoord;
in vec3 vertexNormal;
in mat4 model;
in mat4 view;
in mat4 projection;
// in vec4 position;

out vec3 fragPosition;
out vec2 fragTexCoord;
out vec3 fragNormal;

void main() {
    fragPosition = vertexPosition;
    fragTexCoord = vertexTexCoord;
    fragNormal = vertexNormal;
    
    gl_Position = projection * view * model * vec4(vertexPosition, 1.0);
}
"""

  # Example fragment shader (fragment.glsl):
  const fragmentShader = """
#version 330
in vec3 fragPosition;
in vec2 fragTexCoord;
in vec3 fragNormal;

uniform samplerCube environmentMap;

out vec4 finalColor;

void main() {
    vec3 normal = normalize(fragNormal);
    vec3 reflection = reflect(normalize(fragPosition), normal);
    
    finalColor = texture(environmentMap, reflection);
}
"""
  result.shader = loadShaderFromMemory(vertexShader, fragmentShader)
  result.cubemapLoc = getShaderLocation(result.shader, "environmentMap")


# Usage example:
proc main() =
  initWindow(800, 600, "Cubemap Example")
  setTargetFPS(60)
  
  # Load cubemap faces
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
  
  # Set the cubemap texture in the shader
  setShaderValueTexture(cubemapShader.shader, cubemapShader.cubemapLoc, cubemap)

  var camera = Camera(
    position : Vector3( x:0.0f, y:0.0f, z:10.0f ),
    target :   Vector3( x:0.0f, y:0.0f, z:0.0f ),
    up :       Vector3( x:0.0f, y:1.0f, z:0.0f ),
    fovy : 45.0f,
    projection : Perspective
  )
  #var mesh = genMeshCube(18.0f, 18.0f, 18.0f)
  var mesh = genMeshSphere(4, 64, 64)
  var model = loadModelFromMesh(move(mesh))
  
  while not windowShouldClose():
    beginDrawing()
    clearBackground(RAYWHITE)
    
    beginMode3D(camera)
    updateCamera(camera, Orbital)

    beginShaderMode(cubemapShader.shader)
    # Draw your 3D model here using the shader
    drawModel(model, Vector3(x:0, y:0, z:0), 0.5f, Blue) 
    
    endShaderMode()
    endMode3D()
    endDrawing()
  
  # Cleanup
  # unloadTexture(cubemap)
  # unloadShader(cubemapShader.shader)
  closeWindow()

main()
