function App(global) {
"use strict";

// Constructor
const dom = {
  playPurpleEl : document.querySelector('.play[data-line="purple"]'),
  playWrapper : document.getElementById('playWrapper')
};
const audio = new (global.AudioContext || global.webkitAudioContext);
var appBegun = false;
var playing = {
  purple : false,
  blue : false,
  orange : false,
  yellow : false
};

dom.playPurpleEl.addEventListener(
  'click',
  playPause,
  false
);

function playPause(e) {
  return (
    appBegun && Object.values(playing).some((val) => val)
    ?
    (
      (dom.playPurpleEl.innerHTML = "▶")
      &&
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
        (dom.playPurpleEl.innerHTML = "&#x23f8;")
        &&
        Queensbound.play(e.target.dataset.line)
      )
      :
      (
        (appBegun = true)
        &&
        (playing.purple = true)
        &&
        (dom.playPurpleEl.innerHTML = "&#x23f8;")
        &&
        audio.resume()
        .then(() =>
          global.Queensbound = new QPlayer(global, new Audio())
        )
      )
    )
  );
}

}