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
    purple : document.querySelector('.play[data-line="purple"] .playIcon'),
    blue : document.querySelector('.play[data-line="blue"] .playIcon'),
    orange : document.querySelector('.play[data-line="orange"] .playIcon'),
    yellow : document.querySelector('.play[data-line="yellow"] .playIcon')
  },
  labels : document.getElementById('labels'),
  instructions : document.getElementById('instructions')
};
const audio = new (global.AudioContext || global.webkitAudioContext);
const supportedLines = ['purple'];
const unsupportedLines = ['blue', 'orange', 'yellow'];
const playing = {
  purple : false,
  blue : false,
  orange : false,
  yellow : false
};
var appBegun = false;

supportedLines.forEach((line) =>
  dom.playPauseButton[line].addEventListener(
    'click',
    playPause,
    {passive: true}
  )
);

unsupportedLines.forEach((line) =>
  dom.playPauseButton[line].addEventListener(
    'click',
    unsupported.bind(this, line),
    {passive: true}
  )
);

function unsupported(line) {
  alert(`The ${line} line is coming soon!`);
}

function playPause(e) {
  return (
    (appBegun && Object.values(playing).some((val) => val))
    ?
      (
        (dom.playPauseIcon[this.dataset.line].classList.remove('paused') || true)
        &&
        (playing[
          global.Queensbound.pause(
            Object.entries(playing).find((playingLine) => playingLine[1])[0]
          )
        ]
        =
          false)
      )
    :
      (
        appBegun
        ?
          (playing[this.dataset.line] = true)
          &&
          (labels.dataset.line = this.dataset.line)
          &&
          (dom.playPauseIcon[this.dataset.line].classList.add('paused') || true)
          &&
          Queensbound.play(this.dataset.line)
        :
          (appBegun = true)
          &&
          (playing[this.dataset.line] = true)
          &&
          (labels.dataset.line = this.dataset.line)
          &&
          (dom.playPauseIcon[this.dataset.line].classList.add('paused') || true)
          &&
          (dom.instructions.classList.add('hidden') || true)
          &&
          audio.resume()
          .then(() =>
            global.Queensbound = new QPlayer(global, new Audio(), this.dataset.line)
          )
      )
  );
}

}