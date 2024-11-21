{.passC: "-DSUPPORT_FILEFORMAT_HDR=1".}
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

  let skybox = genMeshCube(18.0f, 18.0f, 18.0f)
  #let skybox = genMeshSphere(18.0f, 18, 18)
  var skyboxModel = loadModelFromMesh(skybox)
  var joeModel = loadModel("resources/JoeSkinTexcoordDisplacerKickUpdate2Export.gltf")


  var camera = Camera(
    position: Vector3(x: 0, y: 0, z: 15),
    target: Vector3(x: 0, y: 0, z: 0),
    up: Vector3(x: 0, y: 1, z: 0),
    fovy: 45,
    projection: Perspective
  )
  updateCamera(camera, CameraMode.Orbital)
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
      position: Vector3(x: 0, y: 0, z: 2),
      target: Vector3(x: 0, y: 0, z: 0),
      color: [1.0'f32, 0.0'f32, 0.0'f32, 0.5'f32],
      intensity: 1.0f
    )
  let img = genImageChecked(64, 64, 32, 32, DarkBrown, DarkGray)
  let backgroundTexture = loadTextureFromImage(img)

  let hdrImage = loadImage("resources/images/all_probes/stpeters_cross.png")
  let hdrTexture = loadTextureCubemap(hdrImage, CubemapLayout.CrossThreeByFour)
  #let hdrTexture = loadTextureCubemap(hdrImage, CubemapLayout.Panorama)
  #let hdrTexture = loadTextureCubemap(hdrImage, CubemapLayout.AutoDetect)

  let images: array[6, Image] = [
    loadImage("resources/images/all_probes/stpeters_cross/stpeters_right.png"),
    loadImage("resources/images/all_probes/stpeters_cross/stpeters_left.png"),
    loadImage("resources/images/all_probes/stpeters_cross/stpeters_top.png"),
    loadImage("resources/images/all_probes/stpeters_cross/stpeters_bottom.png"),
    loadImage("resources/images/all_probes/stpeters_cross/stpeters_front.png"),
    loadImage("resources/images/all_probes/stpeters_cross/stpeters_back.png")
  ]
  let textures: array[6, Texture2D] = [
    loadTextureFromImage(images[0]),
    loadTextureFromImage(images[1]),
    loadTextureFromImage(images[2]),
    loadTextureFromImage(images[3]),
    loadTextureFromImage(images[4]),
    loadTextureFromImage(images[5])
  ]
  #let shader = loadShader("shaders/rlskybox.fs", "shaders/rlskybox.fs")
  #let texLoc0 = getShaderLocation(shader, "cubemap")
  #setShaderValueTexture(shader, texLoc0, hdrTexture)

  #skyboxModel.materials[0].shader = shader
  skyboxModel.materials[0].maps[MaterialMapIndex.Albedo].texture = textures[0]
  # skyboxModel.materials[0].maps[MaterialMapIndex.Albedo].texture = hdrTexture
  skyboxModel.materials[0].maps[MaterialMapIndex.Cubemap].texture = hdrTexture

  joeModel.materials[0].maps[MaterialMapIndex.Albedo].texture = textures[0]
  joeModel.materials[1].maps[MaterialMapIndex.Albedo].texture = textures[1]
  joeModel.materials[2].maps[MaterialMapIndex.Albedo].texture = textures[2]

  #let positionLoc = getShaderLocation(shader, "position")
  #setShaderValue(shader, positionLoc, camera.position)


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
  # Error checking for joeModel loading
  if joeModel.meshCount == 0:
    echo "Failed to load joeModel"
    return

  echo "Successfully loaded joeModel with ", joeModel.meshCount, " meshes"
  echo "Material count: ", joeModel.materialCount
  echo "Bone count: ", joeModel.boneCount

  # Try loading animations with error handling
  var animations: RArray[ModelAnimation]
  var animsCount: int32 = 0

  try:
    # First check if the joeModel has any bones
    if joeModel.boneCount >= 0:
      animations = loadModelAnimations("resources/JoeSkinTexcoordDisplacerKickUpdate2Export.gltf")
      animsCount = animations.len.int32
      echo "Successfully loaded ", animsCount, " animations"
    else:
      echo "Model has no bones for animation"
  except RaylibError:
    echo "Failed to load animations - continuing without animations"
    animsCount = 0


  var frame : int32 = 0
  while not windowShouldClose():
    let rotationAngles = Vector3(x:0.0, y:frame.float32/60, z:0.0) # Rotate around Y-axis
    beginDrawing()
    clearBackground(White)
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
    updateCamera(camera, Orbital)
    beginMode3D(camera)

    # Animation
    # beginShaderMode(shader)
    if animations.len > 0:
      for i in 0..<animations.len:
        var anim = move(animations[i])
        frame = frame + 1
        # Joe Kick
        updateModelAnimation(joeModel, anim, frame)
        # joeModel.transform = rotateXYZ(rotationAngles)
        drawModel(joeModel, Vector3(x: 0, y: -1, z: 4), 1.0f, White)

    # skyboxModel.transform = rotateXYZ(rotationAngles)
    drawModel(skyboxModel, Vector3(x: 0, y: 0, z: 1), 0.25f, White)

    drawSphere(light.position, 1, Green)
    if light.enabled == 1:
      drawSphere(light.position, 1, lightColor)
    #endShaderMode()
    endMode3D()
    endDrawing()

main()
