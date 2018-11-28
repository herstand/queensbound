function QPlayer(global, player, line) {
"use strict";

// CONSTANTS
const DEGREE_TO_MILES_MULTIPLIER = 69;
const STATION_RADIUS_DEG = .002;
const USER_MOVE_MIN_THRESHOLD = .0005;
const MAP_MAX_ZOOM = 17;

// DATA
const data = {
  lines : {
    purple : [{"station_name":"45 Rd-Court House Sq","station_location":{"latitude":40.747023,"longitude":-73.945264},"files":[{"author":"Rosebud Ben","title":"Matarose Tags G-Dragon on the 7","file":"Matarose Tags G - Dragon on the 7 by Rosebud Ben-Oni.mp3"}]},{"station_name":"Rawson St-33rd St","station_location":{"latitude":40.744587,"longitude":-73.930997},"files":[{"author":"Safia Jama","title":"Industrial Design & Sunset","file":"Industrial Design & Sunset by Safia Jama.mp3"}]},{"station_name":"Lowery St-40th St","station_location":{"latitude":40.743781,"longitude":-73.924016},"files":[{"author":"Paolo Javier","title":"A True Account of Talking to the 7 Line in Sunnyside","file":"A True Account of Talking to the 7 In Sunnyside by Paolo Javier.mp3"}]},{"station_name":"Bliss St-46th St","station_location":{"latitude":40.743132,"longitude":-73.918435},"files":[{"author":"KC Trommer","title":"7 to 46th Street/Bliss","file":"7 to 46th Street_Bliss by KC Trommer.mp3"}]},{"station_name":"Lincoln Av-52nd St","station_location":{"latitude":40.744149,"longitude":-73.912549},"files":[{"author":"Joseph O. Legaspi","title":"[ their spine ]","file":"[ their spine ] by Joseph O. Legaspi.mp3"},{"author":"Nicole Hartounian","title":"Next Summer","file":"Next Summer by Nicole Haroutunian.mp3"}]},{"station_name":"Broadway-74th St","station_location":{"latitude":40.746848,"longitude":-73.891394},"files":[{"author":"Ananda Lima","title":"When They Come for Us on the 7 Train","file":"When They Come for Us on the 7 Train by Ananda Lima.mp3"}]},{"station_name":"82nd St-Jackson Heights","station_location":{"latitude":40.747659,"longitude":-73.883697},"files":[{"author":"Vikas K. Menon","title":"Queens Communion","file":"Queens Communion by Vikas K. Menon.mp3"}]},{"station_name":"90th St Elmhurst","station_location":{"latitude":40.748408,"longitude":-73.876613},"files":[{"author":"Abeer Y. Hoque","title":"Here I Love You New York","file":"Here I Love You New York by Abeer Y. Hoque.mp3"}]}]
  }
};

// DOM
const dom = {
  labels : document.getElementById("labels"),
  user : document.getElementById("user"),
  userDistance  : document.getElementById("userDistance"),
  map : document.getElementById("map"),
  station : document.getElementById("closestStation"),
  poem : document.getElementById("poem"),
  author : document.getElementById("author"),
  dataEls : document.querySelectorAll(".data"),
  loader : document.getElementById("loader"),
  noLocation : document.getElementById("noLocation")
};

// STATE
const appState = {
  user : {
    location : {
      longitude : null,
      latitude : null
    }
  },
  closestStationToUser : null,
  map : {
    map : null,
    featureSource : null
  },
  audio : {
    userPaused : false,
    pauseable : false
  }
};

// INITIALIZER
show(dom.loader)
&&
setupMoveEventsForLabels()
&&
loadLocation();


function setupMoveEventsForLabels() {
  return (
    dom.dataEls.forEach((el) =>
      (new MutationObserver((mutations) =>
        mutations.forEach((mutation) =>
          (
            mutation.type === "childList"
            &&
            (
              mutation.target.nextElementSibling.clientWidth >
                mutation.target.clientWidth
            )
          )
          &&
          setupMoveBackListener(el)
          &&
          moveLabelToShowOverflow.call(el)
        )
      )).observe(el, {childList: true})
    )
    ||
    true
  );
}

function getLabelOverflowWidth() {
  return ["setup", "action", "cleanup"].reduce(
    (labelOverflowWidth, type) => (
      (type === "setup")
      ?
        (this.style.overflow = "hidden")
      :(
        (type === "action")
        ?
          (this.clientWidth - this.nextElementSibling.clientWidth)
          :
          ((this.style.overflow = "visible") && labelOverflowWidth)
      )
    ),
    0
  );
}

function setupMoveBackListener(el) {
  return (
      el.addEventListener(
      "transitionend",
      moveLabelToShowOverflow.bind(el),
      {passive: true}
    )
    ||
    true
  );
}

function moveLabelToShowOverflow() {
  return (
    (window.getComputedStyle(this).left === "0px")
    ?
      (this.style.left = `${getLabelOverflowWidth.call(this)}px`)
    :
      (this.style.left = "0px")
  );
}

function loadLocation() {
  return navigator.geolocation.watchPosition(
    (position) => (
      hasUserMovedStations(appState.closestStationToUser, position.coords)
      ?
        restartUI(
          getClosestStationTo(position.coords),
          position.coords
        )
        &&
        (appState.closestStationToUser =
          getClosestStationTo(position.coords)
        )
      : (
        hasUserMoved(appState.user.location, position.coords)
        &&
        (appState.user.location = position.coords)
        &&
        updateUserUI(appState.closestStationToUser, appState.user.location)
      )
    ),
    (error) => hide(dom.loader) && show(dom.noLocation)
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

function hasUserMoved(userPositionOld, userPositionNew) {
  return (
    getDistance(userPositionOld, userPositionNew)
    >
    USER_MOVE_MIN_THRESHOLD
  );
}

function updateUserUI(closestStationToUser, userLocation) {
  return (
    (
      dom.userDistance.innerText =
        parseFloat(
          getDistance(userLocation, closestStationToUser.station_location)
          *
          DEGREE_TO_MILES_MULTIPLIER
        ).toFixed(2)
    )
    &&
    appState.map.featureSource.getFeatureById("person").setGeometry(
      new ol.geom.Point(
        ol.proj.transform(
          [userLocation.longitude, userLocation.latitude],
          'EPSG:4326',
          'EPSG:3857'
        )
      )
    )
    ||
    appState.map.map.getView().setZoom(
      getZoomLevel(getDistance(userLocation, closestStationToUser.station_location))
    )
    ||
    appState.map.map.getView().setCenter(
      getMapCenter(closestStationToUser.station_location, userLocation)
    )
  );
}

function hasUserMovedStations(closestStationToUser, userLocation) {
  return (
    !closestStationToUser
    ||
    (
      getClosestStationTo(userLocation)
      !==
      closestStationToUser
    )
    &&
    (
      getDistance(
        userLocation,
        getClosestStationTo(userLocation).station_location
      )
      <
        STATION_RADIUS_DEG
    )
  );
}

function play(line) {
  return (
    ((appState.audio.userPaused = false) || true)
    &&
    (
      player.play()
      .then(() => appState.audio.pauseable = true)
    )
    &&
    line
  )
}

function userPause(line) {
  return (
    (appState.audio.userPaused = true)
    &&
    pause(line)
  );
}

function pause(line) {
  return (
    appState.audio.pauseable
    &&
    (player.pause() || true)
    &&
    line
  ) || true;
}

function restartUI(closestStationToUser, userLocation) {
  return (
    hide(dom.loader)
    &&
    (dom.station.nextElementSibling.innerText =
      dom.station.innerText =
        closestStationToUser.station_name)
    &&
    (dom.poem.nextElementSibling.innerText =
      dom.poem.innerText =
        closestStationToUser.files[0].title)
    &&
    (dom.author.nextElementSibling.innerText =
      dom.author.innerText =
        closestStationToUser.files[0].author)
    &&
    (dom.userDistance.innerText =
      parseFloat(
        getDistance(userLocation, closestStationToUser.station_location) * DEGREE_TO_MILES_MULTIPLIER
      ).toFixed(2))
    &&
    (dom.labels.classList.remove('hidden') || true)
    &&
    (dom.user.classList.remove('hidden') || true)
    &&
    show(dom.map)
    &&
    constructMap(
      closestStationToUser.station_location,
      userLocation
    )
    &&
    ((player.currentTime = 0) || true)
    &&
    (player.src = `audio/${closestStationToUser.files[0].file}`)
    &&
    !appState.audio.userPaused
    &&
    (play(line) || true)
  );
}

function constructMap(stationLocation, userLocation) {
  dom.map.innerHTML = "";
  const poemMarker = (
    new ol.Feature({
      geometry: new ol.geom.Point(
        ol.proj.transform(
          [stationLocation.longitude, stationLocation.latitude],
          'EPSG:4326',
          'EPSG:3857'
        )
      )
    })
  );
  const personMarker = (
    new ol.Feature({
      geometry: new ol.geom.Point(
        ol.proj.transform(
          [userLocation.longitude, userLocation.latitude],
          'EPSG:4326',
          'EPSG:3857'
        )
      )
    })
  );

  poemMarker.setId("poem");
  poemMarker.setStyle(
    new ol.style.Style({
      image: new ol.style.Icon({
        src: 'images/poem.png',
        size: [17, 25]
      })
    })
  );
  personMarker.setId("person");
  personMarker.setStyle(
    new ol.style.Style({
      image: new ol.style.Icon({
        src: 'images/person.png',
        scale: .5
      })
    })
  );

  appState.map.featureSource = (
    new ol.source.Vector({
      features: [poemMarker, personMarker]
    })
  );

  return (
    (dom.map.style.height = `${dom.map.getBoundingClientRect().height}px`)
    &&
    (appState.map.map = new ol.Map({
      view: new ol.View({
        center: getMapCenter(stationLocation, userLocation),
        zoom: getZoomLevel(getDistance(userLocation, stationLocation))
      }),
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM()
        }),
        new ol.layer.Vector({
          source: appState.map.featureSource
        })
      ],
      target: "map"
    }))
  );
}

function getMapCenter(stationLocation, userLocation) {
  return ol.proj.transform(
    [
      (userLocation.longitude + stationLocation.longitude)/2,
      (userLocation.latitude + stationLocation.latitude)/2
    ],
    'EPSG:4326',
    'EPSG:3857'
  );
}

function getZoomLevel(distanceBetweenMarkers) {
  return Math.min(
    MAP_MAX_ZOOM,
    Math.round(-1.424182295 * Math.log(distanceBetweenMarkers) + 7.9)
  );
}

function getClosestStationTo(userLocation) {
  return (
    data.lines[line].reduce(
      (closestStationToUser, station) =>
        (
          getDistance(userLocation, closestStationToUser.station_location)
          >
            getDistance(userLocation, station.station_location)
          ?
            station
          :
            closestStationToUser
        )
      ,
      {
        station_location : {
          longitude : Number.POSITIVE_INFINITY,
          latitude: Number.POSITIVE_INFINITY
        }
      }
    )
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
  pause: userPause
}

};