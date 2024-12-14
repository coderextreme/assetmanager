import raylib, raymath

proc main =
  var skyboxModel = loadModel("resources/JoeSkinTexcoordDisplacerKickUpdate2Export.gltf")
  var anims: RArray[ModelAnimation] = loadModelAnimations("resources/JoeSkinTexcoordDisplacerKickUpdate2Export.gltf")
  if anims.len > 0:
    for i in 0..<anims.len:
      var anim = move(anims[i])
      updateModelAnimation(skyboxModel, anim, int32(getFrameTime() * 60))

main()
