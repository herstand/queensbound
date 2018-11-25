function QPlayer(global, player) {
"use strict";

// Constructor
var sevenTrainStations = [{"station_name":"45 Rd-Court House Sq","station_location":{"latitude":40.747023,"longitude":-73.945264},"audio":[{"author":"Rosebud Ben","title":"Matarose Tags G-Dragon on the 7","file":"Matarose Tags G - Dragon on the 7 by Rosebud Ben-Oni.mp3"}]},{"station_name":"Rawson St-33rd St","station_location":{"latitude":40.744587,"longitude":-73.930997},"audio":[{"author":"Safia Jama","title":"Industrial Design & Sunset","file":"Industrial Design & Sunset by Safia Jama.mp3"}]},{"station_name":"Lowery St-40th St","station_location":{"latitude":40.743781,"longitude":-73.924016},"audio":[{"author":"Paolo Javier","title":"A True Account of Talking to the 7 Line in Sunnyside","file":"A True Account of Talking to the 7 In Sunnyside by Paolo Javier.mp3"}]},{"station_name":"Bliss St-46th St","station_location":{"latitude":40.743132,"longitude":-73.918435},"audio":[{"author":"KC Trommer","title":"7 to 46th Street/Bliss","file":"7 to 46th Street_Bliss by KC Trommer.mp3"}]},{"station_name":"Lincoln Av-52nd St","station_location":{"latitude":40.744149,"longitude":-73.912549},"audio":[{"author":"Joseph O. Legaspi","title":"[ their spine ]","file":"[ their spine ] by Joseph O. Legaspi.mp3"},{"author":"Nicole Hartounian","title":"Next Summer","file":"Next Summer by Nicole Haroutunian.mp3"}]},{"station_name":"Broadway-74th St","station_location":{"latitude":40.746848,"longitude":-73.891394},"audio":[{"author":"Ananda Lima","title":"When They Come for Us on the 7 Train","file":"When They Come for Us on the 7 Train by Ananda Lima.mp3"}]},{"station_name":"82nd St-Jackson Heights","station_location":{"latitude":40.747659,"longitude":-73.883697},"audio":[{"author":"Vikas K. Menon","title":"Queens Communion","file":"Queens Communion by Vikas K. Menon.mp3"}]},{"station_name":"90th St Elmhurst","station_location":{"latitude":40.748408,"longitude":-73.876613},"audio":[{"author":"Abeer Y. Hoque","title":"Here I Love You New York","file":"Here I Love You New York by Abeer Y. Hoque.mp3"}]}];
var closestStationToUser = {
  value : null,
  newValue : null
};
var pausedEarly = false;
const degreeToMilesMultiplier = 69;
const appLoadedAt = Date.now();
const dom = {
  labelsEl : document.getElementById("labels"),
  userEl : document.getElementById("user"),
  userDistanceEl : document.getElementById("userDistance"),
  mapEl : document.getElementById("map"),
  stationEl : document.getElementById("closestStation"),
  poemEl : document.getElementById("poem"),
  authorEl : document.getElementById("author"),
  dataEls : document.querySelectorAll(".data"),
  loaderEl : document.getElementById("loader")
};

init();

function init() {
  return (
    show(dom.loaderEl)
    &&
    checkOverflow()
    &&
    loadLocation()
  );
}

function show(el) {
  return (
    el.classList.remove("hidden")
    ||
    el.classList
  );
}

function hide(el) {
  return (
    el.classList.add("hidden")
    ||
    el.classList
  );
}

function checkOverflow() {
  return (
    dom.dataEls.forEach((el) =>
      (new MutationObserver((mutations) =>
        mutations.forEach((mutation) =>
          (
            mutation.type === "childList"
            &&
            mutation.target.nextElementSibling.clientWidth
            >
            mutation.target.clientWidth
          )
          &&
          (
            el.addEventListener(
              "transitionend",
              move.bind(el, el.clientWidth - el.nextElementSibling.clientWidth),
              false
            )
            ||
            move.call(el, el.clientWidth - el.nextElementSibling.clientWidth)
          )
        )
      )).observe(el, {childList: true})
    )
    ||
    true
  );
}

function move(distance) {
  return (
    (!this.style.left || this.style.left === "0px")
    ?
      (
        (this.style.overflow = "visible")
        &&
        (this.style.left = `${distance}px`)
      )
    :
      (this.style.left = "0px")
  );
}

function loadLocation() {
  navigator.geolocation.watchPosition(
    (position) => (
      (closestStationToUser.newValue = getClosestStation(position.coords))
      &&
      (closestStationToUser.newValue !== closestStationToUser.value)
      &&
      deconstructStation(closestStationToUser.value)
      &&
      (closestStationToUser.value = closestStationToUser.newValue)
      &&
      displayContent(closestStationToUser.value, position.coords)
    ),
    (error) => console.error(error)
  );
}

function deconstructStation(previousStation) {
  return (
    previousStation
    &&
    player.pause()
    &&
    (player.currentTime = 0)
  ) || true;
}

function play(line) {
  pausedEarly = false;
  player.play();
  return line;
}

function pause(line) {
  pausedEarly = true;
  player.pause();
  return line;
}

function displayContent(closestStationToUser, userLocation) {
  (appLoadedAt > Date.now() - 1000)
  ?
    window.setTimeout(
      displayContent.bind(this, closestStationToUser, userLocation),
      500
    )
  :
    (
      hide(dom.loaderEl)
      &&
      show(dom.mapEl)
      &&
      (dom.stationEl.nextElementSibling.innerText =
        dom.stationEl.innerText =
          closestStationToUser.station_name)
      &&
      (dom.poemEl.nextElementSibling.innerText =
        dom.poemEl.innerText =
          closestStationToUser.audio[0].title)
      &&
      (dom.authorEl.nextElementSibling.innerText =
        dom.authorEl.innerText =
          closestStationToUser.audio[0].author)
      &&
      (dom.userDistanceEl.innerText =
        parseFloat(
          closestStationToUser.distanceToUser * degreeToMilesMultiplier
        ).toFixed(2))
      &&
      (dom.labelsEl.classList.remove('hidden') || true)
      &&
      (dom.userEl.classList.remove('hidden') || true)
      &&
      constructMap(
        closestStationToUser.station_location,
        userLocation
      )
      &&
      (player.src = `audio/7/${closestStationToUser.audio[0].file}`)
      &&
      !pausedEarly
      &&
      (player.play() || true)
    );
}

function constructMap(stationLocation, userLocation) {
  return (
    (dom.mapEl.style.height = `${dom.mapEl.getBoundingClientRect().height}px`)
    &&
    new ol.Map({
      view: new ol.View({
        center: ol.proj.transform(
          [stationLocation.longitude, stationLocation.latitude],
          'EPSG:4326',
          'EPSG:3857'
        ),
        zoom: 16
      }),
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        }),
        new ol.layer.Vector({
          style: new ol.style.Style({
            image: new ol.style.Icon({
              src: 'images/marker.png',
              size: [21, 25]
            })
          }),
          source: new ol.source.Vector({
            features: [
              new ol.Feature({
                geometry: new ol.geom.Point(
                  ol.proj.transform(
                    [stationLocation.longitude, stationLocation.latitude],
                    'EPSG:4326',
                    'EPSG:3857'
                  )
                )
              }),
              new ol.Feature({
                geometry: new ol.geom.Point(
                  ol.proj.transform(
                    [userLocation.longitude, userLocation.latitude],
                    'EPSG:4326',
                    'EPSG:3857'
                  )
                )
              })
            ]
          })
        })
      ],
      target: "map"
    })
  );
}

function getClosestStation(userLocation) {
  return sevenTrainStations.reduce(
    (closestStation, station, station_index) =>
      setStationDistanceToUser(station, userLocation)
      &&
      setStationIndex(station, station_index)
      &&
      (
        closestStation.distanceToUser > station.distanceToUser
        ?
          station
        :
          closestStation
      )
    ,
    { distanceToUser : Number.POSITIVE_INFINITY }
  );
}

function setStationIndex(station, station_index) {
  return (
    (station.station_index = station_index) > -1
  );
}

/**
  Updates station's computed value for its distance
  to the user's current location.
**/
function setStationDistanceToUser(station, userLocation) {
  return (
    (station.distanceToUser = getDistance(userLocation, station.station_location)) > -1
  );
}

function getDistance(point1, point2) {
  return Math.sqrt(
    Math.pow(point1.longitude - point2.longitude, 2)
    +
    Math.pow(point1.latitude - point2.latitude, 2)
  );
}

return {
  play: play,
  pause: pause
}

};