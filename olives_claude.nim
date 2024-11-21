#   Copyright (c) 2024 by John Carlson

import raylib, raymath, rlgl, random, math, os

const
  screenWidth = 960
  screenHeight = 540

proc main() =
  # Initialization
  initWindow(screenWidth, screenHeight, "Olive example")
  defer: closeWindow()

  let modelFile = "resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/IridescentDishWithOlives.gltf"

  # Check if file exists
  if not fileExists(modelFile):
    echo "Error: Model file not found at path: ", modelFile
    return

  echo "Loading model from: ", modelFile
  var model = loadModel(modelFile)

  # Error checking for model loading
  if model.meshCount == 0:
    echo "Failed to load model"
    return

  echo "Successfully loaded model with ", model.meshCount, " meshes"
  echo "Material count: ", model.materialCount
  echo "Bone count: ", model.boneCount

  # Try loading animations with error handling
  var animations: RArray[ModelAnimation]
  var animsCount: int32 = 0

  try:
    # First check if the model has any bones
    if model.boneCount >= 0:
      animations = loadModelAnimations(modelFile)
      animsCount = animations.len.int32
      echo "Successfully loaded ", animsCount, " animations"
    else:
      echo "Model has no bones for animation"
  except RaylibError:
    echo "Failed to load animations - continuing without animations"
    animsCount = 0

  var img = genImageChecked(64, 64, 32, 32, DarkBrown, DarkGray)
  var backgroundTexture = loadTextureFromImage(img)

  var camera = Camera3D(
    position: Vector3(x: 2.0f, y: 2.0f, z: 2.0f),  # Moved camera back for better view
    target: Vector3(x: 0.0f, y: 0.0f, z: 0.0f),
    up: Vector3(x: 0.0f, y: 1.0f, z: 0.0f),
    fovy: 45.0f,
    projection: Perspective
  )

  setTargetFPS(60)

  var animFrameCounter: float32 = 0

  while not windowShouldClose():
    # Update animation frame
    if animsCount > 0:
      try:
        animFrameCounter += getFrameTime()
        let animIndex = 0
        updateModelAnimation(model, animations[animIndex], (animFrameCounter * 30).int32)

        # Reset animation when it reaches the end
        if animFrameCounter * 30 >= animations[animIndex].frameCount.float32:
          animFrameCounter = 0
      except:
        echo "Error updating animation frame"

    beginDrawing()
    clearBackground(RayWhite)
    drawTexture(backgroundTexture,
      Rectangle(x: 0, y: 0, width: getScreenWidth().float32, height: getScreenHeight().float32),
      Vector2.zero, White)

    beginMode3D(camera)
    updateCamera(camera, Orbital)
    drawModel(model, Vector3(x: 0, y: 0, z: 0), 0.5f, White)
    drawGrid(10, 1.0)  # Added grid for better orientation
    endMode3D()

    # Draw debug info
    drawFPS(10, 10)
    drawText("Model Meshes: " & $model.meshCount, 10, 30, 20, DarkGray)
    drawText("Animations: " & $animsCount, 10, 50, 20, DarkGray)

    endDrawing()

main()
