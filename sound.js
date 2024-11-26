var NO_SFX = false
var sfxVolume = 0.6

async function playSound(sound, volumeOverride = sfxVolume) {
	if (!NO_SFX) {
		var audioElem = new Audio(sound.startsWith("$") ? sound.replace("$", "./assets/audio/") : sound)
		audioElem.volume = volumeOverride
		audioElem.play()

		return new Promise ((res, rej) => {
			audioElem.addEventListener("ended", (event) => {
				res()
			})
		})
	} else {
		return new Promise ((res, rej) => {
			res()
		})
	}
}