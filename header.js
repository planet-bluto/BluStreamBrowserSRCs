var localStorage = window.localStorage
if (!localStorage.getItem("header")) { localStorage.setItem("header", "") }

var headerElem = new Elem("header")
setHeader(localStorage.getItem("header"))
setEmote(localStorage.getItem("header_emote"))

socket.on("header_update", setHeader)
socket.on("header_emote_update", setEmote)

function setHeader(newHeader) {
	localStorage.setItem("header", newHeader)

	var header_bits = newHeader.split(" ")
	newHeader = header_bits.join(" ")

	var blutoformatting = format(newHeader)
	headerElem.html = twemoji.parse(blutoformatting)
}

function setEmote(emote_name) {
	localStorage.setItem("header_emote", emote_name)
	var path = `assets/emotes/${emote_name}.png`
	new Elem("icon").src = path
}

function format(str) {
	str = str.toUpperCase()
	str = ">" + str
	str = str.replaceAll(" ", "_")
	str = str + "..."
	return str
}

// function saveHeader() {
// 	headerElem.html = twemoji.parse(e.target.value)
// 	localStorage.setItem("header", headerElem.elem.value)
// }

// headerElem.on("change", saveHeader)
// headerElem.on("input", saveHeader)