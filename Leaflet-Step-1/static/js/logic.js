//Create Map Types and Layer for User to select from.
var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
        accessToken: API_KEY
    });

var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.satellite",
    accessToken: API_KEY
});

var outdoor = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.outdoors",
    accessToken: API_KEY
});

//Create the Map to add the layers to.
var map = L.map("map", {
    center: [40.73, -99.0059],
    zoom: 4,
    layers: [lightmap, satellite, outdoor]
});

var baseMaps = {
    "Satellite": satellite,
    "Grayscale": lightmap,
    "Outdoor": outdoor
};

var plates = new L.layerGroup();
var earthquakes = new L.layerGroup();
var overlayMaps = {
    "Earthquakes": earthquakes, 
    "Fault Lines": plates
};


lightmap.addTo(map);
L.control.layers(baseMaps, overlayMaps).addTo(map);

(async function(){
    //Grab Earthquake Data
    const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
    const response = await d3.json(url)

    //Grab Fault Lines Data
    const url_lines = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
    const response_lines = await d3.json(url_lines)

    testingFunction(response)
    mapLines(response_lines)
})()

function mapLines(response_lines){
    var plate = response_lines.features;
    function lineOptions(feature){
        var polyline = L.polyline(feature.geometry.coordinates,{
            color:'red'
        });
        return polyline;
    }

    L.geoJSON(plate, {
        pointToLayer: function (feature, latlng) {
            return L.polyline(latlng)
        },
        style: lineOptions
        }).addTo(plates);
};

plates.addTo(map);

function testingFunction(response) {    
    var quake = response.features;
    function markerOptions(feature){
        var geojsonMarkerOptions = {
        radius: markerSize(feature.properties.mag),
        fillColor: getColor(feature.properties.mag),
        color: 'darkgrey',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
        };
        return geojsonMarkerOptions;
    };
    //Create circle for each entry, size of circle is based on Mag.
    function markerSize(mag) {
        if (mag === 0){
            mag=1
            return mag
        };
        return mag*4;
    };
    //Create the color of the Marker based on Mag
    function getColor(mag) {
        return mag >= 5  ? 'red' :
               mag >= 4   ? 'salmon' :
               mag >= 3   ? 'orange' :
               mag >= 2   ? 'gold' :
               mag >= 1   ? 'greenyellow' :
                          'green';
    };

L.geoJSON(quake, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng)
    },
    style: markerOptions,
    onEachFeature:function(feature,layer){
                layer.bindPopup("<h3>" + feature.properties.place + "<h3><h3>Mag: " + feature.properties.mag + "<h3>");
            }
    }).addTo(earthquakes);

earthquakes.addTo(map);
//LEGEND
//Source: https://leafletjs.com/examples/choropleth/
var legend = L.control({position: 'bottomright'});

legend.onAdd = function() {

    var div = L.DomUtil.create('div', 'info legend');
    var grades = [0, 1, 2, 3, 4, 5];
    var labels = ['green', 'greenyellow', 'gold', 'orange', 'salmon', 'red'];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + labels[i] + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};

legend.addTo(map);
};

