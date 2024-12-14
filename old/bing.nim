import raylib, raymath, rlgl, std/[strformat, lenientops]

const
  screenWidth = 800
  screenHeight = 450

when defined(GraphicsApiOpenGl33):
  const
    glslVersion = 330
else:
  const
    glslVersion = 120

proc isValidLocation(loc: ShaderLocation): bool =
  return loc.int32 != -1.int32

proc checkGLError() =
    let a = 1 + 2

proc main =
  # Initialization
  # --------------------------------------------------------------------------------------
  initWindow(screenWidth, screenHeight, "JSONverse shaders example - rhodonea")
  defer: closeWindow()
  var mesh = genMeshSphere(4, 64, 64)
  var model = loadModelFromMesh(move(mesh))
  var shader = loadShader(&"shaders/glsl{glslVersion}/rlsimplified.vs",
      &"shaders/glsl{glslVersion}/rlnotexture.fs")

  if model.meshCount == 0:
    echo "Failed to load model"
  if shader.id == 0:
    echo "Failed to load shader"

  model.materials[0].shader = shader

  let img = genImageChecked(64, 64, 32, 32, DarkBrown, DarkGray)
  let backgroundTexture = loadTextureFromImage(img)

  var camera = Camera(
    position : Vector3( x:0.0f, y:0.0f, z:10.0f ),
    target :   Vector3( x:0.0f, y:0.0f, z:0.0f ),
    up :       Vector3( x:0.0f, y:1.0f, z:0.0f ),
    fovy : 45.0f,
    projection : Perspective
  )

  let aLoc = getShaderLocation(shader, "a")
  echo "Location for 'a'", aLoc.int32
  let bLoc = getShaderLocation(shader, "b")
  echo "Location for 'b'", bLoc.int32
  let cLoc = getShaderLocation(shader, "c")
  echo "Location for 'c'", cLoc.int32
  let dLoc = getShaderLocation(shader, "d")
  echo "Location for 'c'", dLoc.int32
  let tdeltaLoc = getShaderLocation(shader, "tdelta")
  echo "Location for 'tdelta'", tdeltaLoc.int32
  let pdeltaLoc = getShaderLocation(shader, "pdelta")
  echo "Location for 'pdelta'", pdeltaLoc.int32

  if not isValidLocation(aLoc):
    echo "Bad location for 'a'", aLoc.int32
  if not isValidLocation(bLoc):
    echo "Bad location for 'b'", bLoc.int32
  if not isValidLocation(cLoc):
    echo "Bad location for 'c'", cLoc.int32
  if not isValidLocation(dLoc):
    echo "Bad location for 'd'", dLoc.int32
  if not isValidLocation(tdeltaLoc):
    echo "Bad location for tdelta'", tdeltaLoc.int32
  if not isValidLocation(pdeltaLoc):
    echo "Bad location for 'pdelta'", pdeltaLoc.int32

  let a: float32 = 20
  let b: float32 = 20
  let c: float32 = 4
  let d: float32 = 4
  let tdelta: float32 = 0
  let pdelta: float32 = 0

  setTargetFPS(60)

  var frame = 0
  while not windowShouldClose():
    frame = frame + 1
    beginDrawing()
    checkGLError() 
    clearBackground(Black)
    checkGLError() 
    drawTexture(backgroundTexture,
      Rectangle(x: 0, y: 0, width: getScreenWidth().float32, height: getScreenHeight().float32),
      Vector2.zero, White)
    checkGLError() 

    beginMode3D(camera)
    checkGLError() 
    updateCamera(camera, Orbital)
    checkGLError() 
    beginShaderMode(shader)
    checkGLError() 

    let screenSize = [getScreenWidth().float32, getScreenHeight().float32]
    checkGLError() 
    setShaderValueV(shader, getShaderLocation(shader, "size"), screenSize)
    checkGLError() 
    let modelMatrix = identity(typedesc[Matrix])
    let viewMatrix = getCameraMatrix(camera)
    let projectionMatrix = perspective(45.0 * 3.141592654/180.0, float32(screenWidth) / float32(screenHeight), 0.1, 100.0)
    setShaderValueMatrix(shader, getShaderLocation(shader, "model"), modelMatrix)
    checkGLError() 
    setShaderValueMatrix(shader, getShaderLocation(shader, "view"), viewMatrix)
    checkGLError() 
    setShaderValueMatrix(shader, getShaderLocation(shader, "projection"), projectionMatrix)
    checkGLError() 

#    echo "Setting 'a' to: ", a
#    setShaderValue(shader, aLoc, a.float32)
#    echo "Setting 'b' to: ", b
#    setShaderValue(shader, bLoc, b.float32)
#    echo "Setting 'c' to: ", c
#    setShaderValue(shader, cLoc, c.float32)
#    echo "Setting 'd' to: ", d
#    setShaderValue(shader, dLoc, d.float32)
#    echo "Setting 'tdelta' to: ", pdelta
#    setShaderValue(shader, tdeltaLoc, tdelta.float32)
#    echo "Setting 'pdelta' to: ", pdelta
#    setShaderValue(shader, pdeltaLoc, pdelta.float32)

#    echo "a is ", getShaderValue(shader, aLoc)
#    echo "b is ", getShaderValue(shader, bLoc)
#    echo "c is ", getShaderValue(shader, cLoc)
#    echo "d is ", getShaderValue(shader, dLoc)
#    echo "tdelta is ", getShaderValue(shader, tdeltaLoc)
#    echo "pdelta is ", getShaderValue(shader, pdeltaLoc)

    drawModelWires(model, Vector3(x:0, y:0, z:0), 0.5f, Blue)
    checkGLError() 

    endShaderMode()
    checkGLError() 
    endMode3D()
    checkGLError() 
    endDrawing()
    checkGLError() 

main()

