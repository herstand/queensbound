(() => {
const cacheName = 'queensbound-v1';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return (
        cache.addAll([
          '/queensbound',
          '/queensbound/',
          '/queensbound/index.html',
          '/queensbound/favicon.png',
          '/queensbound/css/style.css',
          '/queensbound/images/loader.gif',
          '/queensbound/images/logo.jpeg',
          '/queensbound/images/person.png',
          '/queensbound/images/poem.png',
          '/queensbound/js/app.js',
          '/queensbound/js/queensbound.js',
          '/queensbound/css/thirdparty/openlayers.css',
          '/queensbound/js/thirdparty/openlayers.js'
        ])
        &&
        cache.addAll([
          '/queensbound/audio/[ their spine ] by Joseph O. Legaspi.mp3',
          '/queensbound/audio/7 to 46th Street_Bliss by KC Trommer.mp3',
          '/queensbound/audio/A True Account of Talking to the 7 In Sunnyside by Paolo Javier.mp3',
          '/queensbound/audio/All Possible Fates by Jared Harél.mp3',
          '/queensbound/audio/Cornrows by Maria Lisella.mp3',
          '/queensbound/audio/Hawthorne Court by Maria Terrone.mp3',
          '/queensbound/audio/Here I Love You New York by Abeer Y. Hoque.mp3',
          '/queensbound/audio/Industrial Design & Sunset by Safia Jama.mp3',
          '/queensbound/audio/Kalpana Chawla Way by Malcolm Chang.mp3',
          '/queensbound/audio/Liberty Ashes (Keep Rising) by Sherese Francis.mp3',
          '/queensbound/audio/Matarose Tags G - Dragon on the 7 by Rosebud Ben-Oni.mp3',
          '/queensbound/audio/Next Summer by Nicole Haroutunian.mp3',
          '/queensbound/audio/Psalm of the Garden In the City by Catherine Fletcher.mp3',
          '/queensbound/audio/Queens Communion by Vikas K. Menon.mp3',
          '/queensbound/audio/The Odds of It by KC Trommer.mp3',
          '/queensbound/audio/When They Come for Us on the 7 Train by Ananda Lima.mp3'
        ])
      );
    })
  );
});

self.addEventListener('activate', (event) =>
  (event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.map((key) =>
          (key !== cacheName)
          &&
          caches.delete(key)
        )
      )
    )
  ) || true)
  &&
  self.clients.claim()
);

self.addEventListener('fetch', async (e) =>
  e.respondWith(
    caches.match(e.request).then(async (response) =>
      response
      ||
      fetch(e.request)
      .then(
        async (response) =>
        response.ok
        ?
          response
        :
          ((await ifMapRequestSendMessage(e)) || true)
          &&
          response
      )
      .catch(
        async (error) => await ifMapRequestSendMessage(e)
      )
    )
  )
);

async function ifMapRequestSendMessage(e) {
  return (
    (e.request.url.indexOf("openstreetmap") > -1)
    &&
    await tellClientMapFailedToLoad(e)
  );
}

async function tellClientMapFailedToLoad(e) {
  return (
    await self.clients.matchAll().then((clients) =>
      clients.forEach((client) =>
        client.postMessage({
          msg: "MapFailedToLoad",
          url: e.request.url
        })
      )
    )
  );
}


})();