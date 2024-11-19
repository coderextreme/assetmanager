import raylib, raymath, rlgl, random, math

const
  screenWidth = 960
  screenHeight = 540
  vertexSkyboxShader = "resources/shaders/glsl330/skyboxShader.vs"
  fragmentSkyboxShader = "resources/shaders/glsl330/skyboxShader.fs"

  vertexModelShader = "resources/shaders/glsl330/modelShader.vs"
  fragmentModelShader = "resources/shaders/glsl330/modelShader.fs"

const
  MaxFlowerParam = 20.0
  MinFlowerParam = -20.0
  VelocityStep = 0.02
  VelocityBias = 0.01
  Flowers = 25

type
  Flower = object
    chromaticDispersion: Vector3
    bias: float32
    scale: float32
    power: float32
    a: float32
    b: float32
    c: float32
    d: float32
    tdelta: float32
    pdelta: float32
    cubemapModelLoc: ShaderLocation
    chromaticDispersionLoc: ShaderLocation
    biasLoc: ShaderLocation
    scaleLoc: ShaderLocation
    powerLoc: ShaderLocation
    aLoc: ShaderLocation
    bLoc: ShaderLocation
    cLoc: ShaderLocation
    dLoc: ShaderLocation
    tdeltaLoc: ShaderLocation
    pdeltaLoc: ShaderLocation
    viewLoc: ShaderLocation
    model: ref Model
    modelShader: ref Shader
    translation: Vector3
    velocity: Vector3

proc initialize(self: var Flower) =
  self.translation = Vector3(x: 0, y: 0, z: 0)
  self.velocity = Vector3(x: rand(1.0) * 0.02 - 0.01, y: rand(1.0) * 0.02 - 0.01, z: rand(1.0) * 0.02 - 0.01)

proc build(self: var Flower; model: sink ref Model, modelShader: sink ref Shader) =
  self.model = model
  self.modelShader = modelShader

  self.cubemapModelLoc = getShaderLocation(self.modelShader[], "environmentMap")
  self.chromaticDispersionLoc = getShaderLocation(self.modelShader[], "chromaticDispersion")
  self.biasLoc = getShaderLocation(self.modelShader[], "bias")
  self.scaleLoc = getShaderLocation(self.modelShader[], "scale")
  self.powerLoc = getShaderLocation(self.modelShader[], "power")
  self.aLoc = getShaderLocation(self.modelShader[], "a")
  self.bLoc = getShaderLocation(self.modelShader[], "b")
  self.cLoc = getShaderLocation(self.modelShader[], "c")
  self.dLoc = getShaderLocation(self.modelShader[], "d")
  self.tdeltaLoc = getShaderLocation(self.modelShader[], "tdelta")
  self.pdeltaLoc = getShaderLocation(self.modelShader[], "pdelta")
  self.viewLoc = getShaderLocation(self.modelShader[], "view")

  echo "environmentMap ", self.cubemapModelLoc.int32
  echo "chromaticDispersion ", self.chromaticDispersionLoc.int32
  echo "bias ", self.biasLoc.int32
  echo "scale ", self.scaleLoc.int32
  echo "power ", self.powerLoc.int32
  echo "a ", self.aLoc.int32
  echo "b ", self.bLoc.int32
  echo "c ", self.cLoc.int32
  echo "d ", self.dLoc.int32
  echo "tdelta ", self.tdeltaLoc.int32
  echo "pdelta ", self.pdeltaLoc.int32
  echo "view ", self.viewLoc.int32

  self.chromaticDispersion = Vector3(x:0.98, y:1, z:1.033)
  self.bias = 0.5
  self.scale = 0.5
  self.power = 2.0
  self.a = 20
  self.b = 10
  self.c = 4
  self.d = 4
  self.tdelta = 0.1
  self.pdelta = 0.1
  var mapIndex = MaterialMapIndex.Cubemap.int32

  var screenSize = [getScreenWidth().float32, getScreenHeight().float32]

  setShaderValue(self.modelShader[], getShaderLocation(self.modelShader[], "size"), screenSize)
  setShaderValue(self.modelShader[], self.cubemapModelLoc, mapIndex)

  initialize(self)

proc animate(self: var Flower, camera: var Camera3D) =
  var viewMatrix = getCameraMatrix(camera)

  setShaderValue(self.modelShader[], self.chromaticDispersionLoc, self.chromaticDispersion)
  setShaderValue(self.modelShader[], self.biasLoc, self.bias.float32)
  setShaderValue(self.modelShader[], self.scaleLoc, self.scale.float32)
  setShaderValue(self.modelShader[], self.powerLoc, self.power.float32)
  setShaderValue(self.modelShader[], self.aLoc, self.a.float32)
  setShaderValue(self.modelShader[], self.bLoc, self.b.float32)
  setShaderValue(self.modelShader[], self.cLoc, self.c.float32)
  setShaderValue(self.modelShader[], self.dLoc, self.d.float32)
  setShaderValue(self.modelShader[], self.tdeltaLoc, self.tdelta.float32)
  setShaderValue(self.modelShader[], self.pdeltaLoc, self.pdelta.float32)
  setShaderValueMatrix(self.modelShader[], self.viewLoc, viewMatrix)

  beginShaderMode(self.modelShader[])
  drawModel(self.model[], self.translation, 0.04f, White)
  endShaderMode()

  self.a += rand(1.0) * 0.02 - 0.1f
  if self.a > MaxFlowerParam:
    self.a = MaxFlowerParam
  if self.a < MinFlowerParam:
    self.a = MinFlowerParam

  self.b += rand(1.0) * 0.02 - 0.1f
  if self.b > MaxFlowerParam:
    self.b = MaxFlowerParam
  if self.b < MinFlowerParam:
    self.b = MinFlowerParam

  self.c += rand(1.0) * 0.5 - 0.25
  if self.c > 5:
    self.c = 5
  if self.c < -5:
    self.c = -5

  self.d += rand(1.0) * 0.5 - 0.25
  if self.d > 5:
    self.d = 5
  if self.d < -5:
    self.d = -5

  self.translation = Vector3(
    x:self.translation.x + self.velocity.x,
    y:self.translation.y + self.velocity.y,
    z:self.translation.z + self.velocity.z)

  for f in 0..<3:
    if system.abs(self.translation.x) > 10:
      initialize(self)
    elif system.abs(self.translation.y) > 10:
      initialize(self)
    elif system.abs(self.translation.z) > 10:
      initialize(self)
    else:
      self.velocity.x += rand(1.0) * 0.02 - 0.01
      self.velocity.y += rand(1.0) * 0.02 - 0.01
      self.velocity.z += rand(1.0) * 0.02 - 0.01

