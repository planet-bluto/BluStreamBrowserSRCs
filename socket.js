const socket = io("http://192.168.1.237:5483/")

socket.on("connect", () => {
	print("Connected.")
});