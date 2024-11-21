import os, math, raylib, raymath, rlgl

const
  screenWidth = 800
  screenHeight = 450

proc main =
  initWindow(screenWidth, screenHeight, "3D Model Viewer - Animation Example")
  defer: closeWindow()

  # Initialize camera
  var camera = Camera(
    position: Vector3(x: 0, y: 2, z: 15),  # Moved back and up slightly
    target: Vector3(x: 0, y: 0, z: 0),
    up: Vector3(x: 0, y: 1, z: 0),
    fovy: 45,
    projection: Perspective
  )

  # Load model and check for errors
  var joeModel = loadModel("resources/JoeSkinTexcoordDisplacerKickUpdate3Export.gltf")
  if joeModel.meshCount == 0:
    echo "Failed to load model!"
    return

  echo "Model loaded successfully:"
  echo "Mesh count: ", joeModel.meshCount
  echo "Material count: ", joeModel.materialCount
  echo "Bone count: ", joeModel.boneCount

  # Load animations with error handling
  var animations: RArray[ModelAnimation]
  var animsCount: int32 = 0
  var currentFrame: int32 = 0
  var animationSpeed: float32 = 1.0
  var isAnimationPlaying = true

  try:
    if joeModel.boneCount > 0:
      animations = loadModelAnimations("resources/JoeSkinTexcoordDisplacerKickUpdate3Export.gltf")
      animsCount = animations.len.int32
      echo "Successfully loaded ", animsCount, " animations"
    else:
      echo "Model has no bones for animation"
  except RaylibError:
    echo "Failed to load animations"
    animsCount = 0

  # Create a simple ground plane mesh
  let groundMesh = genMeshPlane(20.0, 20.0, 1, 1)
  var groundModel = loadModelFromMesh(groundMesh)

  # Create a grid texture for the ground
  let gridImage = genImageChecked(64, 64, 32, 32, Gray, DarkGray)
  let gridTexture = loadTextureFromImage(gridImage)
  groundModel.materials[0].maps[MaterialMapIndex.Albedo].texture = gridTexture

  var modelPosition = Vector3(x: 0.0f, y: 0.0f, z: 0.0f)
  var modelScale: float32 = 1.0f
  var modelRotationY: float32 = 0.0f

  setTargetFPS(60)

  while not windowShouldClose():
    # Update
    updateCamera(camera, Orbital)

    # Handle input
    if isKeyDown(KeyboardKey.Q): camera.position.y += 0.1f
    if isKeyDown(KeyboardKey.E): camera.position.y -= 0.1f
    if isKeyDown(KeyboardKey.Left): modelRotationY -= 2.0f
    if isKeyDown(KeyboardKey.Right): modelRotationY += 2.0f
    if isKeyDown(KeyboardKey.Up): modelScale += 0.1f
    if isKeyDown(KeyboardKey.Down): modelScale -= 0.1f
    if isKeyPressed(KeyboardKey.Space): isAnimationPlaying = not isAnimationPlaying
    if isKeyPressed(KeyboardKey.R): currentFrame = 0

    # Update animation
    if animations.len > 0 and isAnimationPlaying:
      currentFrame += 1
      let anim = move(animations[0])  # Use first animation
      if currentFrame >= anim.frameCount:
        currentFrame = 0
      updateModelAnimation(joeModel, anim, currentFrame)
      #if joeModel.boneCount > 0:
      #  updateModelAnimationBones(joeModel, anim, currentFrame)
    else:
      echo "Played frame ", currentFrame

    # Draw
    beginDrawing()
    clearBackground(RayWhite)
    
    beginMode3D(camera)
    # Draw ground
    drawModel(groundModel, Vector3(x: 0, y: -0.5f, z: 0), 1.0f, White)
    
    # Draw coordinate system
    drawGrid(20, 1.0f)
    
    # Draw model with rotation
    let modelMatrix = rotateY(modelRotationY * 3.14159 / 180.0)
    joeModel.transform = modelMatrix
    drawModel(joeModel, modelPosition, modelScale, White)
    
    # Draw UI
    drawText("Controls:", 20, 20, 20, Black)
    drawText("- Space: Play/Pause animation", 40, 50, 10, DarkGray)
    drawText("- R: Reset animation", 40, 70, 10, DarkGray)
    drawText("- Arrow keys: Rotate model and scale", 40, 90, 10, DarkGray)
    drawText("- Q/E: Adjust camera height", 40, 110, 10, DarkGray)
    drawText("- Mouse wheel: Zoom camera", 40, 130, 10, DarkGray)
    endMode3D()
    endDrawing()
    
main()
