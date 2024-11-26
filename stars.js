var canvas = new Elem("main")
var ctx = canvas.elem.getContext("2d")

//-------------------------------------------------------------------------//

var Stars = [
	makeStar("music", 1),
	makeStar("big_01", 5),
	makeStar("small_01", 20),
	makeStar("small_02", 20),
]

// World's ugliest variable
var subGridTemplate = [
	["big_01", "small_01", "small_03", "small_01", "big_01", "small_01", "small_03", "small_01"],
	["small_02", "small_03", "small_02", "small_03", "small_02", "small_03", "small_02", "small_03"],
	["small_03", "small_01", null, "small_01", "small_03", "small_01", null, "small_01"],
	["small_02", "small_03", "small_02", "small_03", "small_02", "small_03", "small_02", "small_03"],
	["big_01", "small_01", "small_03", "small_01", "big_01", "small_01", "small_03", "small_01"],
	["small_02", "small_03", "small_02", "small_03", "small_02", "small_03", "small_02", "small_03"],
	["small_03", "small_01", null, "small_01", "small_03", "small_01", null, "small_01"],
	["small_02", "small_03", "small_02", "small_03", "small_02", "small_03", "small_02", "small_03"],
]

var CoolGuys = [
	"music",
	"art",
	"blubot",
	"bolt",
	// "blu",
]

//-------------------------------------------------------------------------//

var actual_stars = []

Stars.forEach(star => {
	for (let ind = 0; ind < star.freq; ind++) {
		actual_stars.push(star.img)
	}
})

function makeStar(name, freq = 1) {
	var img = new Image()
	img.src = `assets/stars/${name}.png`
	print(img)
	return {img, freq}
}

// Fuck it (but please change this in the future maybe :) )
var cachedImages = {}
function cacheImage(name) {
	if (!Object.keys(cachedImages).includes(name)) {
		var img = new Image()
		img.src = `assets/stars/${name}.png`
		cachedImages[name] = img
	}

	return cachedImages[name]
}

//--Seeded Randomness-----------------------------------------------------------------------//

var BASE_SEED = (Math.random())

function splitmix32(a) {
 return function() {
   a |= 0;
   a = a + 0x9e3779b9 | 0;
   let t = a ^ a >>> 16;
   t = Math.imul(t, 0x21f0aaad);
   t = t ^ t >>> 15;
   t = Math.imul(t, 0x735a2d97);
   return ((t = t ^ t >>> 15) >>> 0) / 4294967296;
  }
}

