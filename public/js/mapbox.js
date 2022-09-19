/* eslint-disable */

export const displayMap = function (locations) {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibW9oYW1tZWRqYW1hbDIzNCIsImEiOiJjbDdpMXVxenMwazRlM3dzYXZrYTMxYjBvIn0.yo2Uwk79uGx2lk_IyWTVFQ';
  let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mohammedjamal234/cl7j8jgts002r14qw3z8hyt8r',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach((location) => {
    const el = document.createElement('div');
    el.classList.add('marker');

    const marker = new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(location.coordinates)
      .addTo(map);
    const popup = new mapboxgl.Popup({
      offset: 30,
      closeOnClick: false,
      maxWidth: 100,
      keepInView: true,
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p> Day ${location.day}:${location.description}</p>`)
      .addTo(map);

    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 200,
      right: 200,
    },
  });
};
