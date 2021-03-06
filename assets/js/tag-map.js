/* global domready, L */
(function (global, domReady, L) {
    "use strict";

    var config, map,
        RB = global.RB = global.RB || {},
        doc = global.document,
        simplified = (doc.location.hash === '#simplified-map');

    function _init() {
        var layers = RB.layers(config.ignApiKey, L, "IGN Scan express", config.layerReadyClass),
            layersControl;

        map = L.map(doc.querySelector(config.map), {
            zoom: config.zoom,
            center: config.point,
            layers: [layers.defaultLayer],
            fullscreenControl: !simplified,
            zoomControl: !simplified,
            attributionControl: !simplified,
        });
        if ( !simplified ) {
            if ( config.popup ) {
                L.popup()
                    .setContent(config.popupContent ? config.popupContent : config.title)
                    .setLatLng(config.point)
                    .addTo(map);
            }
            layersControl = L.control.layers(layers.layers, {}, {position: 'topleft'}).addTo(map);
            L.control.scale({imperial: false}).addTo(map);
            RB.photos(config.photosUrl, map, [], layersControl);
        }
    }

    RB.tagMap = function (conf) {
        config = conf;
        domReady(_init);
    };
})(window, domready, L);
