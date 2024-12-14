import raylib, raymath, rlgl

const
  screenWidth = 960
  screenHeight = 540
  vertexShader = """#version 330
"""
  fragmentShader = """#version 330
in vec2 fragTexCoord;
in vec4 fragColor;
uniform vec4 customColor;
uniform sampler2D texture0;
uniform float mixAmount;
out vec4 finalColor;
void main() {
    vec4 texColor = texture(texture0, fragTexCoord);
    finalColor = mix(texColor, customColor, mixAmount);
}
"""

proc main() =
  initWindow(screenWidth, screenHeight, "JSONverse shaders example - rhodonea")

  var shader = loadShaderFromMemory(vertexShader, fragmentShader)
  var customColorLoc = getShaderLocation(shader, "customColor")
  var mixAmountLoc = getShaderLocation(shader, "mixAmount")

  echo "location color", customColorLoc.int
  echo "location mix", mixAmountLoc.int

  var checkerboard = genImageChecked(256, 256, 32, 32, Black, White)
  var texture = loadTextureFromImage(checkerboard)

  var mixAmount = 0.5f

  var customColorNormalized = Vector3(x: 1.0f, y: 1.0f, z: 1.0f)

  setTargetFPS(60)

  while not windowShouldClose():
    setShaderValue(shader, customColorLoc, customColorNormalized)
    setShaderValue(shader, mixAmountLoc, mixAmount)
    beginDrawing()
    clearBackground(White)
            
    beginShaderMode(shader)
    drawTexture(texture, Rectangle(width:getScreenWidth().float32, height:getScreenHeight().float32), Vector2.zero, White)
    endShaderMode()

    drawText("Press LEFT/RIGHT to adjust mix amount", 10, 10, 20, Black)
    drawText("Press R/G/B to change color", 10, 40, 20, Black)
    endDrawing()

    if isKeyDown(Left):
      mixAmount = clamp(mixAmount - 0.01f, 0.0f, 1.0f)
    if isKeyDown(Right):
      mixAmount = clamp(mixAmount + 0.01f, 0.0f, 1.0f)

    if isKeyPressed(R):
      customColorNormalized = Vector3(x: 1.0f, y: 0.0f, z: 0.0f)
    if isKeyPressed(G):
      customColorNormalized = Vector3(x: 0.0f, y: 1.0f, z: 0.0f)
    if isKeyPressed(B):
      customColorNormalized = Vector3(x: 0.0f, y: 0.0f, z: 1.0f)

  closeWindow()

main()
