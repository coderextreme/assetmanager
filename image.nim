import raylib, rlgl, raymath

proc loadCubemap(right, left, top, bottom, front, back: string): uint32 =
  ## Loads a cubemap from 6 individual image files
  ## Returns a texture that can be used as a cubemap
  
  # Load all face images
  var faces = [
    loadImage(right),  # Right face (+X)
    loadImage(left),   # Left face (-X)
    loadImage(top),    # Top face (+Y)
    loadImage(bottom), # Bottom face (-Y)
    loadImage(front),  # Front face (+Z)
    loadImage(back)    # Back face (-Z)
  ]

  # Verify all images have same dimensions
  let width = faces[0].width
  let height = faces[0].height

  # Create cubemap texture
  var cubemap = loadTextureCubemap(addr(faces), width * height, PixelFormat.UNCOMPRESSED_R8G8B8A8)

  result = cubemap

# Example usage:
when isMainModule:
  initWindow(800, 600, "Cubemap Example")
  setTargetFPS(60)

  var cubemap = loadCubemap(
    "resources/images/all_probes/stpeters_cross/stpeters_right.png",
    "resources/images/all_probes/stpeters_cross/stpeters_left.png",
    "resources/images/all_probes/stpeters_cross/stpeters_top.png",
    "resources/images/all_probes/stpeters_cross/stpeters_bottom.png",
    "resources/images/all_probes/stpeters_cross/stpeters_front.png",
    "resources/images/all_probes/stpeters_cross/stpeters_back.png"
  )
  var mesh = genMeshCube(60.0f, 60.0f, 60.0f)
  var model = loadModelFromMesh(move(mesh))
  var modelTexture = loadTexture("resources/images/all_probes/stpeters_cross.png")
  var image = loadImage("resources/images/all_probes/stpeters_cross.png")
  # var cubemap = loadTextureCubemap(image, CrossThreeByFour)

  model.materials[0].maps[MaterialMapIndex.Albedo].texture = modelTexture
  # model.materials[0].maps[MaterialMapIndex.Albedo].texture = cubemap

  var camera = Camera3D(
    position : Vector3( x:0.0f, y:0.0f, z:15.0f ),
    target :   Vector3( x:0.0f, y:0.0f, z:0.0f ),
    up :       Vector3( x:0.0f, y:1.0f, z:0.0f ),
    fovy : 45.0f,
    projection : Perspective
  ) 
  var rotationAngles = Vector3(x:0.0, y:0.0, z:0.0) # Rotate around Y-axis

  while not windowShouldClose():
    beginDrawing()
    clearBackground(RayWhite)
    
    beginMode3D(camera)
    updateCamera(camera, Orbital)
    # Use cubemap here for skybox or environment mapping
    # drawTexture(cubemap, Rectangle(x: 0, y: 0, width: getScreenWidth().float32, height: getScreenHeight().float32), Vector2.zero, White)
    # drawMesh(model.meshes[0], model.materials[0], rotateXYZ(rotationAngles))
    drawModel(model, Vector3(x:0, y:0, z:0), 0.5f, Orange)
    endMode3D()
    
    endDrawing()

  closeWindow()
