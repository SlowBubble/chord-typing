

// Chord mapping for C major scale (MIDI note numbers)

const chordMap = {
  '1': [60 - 12, 64, 67 - 12], // C E G
  '2': [62 - 12, 65, 69 - 12], // D F A
  '3': [64 - 12, 67, 71 - 12], // E G B
  '4': [65 - 24, 69, 72 - 24], // F A C
  '5': [67 - 24, 71, 74 - 24], // G B D
  '6': [69 - 24, 72, 76 - 24], // A C E
  '7': [71 - 24, 74, 77 - 24], // B D F
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