#   Copyright (c) 2024 by John Carlson

import os, math, raylib, raymath, rlgl

const
  screenWidth = 800
  screenHeight = 450

proc main =
  # Initialization
  # --------------------------------------------------------------------------------------
  initWindow(screenWidth, screenHeight, "sphere example - soon rhodonea")
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

  # if you don't want a hole, specify 4, 64, 64
  let sphere = genMeshSphere(4, 128, 128)
  let mesh = loadModelFromMesh(sphere)

  setTargetFPS(60) # Set our game to run at 60 frames-per-second
  while not windowShouldClose(): # Detect window close button or ESC key
    beginDrawing()
    clearBackground(Black)
    drawTexture(backgroundTexture,
        Rectangle(x: 0, y: 0, width: getScreenWidth().float32, height: getScreenHeight().float32),
        Vector2.zero, White)
    beginMode3D(camera)
    drawModel(mesh,Vector3(x:0, y:0, z:0), 1.0f, Blue)
    endMode3D()
    endDrawing()

main()
