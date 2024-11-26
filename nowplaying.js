const socket = io("http://localhost:8080/")

const LOADING = {
    "type": "SOUNDCLOUD",
    "title": "LOADING...",
    "author": "LOADING...",
    "thumbnail": "https://i.imgur.com/dXlpOUH.png",
    "url": "",
    "streams": {
        "start": "/mediastart?url=https%3A%2F%2Fsoundcloud.com%2Freek_wobs%2Fsuper-sex-delivery-2-enter-the-cum-zonefc-hitech-frontier-01",
        "mid": "/media?url=https%3A%2F%2Fsoundcloud.com%2Freek_wobs%2Fsuper-sex-delivery-2-enter-the-cum-zonefc-hitech-frontier-01"
    },
    "tags": []
}

const NOTHING = {
    "type": "SOUNDCLOUD",
    "title": "Nothing",
    "author": "",
    "thumbnail": "https://i.imgur.com/dXlpOUH.png",
    "url": "",
    "streams": {
        "start": "/mediastart?url=https%3A%2F%2Fsoundcloud.com%2Freek_wobs%2Fsuper-sex-delivery-2-enter-the-cum-zonefc-hitech-frontier-01",
        "mid": "/media?url=https%3A%2F%2Fsoundcloud.com%2Freek_wobs%2Fsuper-sex-delivery-2-enter-the-cum-zonefc-hitech-frontier-01"
    },
    "tags": []
}

var inited = false
socket.on("connect", () => {
	print("Connected.")
	socket.emit("$reg_nowplaying")
	socket.emit("$reg_progress")
	socket.emit("$reg_status")
	if (!inited) { updateMeta({track: LOADING}) }
	inited = true
})

socket.on("nowplaying", updateMeta)
socket.on("progress", updateProgress)
socket.on("status", updateStatus)

var title_elem = new Elem("song-title")
var author_elem = new Elem("song-author")
var thumbnail_elem = new Elem("song-thumbnail")
var thumbcont_elem = new Elem("thumbnail-cont")
var tid = -1
var curr_left = 0

var vinyl_movements = []
async function updateMeta({track}) {
	if (track == null) { track = NOTHING }

	title_elem.text = track.title
	author_elem.text = track.author.name

	vinyl_movements.forEach(cancelTween)
	// cancelAllTweens()

	tid += 1
	let this_tid = tid
	const DURATION = 1000
	var tween_1 = tween(DURATION, EASE_LINEAR, (x) => {
		x = lerp(curr_left, -400, x)
		curr_left = x
		// print(curr_left)
		thumbcont_elem.style.setProperty("left", `${curr_left}px`)
	})
	vinyl_movements.push(tween_1)
	await wait(DURATION)

	if (this_tid == tid) {
		deg = 90
		spin_up()
		thumbnail_elem.elem.src = track.image
		var tween_2 = tween((DURATION*8), EASE_LINEAR, (x) => {
			x = lerp(curr_left, 0, x)
			// print(curr_left)
			curr_left = x
			thumbcont_elem.style.setProperty("left", `${curr_left}px`)
		})
		vinyl_movements.push(tween_2)
	}
}

updateMeta({track: NOTHING})

var spinnings = true
var spin_tweens = []
function updateStatus({status}) {
	print(status)
	spin_tweens.forEach(cancelTween)

	if (status == "PAUSE") {
		spinnings = false

		var tween_int = tween(1000, EASE_OUT_QUART, (x) => {
			x = lerp(IDLE_ROT_SPEED, 0, x)
			rot_speed = x
		})

		spin_tweens.push(tween_int)
	}

	if (status == "UNPAUSE") {
		spinnings = true

		var tween_int = tween(4000, EASE_OUT_QUART, (x) => {
			x = lerp(0, IDLE_ROT_SPEED, x)
			rot_speed = x
		})

		spin_tweens.push(tween_int)
	}	
}

updateStatus({status: "PAUSE"})

var progress_elem = new Elem("song-progress")
function updateProgress({progress}) {
	progress *= 100
	progress_elem.style.setProperty("background", `linear-gradient(to right, #024ACA ${progress}%, #151515 ${progress}%)`)
}

const IDLE_ROT_SPEED = 0.3
var rot_speed = IDLE_ROT_SPEED
var deg = 0
function spinning() {
	deg += rot_speed
	thumbnail_elem.style.setProperty("transform", `rotate(${deg}deg)`)
	requestAnimationFrame(spinning)
}
requestAnimationFrame(spinning)

function spin_up() {
	var curr_rot_speed = (spinnings ? IDLE_ROT_SPEED : 0)
	var int = tween(4000, EASE_OUT_QUART, (x) => {
		x = lerp(7, curr_rot_speed, x)
		rot_speed = x
	})
}

// updateProgress(0)