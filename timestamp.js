const time_label = new Elem("the-fucking-time")
const weather_icon = new Elem("the-fucking-weather")

// CLEAR
// FOGGY
// CLOUDY
// RAINY
// SNOW

var WEATHER_ICONS = {
	"SUNNY_CLEAR": {match: ["32", "36"], symbol: "sunny", color: "#ffe737"},
	"MOON_CLEAR": {match: ["31"], symbol: "clear_night", color: "#71a6a1"},
	"WINDY": {match: ["23", "24"], symbol: "air", color: "#d7d7d7"},
	"FOGGY": {match: ["19", "20", "21", "22"], symbol: "foggy", color: "#d7d7d7"},
	"SUNNY_CLOUD": {match: ["28", "30", "34"], symbol: "partly_cloudy_day", color: "#ffe737"},
	"MOON_CLOUD": {match: ["27", "29", "33"], symbol: "nights_stay", color: "#71a6a1"},
	"CLOUDY": {match: ["26"], symbol: "cloud", color: "#d7d7d7"},
	"RAINY": {match: ["39", "45", "47", "37", "38", "18", "40", "0", "1", "2", "3", "4", "17", "35", "11", "12"], symbol: "rainy", color: "#0a98ac"},
	"SNOW": {match: ["41", "46", "15", "13", "14", "16", "42", "43"], symbol: "weather_snowy", color: "#ffffff"},
	"COLD": {match: ["5", "6", "7", "8", "9", "10", "25"], symbol: "ac_unit", color: "#71a6a1"},
}

function determineWeatherIcon(code) {
	var return_icon = {symbol: "sunny", color: "#ffe737"}

	for (var i = Object.keys(WEATHER_ICONS).length - 1; i >= 0; i--) {
		var key = Object.keys(WEATHER_ICONS)[i]
		var {match, symbol, color} = WEATHER_ICONS[key]

		if (match.includes(code)) {
			return_icon = {symbol: symbol, color: color}
			break
		}
	}

	return return_icon
}

// var update_weather_timestamp = Date.now()
// const weather_update_interval = 30000

async function update_weather() {
	// update_weather_timestamp = Date.now()
	var weather_code = await socket.emitWithAck("request_weather_code")
	if (weather_code != null) {
		var {symbol, color} = determineWeatherIcon(weather_code)
		weather_icon.text = symbol
		weather_icon.style.setProperty("color", color)
	} else {
		console.log("That shit null as fuck, bruh")
	}
}
update_weather()
setInterval(update_weather, 30000)

function main() {
	requestAnimationFrame(main)

	time_label.text = moment().format("h:mmA")

	// if ((update_weather_timestamp+weather_update_interval) < Date.now()) {
		// update_weather()
	// }
}

main()