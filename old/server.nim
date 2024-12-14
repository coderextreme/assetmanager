import std/net
let socket = newSocket()
socket.bindAddr(Port(12345))
socket.listen()

# You can then begin accepting connections using the `accept` procedure.
var client: Socket
var address = ""
while true:
  socket.acceptAddr(client, address)
  echo "Client connected from: ", address
  client.send("hello there\n")
  let response = client.recvLine()
  echo response

