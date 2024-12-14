import std/net, std/rdstdin
let socket = newSocket()
socket.connect("127.0.0.1", Port(12345))
var line: string
while true:
  let ok = readLineFromStdin("How are you? ", line)
  echo line
  if ok:
    socket.send(line)
  let response = socket.recvLine()
  echo response
