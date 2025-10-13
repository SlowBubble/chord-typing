const charToNoteNum = {
  '`': 59,      // 47+12
  1: 60,        // 48+12
  'q': 61,
  2: 62,
  'w': 63,
  3: 64,
  4: 65,
  'r': 66,
  5: 67,
  't': 68,
  6: 69,
  'y': 70,
  7: 71,
  8: 72,
  'i': 73,
  9: 74,
  'o': 75,
  0: 76,
  '-': 77,
  '[': 78,
  '=': 79,
  // Extended lower notes
  Tab: 58,
  a: 57,
  z: 56,
  s: 55,
  x: 54,
  d: 53,
  f: 52,
  v: 51,
  g: 50,
  b: 49,
  h: 48,
  j: 47,
  m: 46,
  k: 45,
  ',': 44,
  l: 43,
  '.': 42,
  ';': 41,
  "'": 40,
}


/*
Given an item from songs, play each note
- use charToNoteNum
- $(window).trigger('keyboardDown', {
  time: new Date().getTime(),
  noteNumber: noteNumber,
  channel: 0,
  velocity: 120,
  });
  - When triggering the next keyboardDown, remember to trigger keyboardUp for the previous note
  - Each note should last 400ms
  - don't trigger anything for '-', but should still have the same duration as a note
  - If song.swing > 0, then use noteDurMs * song.swing for the even notes' duration.
  Change:
  - Utter the character the same time we play the note.
  */
 function replay(song, opts = {}) {
  const noteDurMs = song.noteDurMs || 700;
  const doReMiMode = opts.doReMiMode || false;
  const onProgress = opts.onProgress;

  // Helper to flatten a section array into a sequence of notes (including '_')
  function flattenSections(sections) {
    const notes = [];
    let keySections = Array.isArray(sections[0]) ? sections : [sections];
    keySections.forEach(section => {
      section.forEach(row => {
        row.split(' ').forEach(k => {
          if (k !== '') notes.push(k);
        });
      });
    });
    return notes;
  }


  // Get main melody notes
  const notes = flattenSections(song.keys);

  // Get chords (if any)
  const chords = song.chords ? flattenSections(song.chords) : null;

  // Determine the max length for playback
  const maxLen = Math.max(notes.length, chords ? chords.length : 0);

  // Use chordMap from free-style-game.js
  const chordMap = {
    '1': [60 - 12, 64, 67 - 12], // C E G
    '2': [62 - 12, 65, 69 - 12], // D F A
    '3': [64 - 12, 67, 71 - 12], // E G B
    '4': [65 - 24, 69, 72 - 24], // F A C
    '5': [67 - 24, 71, 74 - 24], // G B D
    '6': [69 - 24, 72, 76 - 24], // A C E
    '7': [71 - 24, 74, 77 - 24], // B D F
  };

  return new Promise(resolve => {
    let idx = 0;
    let prevNoteNumber = null;
    let prevChordNotes = [];
    function playNext() {
      if (onProgress) onProgress(idx);
      if (idx >= maxLen) {
        // Release last notes if any
        if (prevNoteNumber !== null) {
          $(window).trigger('keyboardUp', {
            time: new Date().getTime(),
            noteNumber: prevNoteNumber,
            channel: 0,
            velocity: 120,
          });
        }
        if (prevChordNotes.length > 0) {
          prevChordNotes.forEach(noteNumber => {
            $(window).trigger('keyboardUp', {
              time: new Date().getTime(),
              noteNumber,
              channel: 0,
              velocity: 120,
            });
          });
        }
        resolve();
        return;
      }
      // Main melody
      const noteChar = notes[idx] || '_';
      let dur = noteDurMs;
      if (song.swing && idx % 2 === 1) {
        dur = noteDurMs * song.swing;
      }
      // Chord
      const chordChar = chords ? (chords[idx] || '_') : '_';

      // Play main melody note
      if (noteChar !== '_') {
        let noteNumber = charToNoteNum[noteChar];
        if (typeof noteNumber !== "undefined") {
          noteNumber += 12; // Play one octave higher than mapping
          // Utter the character at the same time
          if (typeof window.speechSynthesis !== "undefined") {
            const speakKey = doReMiMode ? simplifyCharToDoReMi(noteChar) : simplifyCharTo123(noteChar);
            const utter = new window.SpeechSynthesisUtterance(speakKey);
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
          }
          window.setTimeout(_ => {
            if (prevNoteNumber !== null) {
              $(window).trigger('keyboardUp', {
                time: new Date().getTime(),
                noteNumber: prevNoteNumber,
                channel: 0,
                velocity: 80,
              });
            }
            $(window).trigger('keyboardDown', {
              time: new Date().getTime(),
              noteNumber: noteNumber,
              channel: 0,
              velocity: 80,
            });
            prevNoteNumber = noteNumber;
          }, 90);
        }
      }

      // Play chord
      if (chordChar !== '_' && chordMap[chordChar]) {
        window.setTimeout(_ => {
          // Only release previous chord notes when a new chord is played
          if (prevChordNotes.length > 0) {
            prevChordNotes.forEach(noteNumber => {
              $(window).trigger('keyboardUp', {
                time: new Date().getTime(),
                noteNumber,
                channel: 0,
                velocity: 80,
              });
            });
          }
          chordMap[chordChar].forEach(noteNumber => {
            $(window).trigger('keyboardDown', {
              time: new Date().getTime(),
              noteNumber,
              channel: 0,
              velocity: 60,
            });
          });
          prevChordNotes = chordMap[chordChar].slice();
        }, 90);
      }
      // Do NOT release chord notes if chordChar is '_'; keep them held until next chord

      idx++;
      setTimeout(playNext, dur);
    }
    playNext();
  });
}