function seeded_randi(min, max, offset = Date.now()) {
	var prng = splitmix32(BASE_SEED * offset)
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(prng() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

//-------------------------------------------------------------------------//

function wrap_arr(ind, max) {
	var might_return = null
	if (ind >= 0) {
		might_return = (ind % (max))
	} else {
		might_return = ((max) + (ind % -(max)))
	}

	if (might_return == max) { might_return = (max-1) }

	return might_return
}

//-------------------------------------------------------------------------//

var wholeWidth = document.body.clientWidth
var wholeHeight = document.body.clientHeight

var SCROLL_SPEED_X = -2
var SCROLL_SPEED_Y = -1

// var scroll_x = 0
// var scroll_y = 0

var START_TIME = Date.now()
var frame = 0

var Store = {}

const subGridSize = 8

const LayerInfo = {
	layer_1: {offset: [0, 0], scale: 2, base_scroll_speed: [1.1, 1.1]},
	layer_2: {offset: [48*2, -48*2], scale: 1.5, base_scroll_speed: [1.5, 1.5]},
	layer_3: {offset: [0, 0], scale: 1.75, base_scroll_speed: [2, 2]},
}

function fillGrid(key) {
	if (!Object.keys(Store).includes(key)) {
		Store[key] = {
			scroll_x: LayerInfo[key].offset[0],
			scroll_y: LayerInfo[key].offset[1],
			base_scroll_speed: LayerInfo[key].base_scroll_speed,
			scroll_speed: [0, 0],
			scale: LayerInfo[key].scale
		}
	}

	var scroll_x = Store[key].scroll_x
	var scroll_y = Store[key].scroll_y

	// print(Store[key].scale)
	var scale = Store[key].scale
	var tileSize = 48 * scale

	var horiTiles = Math.ceil(wholeWidth / tileSize) + 2
	var vertTiles = Math.ceil(wholeHeight / tileSize) + 2

	var pastXs = Math.ceil(scroll_x / tileSize)
	var pastYs = Math.ceil(scroll_y / tileSize)

	var ind = 0
	for (let x = 0; x < horiTiles; x++) {
		var totalX = (x - pastXs)
		var subGridX = wrap_arr(totalX, subGridSize)
		var x_prng = splitmix32(x - pastXs)
		var x_val = x_prng()

		for (let y = 0; y < vertTiles; y++) {
			var totalY = (y - pastYs)
			var subGridY = wrap_arr((y - pastYs), subGridSize)

			// if (subGridTemplate[subGridX] == null) { print(subGridX) }
			var subGridEntry = subGridTemplate[subGridX][subGridY]
			var valid = (key == "layer_1")

			switch (key) {
				case "layer_1":
					valid = true
					if (subGridEntry == null) { subGridEntry = "small_03" }
					if (subGridEntry == "big_01") { subGridEntry = "small_03" }
				break;
				case "layer_2":
					valid = (subGridEntry == null || (subGridEntry == "big_01"))
					subGridEntry = "big_01"
				break;
				case "layer_3":
					valid = (subGridEntry == null)
					subGridEntry = CoolGuys[wrap_arr((Math.round(totalX / (CoolGuys.length-1)) + Math.round(totalY / (CoolGuys.length-1))), CoolGuys.length)]
				break;
			}

			var real_x = (x * tileSize) - tileSize
			var real_y = (y * tileSize) - tileSize

			var star_img = cacheImage(subGridEntry)
			ctx.imageSmoothingQuality = "high"

			if (valid) {
				// print(subGridEntry)
				ctx.drawImage(star_img, real_x + wrap_arr(scroll_x, tileSize), real_y + wrap_arr(scroll_y, tileSize), tileSize, tileSize)
			}

			if (false) {
				ctx.font = "16px serif";
				ctx.fillStyle = "#0000ff"
				ctx.fillText(`(${subGridX}, ${subGridY})`, real_x + (scroll_x%tileSize), real_y + (scroll_y%tileSize))
			}

			ind++
		}
	}
	var magnitude = 2

	// if (key != "layer_1") {
	// 	Store[key].scroll_speed[0] = (Math.cos(frame) * magnitude) + Store[key].base_scroll_speed[0]
	// 	Store[key].scroll_speed[1] = Math.sin(frame) * magnitude + Store[key].base_scroll_speed[1]
	// } else {
	// 	Store[key].scroll_speed[0] = Store[key].base_scroll_speed[0]
	// 	Store[key].scroll_speed[1] = Store[key].base_scroll_speed[1]
	// }
	Store[key].scroll_speed[0] = (Math.cos(frame) * magnitude) + Store[key].base_scroll_speed[0]
	Store[key].scroll_speed[1] = Math.sin(frame) * magnitude + Store[key].base_scroll_speed[1]

	Store[key].scroll_x += Store[key].scroll_speed[0]
	Store[key].scroll_y += Store[key].scroll_speed[1]
}

var iter = 0
function process() {
	wholeWidth = document.body.clientWidth
	wholeHeight = document.body.clientHeight

	canvas.elem.width = wholeWidth
	canvas.elem.height = wholeHeight

	if (iter % 1 == 0) {
		frame = ((Date.now() - START_TIME) / 2000.0)
		ctx.clearRect(0, 0, canvas.elem.width, canvas.elem.height)

		fillGrid("layer_1")
		fillGrid("layer_2")
		fillGrid("layer_3")
	}

	requestAnimationFrame(process)
	iter++
}

process()