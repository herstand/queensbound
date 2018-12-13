(() => {
const cacheName = 'queensbound-v1';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return (
        cache.addAll([
          './',
          'index.html',
          'favicon.png',
          'css/style.css',
          'images/loader.gif',
          'images/logo.jpeg',
          'images/person.png',
          'images/poem.png',
          'js/app.js',
          'js/queensbound.js',
          'css/thirdparty/openlayers.css',
          'js/thirdparty/openlayers.js'
        ])
        &&
        cache.addAll([
          'audio/[ their spine ] by Joseph O. Legaspi.mp3',
          'audio/7 to 46th Street_Bliss by KC Trommer.mp3',
          'audio/A True Account of Talking to the 7 In Sunnyside by Paolo Javier.mp3',
          'audio/All Possible Fates by Jared Harél.mp3',
          'audio/Cornrows by Maria Lisella.mp3',
          'audio/Hawthorne Court by Maria Terrone.mp3',
          'audio/Here I Love You New York by Abeer Y. Hoque.mp3',
          'audio/Industrial Design & Sunset by Safia Jama.mp3',
          'audio/Kalpana Chawla Way by Malcolm Chang.mp3',
          'audio/Liberty Ashes (Keep Rising) by Sherese Francis.mp3',
          'audio/Matarose Tags G - Dragon on the 7 by Rosebud Ben-Oni.mp3',
          'audio/Next Summer by Nicole Haroutunian.mp3',
          'audio/Psalm of the Garden In the City by Catherine Fletcher.mp3',
          'audio/Queens Communion by Vikas K. Menon.mp3',
          'audio/The Odds of It by KC Trommer.mp3',
          'audio/When They Come for Us on the 7 Train by Ananda Lima.mp3'
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
    caches.match(
      e.request,
      {cacheName, cacheName, ignoreVary:true}
    )
    .then(async (response) =>
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