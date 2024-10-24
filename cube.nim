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
  initWindow(screenWidth, screenHeight, "JSONverse shaders example - skybox")
  defer: closeWindow()

  let skybox = genMeshCube(1.0f, 1.0f, 1.0f)
  var skyboxModel = loadModelFromMesh(skybox)
  #var skyboxModel = loadModel("resources/JoeSkinTexcoordDisplacerKickUpdate2Export.gltf")


  var camera = Camera(
    position: Vector3(x: 0, y: 0, z: 6),
    target: Vector3(x: 0, y: 0, z: 0),
    up: Vector3(x: 0, y: 1, z: 0),
    fovy: 45,
    projection: Perspective
  )
  #let camera = Camera(
  #  position : Vector3( x:0.0f, y:0.5f, z:0.5f ),
  #  target :   Vector3( x:0.0f, y:0.0f, z:0.0f ),
  #  up :       Vector3( x:0.0f, y:1.0f, z:0.0f ),
  #  fovy : 45.0f,
  #  projection : Perspective
  #)

  let light = Light(
      enabled: 1,
      kind: int32(Point),
      position: Vector3(x: 0, y: 0.9, z: 0),
      target: Vector3(x: 0, y: 0, z: 0),
      color: [1.0'f32, 0.0'f32, 0.0'f32, 0.5'f32],
      intensity: 1.0f
    )
  let img = genImageChecked(64, 64, 32, 32, DarkBrown, DarkGray)
  let backgroundTexture = loadTextureFromImage(img)

  let images: array[6, Image] = [
    loadImage("resources/images/all_probes/stpeters_cross/stpeters_right.png"),
    loadImage("resources/images/all_probes/stpeters_cross/stpeters_left.png"),
    loadImage("resources/images/all_probes/stpeters_cross/stpeters_top.png"),
    loadImage("resources/images/all_probes/stpeters_cross/stpeters_bottom.png"),
    loadImage("resources/images/all_probes/stpeters_cross/stpeters_front.png"),
    loadImage("resources/images/all_probes/stpeters_cross/stpeters_back.png")
  ]
  let texture = loadTextureFromImage(images[0])
  #skyboxModel.materials[0].maps[MATERIAL_MAP_DIFFUSE].texture = texture
  #skyboxModel.materials[0].maps[Albedo].texture = texture
  #setMaterialTexture(skyboxModel.materials[0], Albedo, texture)
  #skyboxModel.materials[0].maps[MaterialMapIndex.Albedo].color = White
  skyboxModel.materials[0].maps[MaterialMapIndex.Albedo].texture = texture

  let shader = loadShader("shaders/glsl330/rlskybox.vs", "shaders/glsl330/rlskybox.fs")
  let texLoc = getShaderLocation(shader, "texture0")
  let positionLoc = getShaderLocation(shader, "position")
  setShaderValueTexture(shader, texLoc, texture)
  setShaderValue(shader, positionLoc, camera.position)




  let lightColor = Color(
      r: uint8(light.color[0]*255),
      g: uint8(light.color[1]*255),
      b: uint8(light.color[2]*255),
      a: uint8(light.color[3]*255)
  )

  setTargetFPS(60)

  let count = 5
  let spacing = 4
  let count_times_spacing = count * spacing
  var anims: RArray[ModelAnimation] = loadModelAnimations("resources/JoeSkinTexcoordDisplacerKickUpdate2Export.gltf")

  var frame : int32 = 0
  while not windowShouldClose():
    beginDrawing()
    clearBackground(Black)
    # Checkerboard
    drawTexture(backgroundTexture,
        Rectangle(x: 0, y: 0, width: getScreenWidth().float32, height: getScreenHeight().float32),
        Vector2.zero, White)

    # St Peters
    #drawTexture(texture,
    #    Rectangle(x: 0, y: 0, width: getScreenWidth().float32, height: getScreenHeight().float32),
    #    Vector2.zero, White)

    # Trees
    for x in countup(-count_times_spacing, count_times_spacing, spacing):
      if x != 0:
        for z in countup(-count_times_spacing, count_times_spacing, spacing):
          drawCube( Vector3(x:x.float32, y:1.5f, z:z.float32), 1, 1, 1, LIME );
          drawCube( Vector3(x:x.float32, y:0.5f, z:z.float32), 0.25f, 1, 0.25f, BROWN );
    beginMode3D(camera)
    updateCamera(camera, Orbital)

    # Animation
    beginShaderMode(shader)
    if anims.len > 0:
      for i in 0..<anims.len:
        var anim = move(anims[i])
        frame = frame + 1
        # Joe Kick
        updateModelAnimation(skyboxModel, anim, frame*250)
        drawModel(skyboxModel, Vector3(x: 0, y: -1, z: 4), 1.0f, White)

    if light.enabled == 1:
      drawSphere(light.position, 0.2, lightColor)
    drawPlane( Vector3( x:0f, y:0f, z:0f ), Vector2( x:50, y:50 ), BEIGE );
    endShaderMode()
    endMode3D()
    endDrawing()

main()
