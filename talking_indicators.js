///////////////////////////////////////////////////////////////////////////

const CUSTOMS = {
	"334039742205132800": "blu", // blu
	"1092635593332248586": "blu", // blu_2
	"497844474043432961": "salty", // salty
	"412836292163010572": "subi", // subi
	"141323186259230721": "log", // log
	"383851442341019658": "karma", // karma
	// "754188427699945592": "log", // amy
	"148471246680621057": "debi", // devious
	"150398769651777538": "ans", // ans
	"284418122042310678": "soap", // soap
	"279777552858349579": "orko", // soap
	"334082720651149312": "makoni", // makoni
	"312939153002332160": "pablo", // pablo
	"675902623836274709": "neithan", // neithan
	"165257526185689089": "merp", // merp
	"292487528177598464": "chubbs", // chubbs
	"168179594392764427": "nobody", // nobody
}

const RIFFS = {
	"1092635593332248586": "blu", // blu 2
	"141323186259230721": "log", // log
	// "675902623836274709": "log", // neithan
	// "334082720651149312": "karma", // makoni
	"383851442341019658": "karma", // karma
	"497844474043432961": "salty", // salty
	"150398769651777538": "ans", // ans
}

const TRANSFORMS = {
	"blu": {scale: 1.2},
	"log": {scale: 1.5},
	"ans": {scale: 0.9},
	"subi": {scale: 1.25},
	"pablo": {scale: 1.8},
	"neithan": {scale: 1.8},
	"makoni": {scale: 2},
	"orko": {scale: 1.2},
}

///////////////////////////////////////////////////////////////////////////

var member_container = new Elem("indicators")

var current_voice_chat = {}
var prev_voice_chat = current_voice_chat

socket.on("connect", async () => {
	var member_objs = await socket.emitWithAck("sub_voice_status")
	refresh(member_objs)
})

var displayName = obj => { return (obj.member.nick || (obj.user.globalName || obj.user.username)) }

function reset() {
	member_container.clear()
	current_voice_chat = {}
}

function refresh(member_objs) {
	if (member_objs == null) { reset(); return }

	member_objs = member_objs.filter(obj => obj.voice_state.suppress == false)
	
	member_objs.sort((a, b) => {
		var a_level = genLevel(a)
		var b_level = genLevel(b)

		function genLevel(obj) {
			var level = 0

			var muted = (obj.voice_state.mute || obj.voice_state.selfMute)
			var deafen = (obj.voice_state.deaf || obj.voice_state.selfDeaf)
			// print(muted)

			if (Object.keys(CUSTOMS).includes(obj.user.id)) {
				if (!muted && !deafen) {
					level = 5
				} else if (!deafen) {
					level = 4
				} else {
					level = 3
				}
			} else {
				if (!muted && !deafen) {
					level = 2
				} else if (!deafen) {
					level = 1
				} else {
					level = 0
				}
			}

			return level 
		}

		if (a_level == b_level) {
			if (a_level > 2) {
				var a_val = Object.keys(CUSTOMS).indexOf(a.user.id)
				var b_val = Object.keys(CUSTOMS).indexOf(b.user.id)

				return (a_val - b_val)
			} else {
				if (displayName(a) < displayName(b)) { return -1 }
				if (displayName(a) > displayName(b)) { return 1 }
				if (displayName(a) == displayName(b)) { return 0 }
			}
		} else {
			return (b_level - a_level)
		}
	})

	reset()

	member_objs.forEach(member_obj => {
		// console.log(member_obj)
		newMember(member_obj.member, member_obj.user, member_obj.voice_state)
	})

	prev_voice_chat = Object.assign({}, current_voice_chat)
}

function newMember(member, user, voice_state) {
	// console.log(initial_voice_state)
	current_voice_chat[user.id] = voice_state
	posCache[user.id] = [0, 0, 1]

	var indicator = new Elem("img")
	indicator.id = user.id
	indicator.classes.add("indicator")
	indicator.setAttr("title", displayName({member, user}))
	indicator.setAttr("talking", false)
	indicator.setAttr("mute", (voice_state.mute || voice_state.selfMute))
	indicator.setAttr("deaf", (voice_state.deaf || voice_state.selfDeaf))

	print(Object.keys(prev_voice_chat))

	if (Object.keys(RIFFS).includes(member.userId) && (!Object.keys(prev_voice_chat).includes(member.userId))) {
		var riff = RIFFS[member.userId]
		playSound(`riffs/${riff}`, "wav", 1)
	}

	if (Object.keys(CUSTOMS).includes(member.userId)) {
		var custom = CUSTOMS[member.userId]
		indicator.src = `./talking_indicators/${CUSTOMS[member.userId]}_closed.png`
		if (Object.keys(TRANSFORMS).includes(custom)) {
			var transform = TRANSFORMS[custom]
			indicator.style.setProperty("transform", `scale(${transform.scale})`)
			// indicator.style.setProperty("height", `calc(80px * ${scale})`)
		}

		if (user.id == "334039742205132800") {
			indicator.style.setProperty("display", "none")
		}
	} else {
		indicator.src = (member.avatar ? `https://cdn.discordapp.com/guilds/${member.guildId}/users/${member.userId}/avatars/${member.avatar}.png` : `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`)
		indicator.classes.add("fallback")
	}

	member_container.addChild(indicator)
}

