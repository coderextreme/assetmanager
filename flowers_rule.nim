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

  let camera = Camera(
    position : Vector3( x:0.0f, y:10.0f, z:10.0f ),
    target :   Vector3( x:0.0f, y:0.0f, z:0.0f ),
    up :       Vector3( x:0.0f, y:1.0f, z:0.0f ),
    fovy : 45.0f,
    projection : Perspective
  )

  let sphere = genMeshSphere(2, 32, 32)
  let sphere_mesh = loadModelFromMesh(sphere)
  if sphere_mesh.meshCount == 0 or sphere_mesh.materialCount == 0:
      echo "Failed to load sphere model."
      return
  #let cube = genMeshCube(1.0f, 1.0f, 1.0f)
  #let skybox = loadModelFromMesh(cube)

  # Load texture to apply shaders
  #let back_texture = loadTexture("resources/images/all_probes/stpeters_cross/stpeters_back.png")
  #let bottom_texture = loadTexture("resources/images/all_probes/stpeters_cross/stpeters_bottom.png")
  #let front_texture = loadTexture("resources/images/all_probes/stpeters_cross/stpeters_front.png")
  #let left_texture = loadTexture("resources/images/all_probes/stpeters_cross/stpeters_left.png")
  #let right_texture = loadTexture("resources/images/all_probes/stpeters_cross/stpeters_right.png")
  #let top_texture = loadTexture("resources/images/all_probes/stpeters_cross/stpeters_top.png")

  # Load shader and setup location points and values
  let shader = loadShader("shaders/rlnotexture.vs", "shaders/rlnotexture.fs")
#uniform vec3 chromaticDispertion
#uniform float bias
#uniform float scale
#uniform float power
#uniform float a
#uniform float b
#uniform float c
#uniform float d
#uniform float tdelta
#uniform float pdelta

  #let cubemapLoc = getShaderLocation(shader, "cube")
  let viewProjLoc = getShaderLocation(shader, "matrix_viewProjection")
  let viewLoc = getShaderLocation(shader, "matrix_view")
  let chromaticDispertionLoc = getShaderLocation(shader, "chromaticDispertionLoc")
  let biasLoc = getShaderLocation(shader, "bias")
  let scaleLoc = getShaderLocation(shader, "scale")
  let powerLoc = getShaderLocation(shader, "power")
  let aLoc = getShaderLocation(shader, "a")
  let bLoc = getShaderLocation(shader, "b")
  let cLoc = getShaderLocation(shader, "c")
  let dLoc = getShaderLocation(shader, "d")
  let tdeltaLoc = getShaderLocation(shader, "tdelta")
  let pdeltaLoc = getShaderLocation(shader, "pdelta")

  let view = getCameraMatrix(camera)
  proc customMatrixPerspective(fovy, aspect, znear, zfar: float32): Matrix =
    let top = znear * sin(fovy * 3.141592654 / 360.0)/cos(fovy * 3.141592654 / 360.0)
    let right = top * aspect
    result = Matrix(
      m0: znear / right,  m1: 0.0,           m2: 0.0,                          m3: 0.0,
      m4: 0.0,            m5: znear / top,    m6: 0.0,                          m7: 0.0,
      m8: 0.0,            m9: 0.0,           m10: -(zfar + znear) / (zfar - znear), m11: -1.0,
      m12: 0.0,           m13: 0.0,           m14: -(2.0 * zfar * znear) / (zfar - znear), m15: 0.0
    )

  # Usage
  let fovy = 45.0
  let aspect = 800.0 / 450.0
  let znear = 0.1
  let zfar = 100.0

  let viewProj = customMatrixPerspective(fovy.float32, aspect.float32, znear.float32, zfar.float32)

  #let viewProj = multiply(view, projection)

  let chromaticDispertion = Vector3(x: 0.98, y:1.0, z:1.02)
  let bias: float32 = 0.5
  let scale: float32 = 0.5
  let power: float32 = 2
  let a: float32 = 20
  let b: float32 = 10
  let c: float32 = 2
  let d: float32 = 2
  let tdelta: float32 = 0
  let pdelta: float32 = 0

  # let skyboxFileName = "resources/images/all_probes/stpeters_probe.hdr"

  # if not fileExists(skyboxFileName):
  #   echo "Skybox file not found: ", skyboxFileName
  #   return

  # let panorama = loadTexture(skyboxFileName)
  # if panorama.id == 0:
  #   echo "Failed to load texture: ", skyboxFileName
  #   return

  
  # setShaderValueTexture(shader, cubemapLoc, panorama)
  # UnloadTexture(panorama);

  let screenSize = [getScreenWidth().float32, getScreenHeight().float32]
  # setShaderValueTexture(shader, cubemapLoc, skybox.materials[0].maps[6].texture)
  setShaderValueMatrix(shader, viewProjLoc, viewProj)
  setShaderValueMatrix(shader, viewLoc, view);

  setShaderValue(shader, getShaderLocation(shader, "size"), screenSize)
  setShaderValue(shader, chromaticDispertionLoc, chromaticDispertion)
  setShaderValue(shader, biasLoc, bias)
  setShaderValue(shader, scaleLoc, scale)
  setShaderValue(shader, powerLoc, power)
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
    beginShaderMode(shader)
    drawModel(sphere_mesh,Vector3(x:0, y:0, z:0), 1.0f, WHITE)
    endShaderMode()
    endDrawing()

main()
