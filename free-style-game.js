

// Chord mapping for C major scale (MIDI note numbers)

const chordMap = {
  // Ionian mode
  '1': [60 - 12, 64, 67 - 12], // C E G
  '2': [62 - 12, 65, 69 - 12], // D F A
  '3': [64 - 12, 67, 71 - 12], // E G B
  '4': [65 - 24, 69, 72 - 24], // F A C
  '5': [67 - 24, 71, 74 - 24], // G B D
  '6': [69 - 24, 72, 76 - 24], // A C E
  '7': [71 - 24, 74, 77 - 24], // B D F
  '8': [60 - 12, 64, 67], // C E G
  // Aeolian mode
  'q': [60 - 12, 63, 67 - 12], // C Eb G
  'w': [62 - 12, 65, 68 - 12], // D F Ab
  'e': [63 - 12, 67, 70 - 12], // Eb G Bb
  'r': [65 - 24, 68, 72 - 24], // F Ab C
  't': [67 - 24, 70, 74 - 24], // G Bb D
  'y': [68 - 24, 72, 75 - 24], // Ab C Eb
  'u': [71 - 24, 74, 77 - 24], // B D F
  'i': [60 - 12, 63, 67], // C Eb G
  // Locrian mode
  'a': [60 - 12, 63, 66 - 12], // C Eb Gb
  's': [62 - 12, 65, 68 - 12], // D F Ab
  'd': [63 - 12, 66, 70 - 12], // Eb Gb Bb
  'f': [65 - 24, 68, 71 - 24], // F Ab B
  'g': [66 - 24, 70, 73 - 24], // Gb Bb Db
  'h': [68 - 24, 71, 75 - 24], // Ab B Eb
  'j': [70 - 24, 73, 76 - 24], // Bb Db F
  'k': [60 - 12, 63, 66], // C Eb Gb
  // Lydian Dominant mode (C D E F# G A Bb)
  'z': [60 - 12, 64, 67 - 12, 70], // C E G Bb
  'x': [62 - 12, 66, 69 - 12], // D F# A
  'c': [64 - 12, 67, 70 - 12], // E G Bb
  'v': [66 - 24, 69, 72 - 24], // F# A C
  'b': [67 - 24, 70, 74 - 24], // G Bb D
  'n': [69 - 24, 72, 76 - 24], // A C E
  'm': [70 - 24, 74, 78 - 24], // Bb D F#
  ',': [60 - 12, 64, 67 - 12, 70], // C E G Bb
};

// Track which chord is currently pressed
let pressedChordKey = null;

function playChord(notes) {
	notes.forEach(noteNumber => {
		$(window).trigger('keyboardDown', {
			time: new Date().getTime(),
			noteNumber,
			channel: 0,
			velocity: 120,
		});
	});
}

function releaseChord(notes) {
	notes.forEach(noteNumber => {
		$(window).trigger('keyboardUp', {
			time: new Date().getTime(),
			noteNumber,
			channel: 0,
			velocity: 120,
		});
	});
}


window.addEventListener('keydown', function(e) {
	// Only respond to number keys 1-7 (top row)
	if (e.repeat) return;
	const key = e.key;
	if (chordMap[key]) {
		if (pressedChordKey !== key) {
			playChord(chordMap[key]);
			pressedChordKey = key;
		}
	} else if (!e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey) {
		e.preventDefault();
	}
});

window.addEventListener('keyup', function(e) {
	const key = e.key;
	if (chordMap[key] && pressedChordKey === key) {
		releaseChord(chordMap[key]);
		pressedChordKey = null;
	}
});