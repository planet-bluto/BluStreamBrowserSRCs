const FLAVOR_TEXT = [
	"DOWNLOADING EMOTES...",
	"WAKING UP SPARKS...",
	"PISSING OFF BLUBOT...",
	"MAKING ICE CREAM...",
	"CRASHING ENTIRE STREAM...",
	"TESTING INTERGALACTIC CONNECTION...",
	"ROUNDING UP SPARKS...",
	"LOOKING AT SANDWICH...",
	"TRACKING ACTIVITY FOR BLUBOT AWARDS...",
	"GASLIGHTING THE VIEWERS...",
	"BREACHING STARFIELDS...",
	"FEEDING SPARKS...",
	"COUNTING STARS...",
	"DEBUGGING BACKEND...",
	"LOCATING EARTH GALACTIC ENDPOINT...",
	"YOINKING THE SPLOINKY...",
	"INFORMING THE MASSES...",
	"INVADING YOUR PLANET...",
	"PAINTING EVERYTHING BLUE...",
	"CRAFTING RANDOM BULLSHIT...",
	"ORBITING MILKEY WAY...",
	"LAUNCHING BLUBOT INTO ORBIT...",
	"BLASTING COMMUNICATION SIGNALS...",
	"DEVELOPING MY GAME...",
	"GAMING MY DEVELOPMENT...",
	"HORSING AROUND...",
	"SCREAMING VERY LOUDLY...",
	"CONFIGURING LIVE STREAM...",
	"TUNING SONAR PINGS...",
	"UNBOXING NULL DWARFS...",
	"SCREAMING AT EVERYONE...",
	"ADJUSTING BLUE LIGHTS...",
	"CODING A SOLUTION TO ALL MY PROBLEMS...",
	"FOLLOW @ProjectHTTP FOLLOW @ProjectHTTP FOLLOW @ProjectHTTP FOLLOW @ProjectHTTP FOLLOW @ProjectHTTP",
	"FOLLOWING @PLANETBLUTONIUM ON TWITTER...",
	"FOLLOWING PLANET_BLUTO ON SOUNDCLOUD...",
	"FOLLOWING PLANETBLUTO ON YOUTUBE...",
	"FOLLOWING BLUTONIUM ON NEWGROUNDS...",
	"FOLLOWING PLANET-BLUTO ON ITCH.IO...",
	"CHECKING OUT HTTPS://PLANET-BLUTO.NET/...",
	"FINDING WHO ASKED...",
	"JOINING THE PLANET BLUTO !DISCORD...",
	"WONDERING WHAT BLUBOT'S !BUMPER IS...",
]

// --------------------------------------------------------- //

const MAX_LINE_COUNT = 25

const container_elem = new Elem("container")

var lines = []

async function newLine(text, special = false) {
  var virtual_elem = new Elem("p")
  virtual_elem.html = text
  virtual_elem.style = "display: none;"
  body.addChild(virtual_elem)

  let charInator = char => {
    let charElem = new Elem("span")
    charElem.text = char
    return charElem
  }
  
  print("PRE: ", text)
  
  let childElems = []

  virtual_elem.children.forEach((child, ind) => {
    let toFind = child.elem.outerHTML
    console.log(toFind)

    let idx = text.indexOf(toFind)
    if (idx == -1) {
      toFind = toFind.replace(">", "/>")
      idx = text.indexOf(toFind)
    }
    let elements = [child]

    let insert = `{planet_bluto_${ind}_element}`
    text = text.replace(toFind, insert)

    if (child.elem.tagName == "SPAN") {
      elements = child.text.split("").map(charInator)
    }

    childElems.push({ idx, elements, length: insert.length })
  })

  print("POST: ", text)
  print("CHILDELEMS: ", childElems)

  textChars = text.split("").map(charInator)

  childElems.reverse()
  childElems.forEach(childEntry => {
    let result = text
    textChars.splice(childEntry.idx, childEntry.length, ...childEntry.elements)
  })

  print("RESULTING CHARS: ", textChars)

  var p_elem = new Elem("p")
  p_elem.classes.add("line")
  if (special) { p_elem.classes.add("special") }
  p_elem.html = ""

  await wait(1000 * 0.25)

  lines.forEach(line => {
    line.element.style = "opacity: 0.5"
  })

  lines.push({
    target_text: textChars,
    element: p_elem,
    animating: true,
    idx: 0,
    height: p_elem.elem.clientHeight
  })

  container_elem.addChildTop(p_elem)

  if (container_elem.children.length > MAX_LINE_COUNT) {
    container_elem.children[container_elem.children.length-1].delete()
  }

  animateLine()
}

function animateLine() {
  var current_line = lines[lines.length-1]
  if (current_line == null || !current_line.animating) {
    // print(chatQueue)
    if (chatQueue.length > 0) {
      newLine(chatQueue.shift(), true)
    } else {
      newLine(randomText())
    }
  } else {
    let thisElem = current_line.target_text[current_line.idx]

    // let thing = new Elem("span")
    // thing.html += thisChar

    current_line.element.addChild(thisElem)
    current_line.idx += 1

    if (Math.abs(current_line.element.elem.clientHeight - current_line.height) > (LINE_INCREMENT * 0.9)) {
      current_line.height = current_line.element.elem.clientHeight
      scrollContainer()
    }

    if (current_line.idx == current_line.target_text.length) {
      current_line.animating = false
    }

    if ([".", "!", "?"].includes(thisElem.text)) {
      setTimeout(animateLine, (1000 * (0.35)))
    } else if ([",", "-"].includes(thisElem.text)) {
      setTimeout(animateLine, (1000 * (0.1)))
    } else {
      setTimeout(animateLine, (1000 * (2.0 / 60.0)))
    }
  }
}

const NO_REPEAT_COUNT = 40

var recents = []
function randomText() {
  let toReturn = FLAVOR_TEXT[randi(0, FLAVOR_TEXT.length-1)]
  while (recents.includes(toReturn)) {
    toReturn = FLAVOR_TEXT[randi(0, FLAVOR_TEXT.length-1)]
  }
  
  recents.push(toReturn)

  if (recents.length > NO_REPEAT_COUNT) { recents.shift() }
  return toReturn
}



newLine(randomText())

var tween_int;
container_elem.watch({childList: true}, (mutation) => {
  scrollContainer()
})

const LINE_INCREMENT = 42

function scrollContainer() {
	const sizeScale = 0.5

	cancelAllTweens()
	
	let durationPerc = (LINE_INCREMENT / (LINE_INCREMENT * sizeScale))
	
	let currScroll = (LINE_INCREMENT * 1)
	let targetScroll = 0
	tween_int = tween(200*durationPerc, EASE_OUT_QUART, (perc) => {
		let x = lerp(currScroll, targetScroll, perc)
		// messagesElem.scrollTop = x
		container_elem.style.setProperty("margin-top", `${x}px`)
	})
}


// --------------------------------------------------------- //

function format(str) {
	str = str.toUpperCase()
	str = ">" + str
	str = str.replaceAll(" ", "_")
	// str = str + "..."
	return str
}

let prevChats = []
socket.on("connect", () => {
  socket.emitWithAck("sub_chat").then(res => {
		// print(res)

		prevChats = res.chats
	})
})

socket.on("sub_chat_message", appendMessage)

var chatQueue = []
function appendMessage(author, text, platform, author_style = null, flags = [], icons = [], extraInfo = {}) {
  // print(author, text)
  chatQueue.push((`${format(author)}: ` + twemoji.parse(text)))
}