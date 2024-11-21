#   Copyright (c) 2024 by John Carlson

import raylib, raymath, rlgl, random, math

const
  screenWidth = 960
  screenHeight = 540

proc initCubemap(faces: array[6, string]): TextureCubemap =
  var images: array[6, Image]
  for i in 0..5:
    images[i] = loadImage(faces[i])

  result = loadTextureCubemap(images[0], CubemapLayout.CrossThreeByFour)


proc main() =
  # Initialization
  # --------------------------------------------------------------------------------------
  initWindow(screenWidth, screenHeight, "Olive example")
  defer: closeWindow()

  var modelFile = "resources/glTF-Sample-Assets/Models/IridescentDishWithOlives/glTF/IridescentDishWithOlives.gltf"
  var model = loadModel(modelFile)
  var count : ptr int
  # var animations = loadModelAnimations(modelFile)

  # Debugging output
  if model.meshCount == 0:
    echo "Failed to load model"

  var img = genImageChecked(64, 64, 32, 32, DarkBrown, DarkGray)
  var backgroundTexture = loadTextureFromImage(img)

  var camera = Camera3D(
    position : Vector3( x:0.5f, y:0.5f, z:0.0f ),
    target :   Vector3( x:0.0f, y:0.0f, z:0.0f ),
    up :       Vector3( x:0.0f, y:1.0f, z:0.0f ),
    fovy : 45.0f,
    projection : Perspective
  ) 
  # Define camera
  #var camera = Camera3D(
  #  position: Vector3(x: 0.0, y: 10.0, z: 10.0),
  #  target: Vector3(x: 0.0, y: 0.0, z: 0.0),
  #  up: Vector3(x: 0.0, y: 1.0, z: 0.0),
  #  fovy: 45.0,
  #  projection: Perspective
  #)

  var normalColor = Red
  var screenSize = [getScreenWidth().float32, getScreenHeight().float32]

  setTargetFPS(6) # Set our game to run at 60 frames-per-second
  var frame = 0
  while not windowShouldClose(): # Detect window close button or ESC key
    var rotationAngles = Vector3(x:0.0, y:0.0, z:0.0) # Rotate around Y-axis
    # updateModelAnimation(model, animations[frame %% animations.len], (frame %% animations.len).int32)
    frame = frame + 1
    beginDrawing()
    clearBackground(White)
    drawTexture(backgroundTexture,
      Rectangle(x: 0, y: 0, width: getScreenWidth().float32, height: getScreenHeight().float32),
      Vector2.zero, White)
    beginMode3D(camera)
    updateCamera(camera, Orbital)
    drawModel(model, Vector3(x:0, y:0, z:0), 0.5f, White)
    endMode3D()
    drawFPS(0,0)
    endDrawing()

main()
