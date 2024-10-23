#   Copyright (c) 2024 by John Carlson

import os, math, raylib, raymath, rlgl

const
  screenWidth = 800
  screenHeight = 450

proc main =
  # Initialization
  # --------------------------------------------------------------------------------------
  initWindow(screenWidth, screenHeight, "JSONverse shaders example - rhodonea")
  defer: closeWindow()

  let img = genImageChecked(64, 64, 32, 32, DarkBrown, DarkGray)
  let backgroundTexture = loadTextureFromImage(img)

  var camera = Camera(
    position : Vector3( x:0.0f, y:0.0f, z:10.0f ),
    target :   Vector3( x:0.0f, y:0.0f, z:0.0f ),
    up :       Vector3( x:0.0f, y:1.0f, z:0.0f ),
    fovy : 45.0f,
    projection : Perspective
  )

  #let cube = genMeshCube(4.0f, 4.0f, 4.0f)
  #let mesh = loadModelFromMesh(cube)
  let sphere = genMeshSphere(4, 128, 128)
  let mesh = loadModelFromMesh(sphere)

  let shader = loadShader("shaders/rlnotexture.vs", "shaders/rlnotexture.fs")

  let aLoc = getShaderLocation(shader, "a")
  let bLoc = getShaderLocation(shader, "b")
  let cLoc = getShaderLocation(shader, "c")
  let dLoc = getShaderLocation(shader, "d")
  let tdeltaLoc = getShaderLocation(shader, "tdelta")
  let pdeltaLoc = getShaderLocation(shader, "pdelta")

  let a: float32 = 2
  let b: float32 = 1
  let c: float32 = 4
  let d: float32 = 4
  let tdelta: float32 = 0
  let pdelta: float32 = 0

  let screenSize = [getScreenWidth().float32, getScreenHeight().float32]
  setShaderValue(shader, getShaderLocation(shader, "size"), screenSize)
  setShaderValue(shader, aLoc, a)
  setShaderValue(shader, bLoc, b)
  setShaderValue(shader, cLoc, c)
  setShaderValue(shader, dLoc, d)
  setShaderValue(shader, tdeltaLoc, tdelta)
  setShaderValue(shader, pdeltaLoc, pdelta)

  setTargetFPS(60) # Set our game to run at 60 frames-per-second
  while not windowShouldClose(): # Detect window close button or ESC key
    beginDrawing()
    clearBackground(Black)
    drawTexture(backgroundTexture,
        Rectangle(x: 0, y: 0, width: getScreenWidth().float32, height: getScreenHeight().float32),
        Vector2.zero, White)
    updateCamera(camera, Orbital)
    beginShaderMode(shader)
    beginMode3D(camera)
    drawModel(mesh,Vector3(x:0, y:0, z:0), 1.0f, Blue)
    endMode3D()
    endShaderMode()
    endDrawing()

main()
