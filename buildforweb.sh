nim c -d:emscripten -d:release -d:GraphicsApiOpenGlEs3 -d:NaylibWebAsyncify -d:NaylibWebResources flowers_oop2.nim
echo http://localhost:1337/flowers_oop2.nim.html
nimhttpd -H:"Cross-Origin-Opener-Policy: same-origin" -H:"Cross-Origin-Embedder-Policy: require-corp"
