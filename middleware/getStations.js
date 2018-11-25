fetch(
  encodeURI(
    // All subway entrances for all trains returned by:
    // https://data.ny.gov/resource/hvwh-qtfg.json
    `https://data.ny.gov/resource/hvwh-qtfg.json?$where=(${
      // Subway station data lists the train name under
      // the attribute routeN, where N is a number 1-10
      ([...Array(10)]).reduce(
        (where, route, i, arr) =>
          `${where}route${i+1} LIKE '%7%'` + (i < (arr.length - 1) ? ' OR ' : ''),
          ""
      )
    })`
  )
)
.then(
  (response) =>
    response.json()
)
.then(
  (responseJSON) =>
    // Reduce the station list to one item per station (ignoring multiple entrances)
    responseJSON.reduce(
      (stops, stop) =>
      // If the station hasn't been added yet to the stops list...
      (!stops.some((trackedStop) => trackedStop.station_name === stop.station_name))
      ?
      // then add the station to the stops list
      stops.concat(
        {
          "station_name" : stop.station_name,
          "station_location": {
            latitude : stop.station_location.coordinates[1],
            longitude : stop.station_location.coordinates[0]
          }
        }
      )
      :
      // otherwise, return the previous stops list
      stops,
      []
    // Sort the stops list from west to east
    ).sort(
      (stop1, stop2) =>
        stop1.station_location.longitude < stop2.station_location.longitude
        ?
        -1
        :
        1
    )
)
.then(
  (stations) =>
    window.stations = stations
);