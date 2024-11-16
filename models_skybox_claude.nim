import raylib, rlgl, raymath

proc main() =
  # Initialize window
  initWindow(800, 450, "raylib [models] example - skybox loading and drawing")

  # Define camera
  var camera = Camera3D(
    position: Vector3(x: 1.0f, y: 1.0f, z: 1.0f),
    target: Vector3(x: 0.0f, y: 0.0f, z: 0.0f),
    up: Vector3(x: 0.0f, y: 1.0f, z: 0.0f),
    fovy: 45.0f,
    projection: Perspective
  )

  var cube = genMeshCube(1.0f, 1.0f, 1.0f)
  var skybox = loadModelFromMesh(cube)

  var skyboxShader = loadShader(
    "C:/Users/jcarl/raylib/examples/models/resources/shaders/glsl330/skybox.vs",
    "C:/Users/jcarl/raylib/examples/models/resources/shaders/glsl330/skybox.fs"
  )
  skybox.materials[0].shader = skyboxShader

  var cubemapLoc = getShaderLocation(skyboxShader, "environmentMap")
  echo "cubemapLoc: ", cubemapLoc.int32

  # Set shader value without the datatype parameter
  var mapIndex: int32 = MaterialMapIndex.Cubemap.int32
  setShaderValue(skyboxShader, cubemapLoc, mapIndex)

  var img = loadImage("C:/Users/jcarl/assetmanager/resources/images/all_probes/stpeters_cross.png")
  var cubemap = loadTextureCubemap(img, CubemapLayout.AutoDetect)
  skybox.materials[0].maps[MaterialMapIndex.Cubemap].texture = cubemap

  # unloadImage(img)  # Clean up the image data after creating texture

  disableCursor()
  setTargetFPS(60)

  while not windowShouldClose():
    updateCamera(camera, CameraMode.FirstPerson)

    beginDrawing()

    clearBackground(RayWhite)

    beginMode3D(camera)

    disableBackfaceCulling()
    disableDepthMask()
    drawModel(skybox, Vector3(x: 0, y: 0, z: 0), 1.0f, White)
    enableBackfaceCulling()
    enableDepthMask()

    drawGrid(10, 1.0f)

    endMode3D()

    drawFPS(10, 10)

    endDrawing()

  # Cleanup
  #unloadShader(skyboxShader)
  #unloadTexture(cubemap)
  #unloadModel(skybox)
  closeWindow()

main()
