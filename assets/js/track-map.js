/* global define */
define(['domReady', 'leaflet'], function (domReady, L) {
    "use strict";

    var config, map, track,
        doc = window.document;

    function _getBounds() {
        var bounds = track.bounds;

        return [[bounds.minlat, bounds.minlon], [bounds.maxlat, bounds.maxlon]];
    }

    function _initApp() {
        var container = doc.querySelector(config.container),
            map = doc.querySelector(config.map);
        
        map.style.height = window.innerHeight * 0.9 + "px";

        _initSidebar();
        _initMap();
        container.classList.add(config.classes.appInitialized);
    }

    function _initSidebar() {
        var sidebar = doc.querySelector(config.sidebar);

        sidebar.addEventListener('click', function (e) {
            if ( e.target.classList.contains(config.classes.tab) ) {
                e.preventDefault();
                _switchTab(sidebar, e.target);
            }
        });
    }

    function _switchTab(sidebar, tab) {
        if ( tab.classList.contains(config.classes.tabFocused) ) {
            return;
        }

        sidebar.querySelector('.' + config.classes.tabFocused).classList.remove(config.classes.tabFocused);
        tab.classList.add(config.classes.tabFocused);

        sidebar.querySelector('.' + config.classes.panelVisible).classList.remove(config.classes.panelVisible);
        sidebar.querySelector(tab.getAttribute('href')).classList.add(config.classes.panelVisible);
    }

    function _initMap() {
        var layers, line, marker, profile, tooltip, chart, info, infoTpl,
            start = {lat: track.points[0].lat, lon: track.points[0].lon};

        layers = {
            "IGN Scan express": L.tileLayer("http://wxs.ign.fr/" + config.ignApiKey
                    + "/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&"
                    + "LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS.SCAN-EXPRESS.CLASSIQUE&STYLE=normal&TILEMATRIXSET=PM&"
                    + "TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg", {
                attribution: '&copy; <a href="http://www.ign.fr/">IGN</a>',
            }),
            "IGN Topo": L.tileLayer("http://wxs.ign.fr/" + config.ignApiKey
                    + "/geoportail/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&"
                    + "LAYER=GEOGRAPHICALGRIDSYSTEMS.MAPS&STYLE=normal&TILEMATRIXSET=PM&"
                    + "TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image%2Fjpeg", {
                attribution: '&copy; <a href="http://www.ign.fr/">IGN</a>',
            }),
        };

        map = L.map(doc.querySelector(config.map), {
            layers: [layers["IGN Scan express"]],
        });
        map.fitBounds(_getBounds());
        L.control.layers(layers, {}, {position: 'topleft'}).addTo(map);

        if ( map.getZoom() > config.maxAutoZoom ) {
            map.setZoom(config.maxAutoZoom, {animated: true});
        }

        line = L.polyline(track.points, {
            color: config.style.color,
            opacity: config.style.pathOpacity,
            weight: config.style.weight,
        });
        line.addTo(map);
        marker = L.marker(start).addTo(map);

        profile = doc.querySelector(config.profile);
        tooltip = doc.querySelector(config.profileTooltip);
        chart = doc.querySelector(config.profileChart);
        info = doc.querySelector(config.profileTooltipInfo);
        infoTpl = info.getAttribute('data-tpl');

        profile.addEventListener('mouseover', function (e) {
            profile.classList.add(config.classes.mouseTracked);
        });

        chart.addEventListener('mousemove', function (e) {
            var chartWidth = parseFloat(this.clientWidth),
                d = track.distance * e.layerX / chartWidth,
                i, point;

            if ( e.layerX > chartWidth/2 ) {
                info.classList.add(config.classes.tooltipOnLeft);
            } else {
                info.classList.remove(config.classes.tooltipOnLeft);
            }

            for (i = 0; i != track.points.length; i++) {
                point = track.points[i];
                if ( point.dst >= d ) {
                    tooltip.style.left = e.layerX + 'px';
                    info.innerHTML = infoTpl.replace('%alt%', Math.round(point.ele));
                    marker.setLatLng({lat: point.lat, lon: point.lon});
                    if ( !map.getBounds().contains(marker.getLatLng()) ) {
                        map.panTo(marker.getLatLng());
                    }
                    break;
                }
            }
        }, false);
    }

    return {
        init: function (data, conf) {
            track = data;
            config = conf;
            domReady(_initApp);
        },
    };
});