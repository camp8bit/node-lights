var udp = require('dgram')
var osc = require('osc-min')
var ws281x = require('rpi-ws281x-native')
var Color = require('color')

var NUM_LEDS = parseInt(process.argv[2], 10) || (59 + 59 + 25 + 25) // 60 * 5
var pixelData = new Uint32Array(NUM_LEDS)
var inport

if (process.argv[2]) {
  inport = parseInt(process.argv[2], 10)
} else {
  inport = 8000
}

ws281x.init(NUM_LEDS)

// ---- trap the SIGINT and reset before exit
process.on('SIGINT', function () {
  ws281x.reset();
  process.nextTick(function () { process.exit(0); });
});

console.log('Press <ctrl>+C to exit.');

// rainbow-colors, taken from http://goo.gl/Cs3H0v
function colorwheel(pos) {
  pos = 255 - pos;
  if (pos < 85) { return rgb2Int(255 - pos * 3, 0, pos * 3); }
  else if (pos < 170) { pos -= 85; return rgb2Int(0, pos * 3, 255 - pos * 3); }
  else { pos -= 170; return rgb2Int(pos * 3, 255 - pos * 3, 0); }
}

function rgb2Int (r, g, b) {
  r /= 2;
  g /= 2;
  b /= 2;

  return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}

function intColor (color) {
  return rgb2Int(color.red(), color.green(), color.blue())
}

var addresses = {
  tapBeat: '/2/push13', // '/1/tap',
  mode: '/2/push14', // 1/mode',
  xyPad: '/1/xypad'
}

function getTime () {
  var t = process.hrtime()
  return t[0] + t[1] / 1e9
}

var RESET_TIME = 2.0;

var state = {
  x: 0.5,
  y: 1,
  mode: 0,
  lastTap: 0,
  tap: function () {
    var t = getTime()

    if (t - this.lastTap > RESET_TIME) {
      this.firstTap = t
      this.lastTap = t
      this.tapCount = 0
    } else {
      this.lastTap = t
      this.tapCount++
    }


    if (this.tapCount > 1) {
      console.log(this.firstTap)
      console.log(this.lastTap)
      console.log(this.tapCount)
      var secondsPerBeat = (this.lastTap - this.firstTap) / parseFloat(this.tapCount)
      this.bpm = 1.0 / (secondsPerBeat / 60.0)
      console.log(this.bpm)
    }
  },
  bpm: 120
}

var modes = [
  require('./modes/wipe')(NUM_LEDS),
  require('./modes/lazers')(NUM_LEDS),
  require('./modes/white')(NUM_LEDS),
  require('./modes/plasma')(NUM_LEDS),
  require('./modes/fire')(NUM_LEDS),
  require('./modes/chaser')(NUM_LEDS),
]

var stepsPerBeat = 64;
var beatsPerBar = 4;

var pattern = [
    Color('#aaaaaa'),
    Color('#000000'),
    Color('#000000'),
    Color('#000000'),
    Color('#ff0000'),
    Color('#000000'),
    Color('#000000'),
    Color('#000000'),
    Color('#ff0000'),
    Color('#000000'),
    Color('#000000'),
    Color('#000000'),
    Color('#ff0000'),
    Color('#000000'),
    Color('#000000'),
    Color('#000000')
  ];

// ---- animation-loop
setInterval(function () {
  var t = getTime();
  var dT = t - state.lastTap;
  var dBeats = dT / (60 / state.bpm);
  var beat = dBeats % beatsPerBar;
  var step = Math.floor(beat * stepsPerBeat) % stepsPerBeat;
  beat = Math.floor(beat);

  // console.log(beat, step)

  var color = Color('#000000');

  // if (step % 2 === 0) {
  //   color = Color('#000055')
  // }

  // if (step === 0) {
  //   color = pattern[beat]
  // }

  // if (step % 2 === 0) {
  //   color = pattern[beat * 4 + step / 2]
  // }

  // if (step === 2) {
  //   color = pattern[beat].darken(0.8)
  // }

  // var i
  // var c = intColor(color)

  for (i = 0; i < NUM_LEDS; i++) {
    pixelData[i] = 0;
  }

  modes[state.mode](beat, step, pixelData);
  if (step % 2 === 0) {
  }

  // if (beat) {
  //   for (i = 0; i < NUM_LEDS * state.x; i++) {
  //     pixelData[i] = rgb2Int(state.y * 255, 0, state.y * 255)
  //   }
  // }
  // offset = (offset + 8) % 256;

  ws281x.render(pixelData);
}, 10) //1000 * 60 / state.bpm / stepsPerBeat / 2)

var sock = udp.createSocket('udp4', function (msg, rinfo) {
  var message

  try {
    message = osc.fromBuffer(msg)
  } catch (_error) {
    console.log('invalid OSC packet')
    return
  }

  console.log(JSON.stringify(message))

  var push = message.args && message.args[0] && message.args[0].value === 1

  if (push && (message.address === addresses.tapBeat)) {
    state.tap()
  }

  if (message.address === addresses.xyPad) {
    state.x = message.args[0].value
    state.y = message.args[1].value
  }

  if (push && (message.address === addresses.mode)) {
    state.mode = (state.mode + 1) % modes.length;
  }

  if (message.address.match('/2/stepSequencer')) {
    var x = message.address.split('/')[3] - 1
    var y = message.address.split('/')[4] - 1
    var v = message.args[0].value
    
    console.log(x, v)

    pattern[x] = v ? Color('#ff0000') : Color('#000000')
  }
})

sock.bind(inport)

console.log('hmm?')