const
  OrbitSpeed = 0.5f
  MinDistance = 5.0f
  MaxDistance = 15.0f

type
  OrbitCamera = object
    camera: Camera3D
    angle: float32
    distance: float32
    target: Vector3

proc initOrbitCamera(): OrbitCamera =
  result = OrbitCamera(
    camera: Camera3D(
      position: Vector3(x: 2.0f, y: 2.0f, z: 2.0f),
      target: Vector3(x: 0.0f, y: 0.0f, z: 0.0f),
      up: Vector3(x: 0.0f, y: 1.0f, z: 0.0f),
      fovy: 45.0f,
      projection: Perspective
    ),
    angle: 0.0f,
    distance: 10.0f,
    target: Vector3(x: 0.0f, y: 0.0f, z: 0.0f)
  )

proc updateOrbitCamera(orbit: var OrbitCamera) =
  # Handle mouse input for rotation
  if isMouseButtonDown(MouseButton.Left):
    let deltaX = getMouseDelta().x
    orbit.angle -= deltaX * OrbitSpeed * getFrameTime()

  # Handle mouse wheel for zoom
  let wheel = getMouseWheelMove()
  if wheel != 0.0f:
    orbit.distance = clamp(orbit.distance - wheel, MinDistance, MaxDistance)

  # Calculate new camera position
  orbit.camera.position.x = orbit.target.x + sin(orbit.angle) * orbit.distance
  orbit.camera.position.z = orbit.target.z + cos(orbit.angle) * orbit.distance
  orbit.camera.position.y = orbit.target.y + orbit.distance * 0.5f

proc main() =
  # Initialization
  # --------------------------------------------------------------------------------------
  initWindow(screenWidth, screenHeight, "JSONverse shaders example - rhodonea")
  defer: closeWindow()

  var cube = genMeshCube(4.0f, 4.0f, 4.0f)
  var skybox = loadModelFromMesh(cube)
  var skyboxShader = loadShader(vertexSkyboxShader, fragmentSkyboxShader)
  skybox.materials[0].shader = skyboxShader

  var image = loadImage("resources/images/all_probes/stpeters_cross.png")  # TODO Replace with your texture path

  var cubemap = loadTextureCubemap(image, CubemapLayout.AutoDetect)
  reset(image)

  skybox.materials[0].maps[MaterialMapIndex.Cubemap].texture = cubemap

  var img = genImageChecked(64, 64, 32, 32, DarkBrown, DarkGray)
  var backgroundTexture = loadTextureFromImage(img)

  var flowers: seq[Flower]
  flowers.setLen(Flowers)

  let sphere = genMeshSphere(10, 64, 64)
  var flowerModel: ref Model
  new(flowerModel)
  flowerModel[] = loadModelFromMesh(sphere)
  var flowerShader: ref Shader
  new(flowerShader)
  flowerShader[] = loadShader(vertexModelShader, fragmentModelShader)
  flowerModel[].materials[0].shader = flowerShader[]

  flowerModel[].materials[0].maps[MaterialMapIndex.Cubemap].texture = cubemap

  for f in 0..<flowers.len:
    build(flowers[f], flowerModel, flowerShader)

  var cubemapSkyboxLoc = getShaderLocation(skyboxShader, "environmentMap")
  echo "environmentMap ", cubemapSkyboxLoc.int32

  var screenSize = [getScreenWidth().float32, getScreenHeight().float32]
  var mapIndex: int32 = MaterialMapIndex.Cubemap.int32

  setShaderValue(skyboxShader, getShaderLocation(skyboxShader, "size"), screenSize)
  setShaderValue(skyboxShader, cubemapSkyboxLoc, mapIndex)

  setTargetFPS(60)

  var orbit = initOrbitCamera()

  while not windowShouldClose(): # Detect window close button or ESC key
    updateOrbitCamera(orbit)
    beginDrawing()
    clearBackground(White)
    drawTexture(backgroundTexture,
      Rectangle(x: 0, y: 0, width: getScreenWidth().float32, height: getScreenHeight().float32),
      Vector2.zero, White)
    beginMode3D(orbit.camera)

    disableBackfaceCulling()

    for f in 0..<flowers.len:
      animate(flowers[f], orbit.camera)

    beginShaderMode(skyboxShader)
    drawModel(skybox, Vector3(x: 0, y: 0, z: 0), 10.0f, White)
    endShaderMode()

    enableBackfaceCulling()
    endMode3D()

    drawFPS(0,0)
    endDrawing()

main()
