function App(global) {
"use strict";

// Constructor
const dom = {
  playPurple : document.querySelector('.play[data-line="purple"]'),
  playBlue : document.querySelector('.play[data-line="blue"]'),
  playOrange : document.querySelector('.play[data-line="orange"]'),
  playYellow : document.querySelector('.play[data-line="yellow"]'),
  playPauseIcon : document.querySelector('.play[data-line="purple"] .playButton')
};
const audio = new (global.AudioContext || global.webkitAudioContext);
var appBegun = false;
var playing = {
  purple : false,
  blue : false,
  orange : false,
  yellow : false
};

dom.playPurple.addEventListener(
  'click',
  playPause,
  false
);

dom.playBlue.addEventListener(
  'click',
  alert.bind(this, "Coming soon!"),
  false
);

dom.playOrange.addEventListener(
  'click',
  alert.bind(this, "Coming soon!"),
  false
);

dom.playYellow.addEventListener(
  'click',
  alert.bind(this, "Coming soon!"),
  false
);

function playPause(e) {
  return (
    appBegun && Object.values(playing).some((val) => val)
    ?
    (
      dom.playPauseIcon.classList.remove("paused")
      ||
      (
        playing[
        global.Queensbound.pause(
          Object.entries(playing).find(
            (playingLine) => playingLine[1]
          )[0]
        )
        ] = false
      )
    )
    :
    (
      appBegun
      ?
      (
        (playing.purple = true)
        &&
        dom.playPauseIcon.classList.add("paused")
        ||
        Queensbound.play(e.target.dataset.line)
      )
      :
      (
        (appBegun = true)
        &&
        (playing.purple = true)
        &&
        dom.playPauseIcon.classList.add("paused")
        ||
        audio.resume()
        .then(() =>
          global.Queensbound = new QPlayer(global, new Audio())
        )
      )
    )
  );
}

}