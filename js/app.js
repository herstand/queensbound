function App(global) {
"use strict";

// Constructor
const dom = {
  playPauseButton : {
    purple : document.querySelector('.play[data-line="purple"]'),
    blue : document.querySelector('.play[data-line="blue"]'),
    orange : document.querySelector('.play[data-line="orange"]'),
    yellow : document.querySelector('.play[data-line="yellow"]')
  },
  playPauseIcon : {
    purple : document.querySelector('.play[data-line="purple"] .playButton'),
    blue : document.querySelector('.play[data-line="blue"] .playButton'),
    orange : document.querySelector('.play[data-line="orange"] .playButton'),
    yellow : document.querySelector('.play[data-line="yellow"] .playButton')
  },
  labels : document.getElementById('labels')
};
const audio = new (global.AudioContext || global.webkitAudioContext);
const supportedLines = ['purple'];//, 'blue', 'orange', 'yellow'];
var appBegun = false;
var playing = {
  purple : false,
  blue : false,
  orange : false,
  yellow : false
};

supportedLines.forEach((line) =>
  dom.playPauseButton[line].addEventListener(
    'click',
    playPause,
    {passive: true}
  )
);

function playPause(e) {
  return (
    appBegun && Object.values(playing).some((val) => val)
    ?
      (
        dom.playPauseIcon[this.dataset.line].classList.remove("paused")
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
          (playing[this.dataset.line] = true)
          &&
          (labels.dataset.line = this.dataset.line)
          &&
          dom.playPauseIcon[this.dataset.line].classList.add("paused")
          ||
          Queensbound.play(this.dataset.line)
        )
        :
        (
          (appBegun = true)
          &&
          (playing[this.dataset.line] = true)
          &&
          (labels.dataset.line = this.dataset.line)
          &&
          dom.playPauseIcon[this.dataset.line].classList.add("paused")
          ||
          audio.resume()
          .then(() =>
            global.Queensbound = new QPlayer(global, new Audio(), this.dataset.line)
          )
        )
      )
  );
}

}