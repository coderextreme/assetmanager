import raylib, raymath, rlgl

proc main() =
  # Initialize window and 3D mode
  initWindow(800, 600, "Mesh with Custom Shader")
  setTargetFPS(60)
  
  # Define camera
  var camera = Camera3D(
    position: Vector3(x: 0.0, y: 10.0, z: 10.0),
    target: Vector3(x: 0.0, y: 0.0, z: 0.0),
    up: Vector3(x: 0.0, y: 1.0, z: 0.0),
    fovy: 45.0,
    projection: Perspective
  )

  # Create a custom mesh (in this case, a cube)
  var mesh = genMeshCube(2.0, 2.0, 2.0)
  
  # Generate mesh vertex buffers and upload to GPU
  uploadMesh(mesh, false)
  
  # Load shader
  let vertexShader = """
    #version 330
    in vec3 vertexPosition;
    in vec2 vertexTexCoord;
    in vec3 vertexNormal;
    uniform mat4 mvp;
    out vec3 fragPosition;
    out vec2 fragTexCoord;
    out vec3 fragNormal;
    void main() {
        fragPosition = vertexPosition;
        fragTexCoord = vertexTexCoord;
        fragNormal = vertexNormal;
        gl_Position = mvp * vec4(vertexPosition, 1.0);
    }
  """
  
  let fragmentShader = """
    #version 330
    in vec3 fragPosition;
    in vec2 fragTexCoord;
    in vec3 fragNormal;
    uniform vec4 customColor;
    uniform float time;
    out vec4 finalColor;
    void main() {
        // Create a color that changes based on position and time
        vec3 pos = fragPosition * 0.5 + 0.5;
        vec3 normal = normalize(fragNormal);
        float pulse = sin(time * 2.0) * 0.5 + 0.5;
        finalColor = vec4(pos * pulse + normal * (1.0 - pulse), 1.0) * customColor;
    }
  """
  
  var shader = loadShaderFromMemory(vertexShader, fragmentShader)
  
  # Get shader uniform locations
  let 
    colorLoc = getShaderLocation(shader, "customColor")
    timeLoc = getShaderLocation(shader, "time")
  
  # Define initial color
  var color = Vector4(
    x: 1.0'f32,  # Red
    y: 0.5'f32,  # Green
    z: 0.2'f32,  # Blue
    w: 1.0'f32   # Alpha
  )
  
  # Create model from mesh
  var model = loadModelFromMesh(mesh)
  # model.materials[0].maps[MaterialMapIndex.Albedo].color = Orange
  model.materials[0].shader = shader
  #model.materials[0].maps[MaterialMapIndex.Albedo].texture = modelTexture
  #model2.materials[0].maps[MaterialMapIndex.Albedo].texture = modelTexture
  
  var time: float32 = 0.0
  
  while not windowShouldClose():
    # Update
    time += getFrameTime()
    updateCamera(camera, Orbital)
    
    # Update shader uniforms
    setShaderValue(shader, colorLoc, color)
    setShaderValue(shader, timeLoc, time)
    
    # Draw
    beginDrawing()
    clearBackground(RayWhite)
      
    beginMode3D(camera)
    drawModel(model, Vector3(), 1.0, White)
    drawGrid(10, 1.0)
    endMode3D()
    drawText("Use mouse to orbit camera", 10, 40, 20, Gray)
    endDrawing()
      
    # Handle input for color changes
    if isKeyDown(KeyboardKey.R): color.x = min(color.x + 0.01'f32, 1.0'f32)
    if isKeyDown(KeyboardKey.G): color.y = min(color.y + 0.01'f32, 1.0'f32)
    if isKeyDown(KeyboardKey.B): color.z = min(color.z + 0.01'f32, 1.0'f32)
  
  # Cleanup
  closeWindow()

when isMainModule:
  main()
