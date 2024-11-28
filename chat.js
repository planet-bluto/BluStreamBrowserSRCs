const OPACITY_STEP = 0.08
const SCALE_STEP = 0.075
const LERP_STEP = 0.3

var chat_elems = []

var messageCache = []

var messagesLoaded = false

socket.on("connect", () => {
	socket.emitWithAck("sub_chat").then(res => {
		// print(res)

		res.messages.forEach(message_payload => {
			appendMessage(message_payload)
		})
		
		setTimeout(() => {messagesLoaded = true}, 1)
	})
})


socket.on("add", appendMessage)
socket.on("edit", editMessage)
socket.on("remove", removeMessage)



var PLATFORMS = {
	"twitch": "./assets/images/twitch.png",
	"discord": "./assets/images/discord.png",
	"youtube": "./assets/images/youtube.png",	
}

var messages = new Elem("messages")

var tween_int;
messages.watch({childList: true}, (mutation) => {
	const sizeScale = 0.5

	cancelAllTweens()
	
	if (mutation.addedNodes.length <= 0) { return }

	var messagesElem = mutation.target
	var newElemSize = mutation.addedNodes[0].clientHeight
	var durationPerc = (messagesLoaded ? (newElemSize / (58 * sizeScale)) : 0)
	
	var currScroll = (newElemSize * 1)
	var targetScroll = 0
	tween_int = tween(200*durationPerc, EASE_OUT_QUART, (perc) => {
		var x = lerp(currScroll, targetScroll, perc)
		// print(x)
		// messagesElem.scrollTop = x
		messagesElem.style.setProperty("margin-top", `-${x}px`)
	})
})

function format(str) {
	str = str.toUpperCase()
	str = ">" + str
	str = str.replaceAll(" ", "_")
	// str = str + "..."
	return str
}

const BADGE_TRANSFORM = {
	"./assets/icons/people.png": "scale(1.5)",
	"./assets/icons/sub.png": "scale(1.5)",
	"./assets/icons/gift.png": "scale(1.25)",
	"./assets/icons/money.png": "scale(1.5)",
	"./assets/icons/system.png": "scale(1.5)",
	"./assets/icons/blubot.png": "scale(1.5)",
}
function appendMessage(message_payload) {
	print(message_payload)
	// print(text)
	if (messagesLoaded) {
		playSound(message_payload.sound)
		// if (flags.includes("notif") || flags.includes("notif_sound_only")) {
		// 	playSound("blubot_notif", "wav", 1)
		// } else if (flags.includes("spark_notif")) {
		// 	playSound("spark_notif", "wav", 0.75)
		// } else {
		// 	playSound("chat_blip")
		// }
	}

	var message_div = new Elem("div")
	message_div.classes.add("message-containter")

	message_div.style.setProperty(`--header-color`, message_payload.style.header_color)
	message_div.style.setProperty(`--border-color`, message_payload.style.border_color)
	message_div.setAttr(`flashing`, message_payload.style.flashing)

	// print(flags)

	// flags.forEach(flag => {
	// 	if (flag.startsWith("redeem_")) {
	// 		message_div.setAttr("redeem", true)
	// 		var redeemColor = flag.split("_")[1]
	// 		message_div.style.setProperty(`--redeem-color`, redeemColor)
	// 	} else {
	// 		message_div.setAttr(flag, true)
	// 	}
	// })


	if (Object.keys(PLATFORMS).includes(message_payload.platform)) {
		var platform_icon = new Elem("img")
		platform_icon.src = PLATFORMS[message_payload.platform]
		platform_icon.classes.add("message-platform")
	}


	var right_container = new Elem("div")
	right_container.classes.add("message-right-container")

	var message_header_container = new Elem("div")
	message_header_container.classes.add("message-author-container")

	var badge_container = new Elem("div")
	badge_container.classes.add("message-badge-container")

	message_payload.badges.forEach(badge => {
		var badge_elem = new Elem("img")
		badge_elem.src = badge
		badge_elem.classes.add("message-badge")

		if (Object.keys(BADGE_TRANSFORM).includes(badge)) {
			badge_elem.style.setProperty("transform", BADGE_TRANSFORM[badge])
		}

		badge_container.addChild(badge_elem)
	})
	message_header_container.addChild(badge_container)

	var message_header = new Elem("p")
	message_header.text = (message_payload.style.header_format ? format(message_payload.header) : message_payload.header)
	message_header.style = `color: ${message_payload.style.header_color}`
	message_header.classes.add("message-author")

	var message_header_stroke = new Elem("p")
	message_header_stroke.text = (message_payload.style.header_format ? format(message_payload.header) : message_payload.header)
	message_header_stroke.style = `color: ${message_payload.style.header_color}`
	message_header_stroke.classes.add("message-author")
	message_header_stroke.setAttr("stroke")

	message_header_container.addChild(message_header_stroke)
	message_header_container.addChild(message_header)

	var message_content = new Elem("p")
	message_content.html = twemoji.parse(message_payload.content)
	message_content.classes.add("message-text")

	right_container.addChild(message_header_container)
	right_container.addChild(message_content)


	if (Object.keys(PLATFORMS).includes(message_payload.platform)) { message_div.addChild(platform_icon) }
	message_div.addChild(right_container)


	if (messages.children.length > 0) {
		messages.elem.insertBefore(message_div.elem, messages.children[0].elem)
	} else {
		messages.addChild(message_div)
	}

	message_header.style.setProperty("--badges-width", `${badge_container.elem.clientWidth}px`)
	message_header_stroke.style.setProperty("--badges-width", `${badge_container.elem.clientWidth}px`)
	
	message_div.style.setProperty("opacity", 1)

	var chat_elem_ind = chat_elems.length
	chat_elems.push(message_div)
	messageCache.push(Object.assign(message_payload, {elem: message_div.elem, chat_elem_ind}))
}

