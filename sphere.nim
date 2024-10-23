#   Copyright (c) 2024 by John Carlson

import os, math, raylib, raymath, rlgl

const
  screenWidth = 800
  screenHeight = 450
type
  LightKind = enum # Light type
    Directional, Point, Spot

  Light = object # Light data
    enabled: int32
    kind: int32
    position: Vector3
    target: Vector3
    color: array[4, float32]
    intensity: float32
proc main =
  # Initialization
  # --------------------------------------------------------------------------------------
  initWindow(screenWidth, screenHeight, "JSONverse shaders example - sphere")
  defer: closeWindow()
  let camera = Camera(
    position: Vector3(x: 0, y: 0, z: 6),
    target: Vector3(x: 0, y: 0, z: 0),
    up: Vector3(x: 0, y: 1, z: 0),
    fovy: 45,
    projection: Perspective
  )
  let img = genImageChecked(64, 64, 32, 32, DarkBrown, DarkGray)
  let backgroundTexture = loadTextureFromImage(img)

  let light = Light(
      enabled: 1,
      kind: int32(Point),
      position: Vector3(x: 0, y: 2, z: 0),
      target: Vector3(x: 0, y: 0, z: 0),
      color: [1.0'f32, 0.0'f32, 0.0'f32, 1.0'f32],
      intensity: 1.0f
    )


  setTargetFPS(60) # Set our game to run at 60 frames-per-second
  while not windowShouldClose(): # Detect window close button or ESC key
    beginDrawing()
    beginMode3D(camera)
    #drawTexture(backgroundTexture,
    #    Rectangle(x: 0, y: 0, width: getScreenWidth().float32, height: getScreenHeight().float32),
    #    Vector2.zero, White)
    # Overlay the shadows from all the lights
    drawSphere(Vector3(x: 0.0f, y:0.0f, z: 0.0f), 1, Green)
    #drawCircle(getScreenWidth().int32 div 2, getScreenHeight().int32 div 2, 50.0f, White)
    let lightColor = Color(
        r: uint8(light.color[0]*255),
        g: uint8(light.color[1]*255),
        b: uint8(light.color[2]*255),
        a: uint8(light.color[3]*255)
    )
    if light.enabled == 1:
      drawSphere(light.position, 0.2, 8, 8, lightColor)
    endMode3D()
    endDrawing()

main()