var tweens = {}

socket.on("sub_voice_status_update", async state => {
	if (!Array.isArray(tweens[state.userId])) { tweens[state.userId] = [] }

	var indicator = new Elem(state.userId)
	if (indicator == null) { return }
		
	var stateText = ["closed", "open"][state.speakingFlags]
	if (!["closed", "open"].includes(stateText)) { stateText = "closed" }

	indicator.setAttr("talking", Boolean(state.speakingFlags))

	if (Object.keys(CUSTOMS).includes(state.userId)) {
		indicator.src = `./talking_indicators/${CUSTOMS[state.userId]}_${stateText}.png`
	}

	const AMOUNT = 25
	const RESTING = 0
	const DURATION = 50
	const TALKING_SCALING = 1.2

	tweens[state.userId].forEach(int => {
		cancelTween(int)
	})

	if (stateText == "open") {
		var tween1 = tween(DURATION, EASE_OUT_QUART, (perc) => {
			var left_x = lerp(RESTING, AMOUNT, perc)
			var scale_x = lerp(1, TALKING_SCALING, perc)

			// indicator.style.setProperty("left", `${x}px`)
			// posCache[state.userId][0] = left_x
			// posCache[state.userId][1] = -left_x
			posCache[state.userId][2] = scale_x
		})
		tweens[state.userId].push(tween1)
	} else {
		var tween2 = tween(DURATION, EASE_OUT_QUART, (perc) => {
			var left_x = lerp(AMOUNT, RESTING, perc)
			var scale_x = lerp(TALKING_SCALING, 1, perc)

			// indicator.style.setProperty("left", `${x}px`)
			// posCache[state.userId][0] = left_x
			// posCache[state.userId][1] = -left_x
			posCache[state.userId][2] = scale_x
		})
		tweens[state.userId].push(tween2)
	}
})

socket.on("sub_voice_status_channel_update", member_objs => {
	console.log("new info: ", member_objs)
	refresh(member_objs)
})

//////////////////////////////////////////////////////////////////////

function angleDiff(ang1, ang2) {
    var diff = (ang2 - ang1 + 180) % 360 - 180
    return diff < -180 ? diff + 360 : diff
}

//////////////////////////////////////////////////////////////////////

Math.rad = (deg => (deg * Math.PI) / 180.0)
Math.deg = (rad => (rad * 180.0) / Math.PI)

const ANG_MIN = 0
const ANG_MAX = 90

var posCache = {}
var globalFrame = 0
var addSpeed = 0
var prev_elem_count = 0
function floatIndicators() {
	var WHOLE_WIDTH = member_container.elem.clientWidth
	var WHOLE_HEIGHT = member_container.elem.clientHeight

	var visible_elems = member_container.children.filter(elem => elem.style.getPropertyValue("display") != "none")
	if (visible_elems.length != prev_elem_count) {
		addSpeed = 30
		prev_elem_count = visible_elems.length
	}

	visible_elems.forEach((elem, ind) => {
		var BASE_X = -(elem.elem.clientWidth / 2) + (WHOLE_WIDTH / 2)
		var BASE_Y = -(elem.elem.clientHeight / 2) + (WHOLE_HEIGHT / 2)

		var ELEM_RADIUS = Math.sqrt(Math.pow(elem.elem.clientWidth, 2) + Math.pow(elem.elem.clientHeight, 2))

		var num = ind+1
		var id = elem.elem.id

		if (!Object.keys(posCache).includes(id)) {posCache[id] = [0, 0, 1]}

		// const SPEED = 0.01
		// posCache[id] = [posCache[id][0] + SPEED, posCache[id][1] + (SPEED / 2)]

		var angle = Math.rad(globalFrame + ((360 / visible_elems.length) * num))

		var final_x = (BASE_X + (Math.cos(angle) * (720/4)))
		var final_y = (BASE_Y + (Math.sin(angle) * (720/2.5)))

		elem.style.setProperty("left", `${final_x + posCache[id][0]}px`)
		elem.style.setProperty("top", `${final_y + posCache[id][1]}px`)

		var custom = CUSTOMS[id]
		var transform = TRANSFORMS[custom]

		var distPerc = (Math.abs(angleDiff(0, Math.deg(angle))) / 180)
		var distScale = lerp(0.5, 2, distPerc)

		if (transform) {
			var realScale = (((transform.scale - 1) + posCache[id][2]) * distScale)
		} else {
			var realScale = (posCache[id][2] * distScale)
		}

		elem.style.setProperty("transform", `rotate(50deg) scale(${realScale})`)
	})

	requestAnimationFrame(floatIndicators)

	globalFrame += (1 + addSpeed)

	if (addSpeed > 0.05) { addSpeed /= 1.0333 } else { addSpeed = 0 }
}

floatIndicators()