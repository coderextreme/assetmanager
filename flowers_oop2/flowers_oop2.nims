when defined(emscripten):
  --define:GraphicsApiOpenGlEs3
  # --define:NaylibWebResources
  # switch("define", "NaylibWebResourcesPath=resources")
  # switch("define", "NaylibWebPthreadPoolSize=2")
  # --define:NaylibWebAsyncify
  --os:linux
  --cpu:wasm32
  --cc:clang
  when buildOS == "windows":
    --clang.exe:emcc.bat
    --clang.linkerexe:emcc.bat
    --clang.cpp.exe:emcc.bat
    --clang.cpp.linkerexe:emcc.bat
  else:
    --clang.exe:emcc
    --clang.linkerexe:emcc
    --clang.cpp.exe:emcc
    --clang.cpp.linkerexe:emcc
  # --mm:orc
  --threads:on
  --panics:on
  --define:noSignalHandler
  --passL:"-o index.html"
  # Use raylib/src/shell.html or raylib/src/minshell.html
  --passL:"--shell-file C:/raylib/raylib/src/minshell.html"
  --passL:"--preload-file resources/shaders/300es/skyboxShader.vs@/skyboxShader.vs"
  --passL:"--preload-file resources/shaders/300es/skyboxShader.fs@/skyboxShader.fs"
  --passL:"--preload-file resources/shaders/300es/modelShader.vs@/modelShader.vs"
  --passL:"--preload-file resources/shaders/300es/modelShader.fs@/modelShader.fs"
  --passL:"--preload-file resources/images/all_probes/stpeters_cross.png@/stpeters_cross.png"
  --passL:"-s USE_GLFW=3"
  --passL:"-s ASYNCIFY"