function editMessage(id, message) {
	// Object.assign on this hoe
}

function removeMessage(ids) {
	print("Removing: ", ids)
	var to_remove = []
	var soundPlayed = false

	messageCache = messageCache.filter(msgObj => {
		var remove = ids.includes(msgObj.id)

		if (remove) {
			to_remove.push(msgObj.chat_elem_ind)
			// Explosion anim here...
			var img = new Image()
			img.src = "assets/images/EXPLODE.gif"
			img.classList.add("explosion")
			img.style.setProperty("--y", `${msgObj.elem.offsetTop}px`)
			document.body.appendChild(img)

			if (!soundPlayed) { playSound("$explode.mp3", 0.25) }
			soundPlayed = true

			msgObj.elem.remove()

			setTimeout(() => {
				img.remove()
			}, 1360)
		}

		return (!remove)
	})

	chat_elems = chat_elems.filter(elem => {
		var ind = chat_elems.indexOf(elem)
		return ((!to_remove.includes(ind)) || null)
	})

	// print(chat_elems)
}

function anim() {
	chat_elems.forEach((chat_elem, r_ind) => {
		var ind = (chat_elems.length - r_ind)
		// chat_elem.style = "opacity: 0.5"
		var target_opacity = (1-(OPACITY_STEP * ind)) + OPACITY_STEP
		var curr_opacity = Number(chat_elem.style.getPropertyValue("opacity"))

		var target_scale = (1-(SCALE_STEP * ind))
		var curr_scale = Number(chat_elem.style.getPropertyValue("--scale"))

		chat_elem.style.setProperty("opacity", lerp(curr_opacity, target_opacity, LERP_STEP))

		var new_scale = lerp(curr_scale, target_scale, LERP_STEP)
		var translate_y = 0
		// chat_elem.style.setProperty("transform", `scale(${new_scale}) translate(0px, ${translate_y}px)`)
		// chat_elem.style.setProperty("--scale", new_scale)
	})
	requestAnimationFrame(anim)
}

anim()