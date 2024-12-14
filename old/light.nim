import raylib

const
  screenWidth = 800
  screenHeight = 450

type
  LightKind = enum # Light type
    Directional, Point, Spot

  Light = object # Light data
    enabled: bool
    kind: LightKind
    position: Vector3
    target: Vector3
    color: Color
    intensity: float32

initWindow(screenWidth, screenHeight, "Naylib Light Example")

# Set up camera
var camera = Camera3D(
  position: Vector3(x: 10, y: 10, z: 10),
  target: Vector3(x: 0, y: 0, z: 0),
  up: Vector3(x: 0, y: 1, z: 0),
  fovy: 45,
  projection: Perspective
)

# Create a light
var light = Light(
  kind: LightKind.Point,
  position: Vector3(x: 0, y: 4, z: 2),
  target: Vector3(x: 0, y: 0, z: 0),
  color: White,
  enabled: true
)

# Create basic material
var material = loadMaterialDefault()
material.maps[MaterialMapIndex.Albedo].color = Red

setTargetFPS(60)

while not windowShouldClose():
  updateCamera(camera, Orbital)
  
  beginDrawing()
  clearBackground(RayWhite)
  beginMode3D(camera)
  updateLightValues(material, light)
  
  # Draw a cube to show lighting effect
  drawCube(Vector3(x: 0, y: 0, z: 0), 2, 2, 2, Red)
      
  # Draw light position (small sphere)
  drawSphere(light.position, 0.2, Yellow)
      
  drawFPS(10, 10)
  endMode3D()
  endDrawing()

material.unload()
closeWindow()
