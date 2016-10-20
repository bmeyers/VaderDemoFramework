

//##################### General Settings #####################

var maps = [];
var center = [35.38781, -118.99631];
var zoom = 15.5;

var meterApiEndpoint = "/static/data/cache/meters.json",
    switchApiEndpoint = "/static/data/cache/switches.json",
    loadApiEndpoint = "/static/data/cache/load.json",
    nodeApiEndpoint = "/static/data/cache/node.json",
    feederApiEndpoint = "/static/data/cache/feeder.json";
//
// var meterApiEndpoint = "/vader/api/meter/\*",
//     switchApiEndpoint = "/vader/api/switch/\*",
//     loadApiEndpoint = "/vader/api/load/\*",
//     nodeApiEndpoint = "/vader/api/node/\*",
//     feederApiEndpoint = "/vader/api/feeder/\*";


var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 1
};

var geojsonMarkerOptions = {
    radius: 9,
    fillColor: "#ee5400",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

var normalIconSize = 20,
    bigIconSize = 30;
var normalIconDimens = [normalIconSize, normalIconSize],
    normalIconAnchor = [normalIconSize/2, normalIconSize/2],
    normalIconPopup  = [0, normalIconSize/2 - 3];
var bigIconDimens = [bigIconSize, bigIconSize],
    bigIconAnchor = [bigIconSize/2, bigIconSize/2],
    bigIconPopup  = [0, -bigIconSize/2 + 3];

var NormalGridIcon = L.Icon.extend({
    options: {
      iconUrl: '/static/images/icons/meter.png',
      // shadowUrl: 'leaf-shadow.png',
      iconSize:     normalIconDimens, // size of the icon
      // shadowSize:   [50, 64], // size of the shadow
      iconAnchor:   normalIconAnchor, // point of the icon which will correspond to marker's location
      // shadowAnchor: [4, 62],  // the same for the shadow
      popupAnchor:  normalIconPopup // point from which the popup should open relative to the iconAnchor
    }
});
var BigGridIcon = L.Icon.extend({
    options: {
      iconUrl: '/static/images/icons/switch.png',
      // shadowUrl: 'leaf-shadow.png',
      iconSize:     bigIconDimens, // size of the icon
      // shadowSize:   [50, 64], // size of the shadow
      iconAnchor:   bigIconAnchor, // point of the icon which will correspond to marker's location
      // shadowAnchor: [4, 62],  // the same for the shadow
      popupAnchor:  bigIconPopup // point from which the popup should open relative to the iconAnchor
    }
});

var meterIcon = new NormalGridIcon({iconUrl: '/static/images/icons/meter.png'}),
    switchIcon = new BigGridIcon({iconUrl: '/static/images/icons/switch.png'});

console.log("General Settings Finished");

//##################### Layers #####################

// Base Map Layers

var layer1 = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYmVuZHJhZmZpbiIsImEiOiJjaXRtMmx1NGwwMGE5MnhsNG9kZGJ4bG9xIn0.trghQwlKFrdvueMDquqkJA', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets'
});

var layer2 = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiYmVuZHJhZmZpbiIsImEiOiJjaXRtMmx1NGwwMGE5MnhsNG9kZGJ4bG9xIn0.trghQwlKFrdvueMDquqkJA', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.streets'
});



var meterLayer = L.layerGroup([]);
var switchLayer = L.layerGroup([]);
var lineLayer = L.layerGroup([]);

console.log("Layers Finished");

//##################### Maps #####################


var map1 = L.map('map1', {
    layers: [layer1, meterLayer, switchLayer, lineLayer],
    center: center,
    zoom: zoom
});
map1.attributionControl.setPrefix('');
// var map2 = L.map('map2', {
//     layers: [layer2],
//     center: center,
//     zoom: zoom,
//     zoomControl: false
// });

// Add each map to the map array. This will be useful for scalable calling later
maps.push(map1);
// maps.push(map2);
// maps.push(map3);



console.log("Maps Finished");

//##################### Handlers #####################


//---- Pop Up Related

var popup = L.popup();
function onMapClick(e, map) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at <br>" + e.latlng.toString())
        .openOn(map);
}

var temp, deets;
function pop_up(e) {
  if(!e) {
    return;
  }
  if(!e.popup._source) {
    return;
  }
  element_details = {}
  // Check if it is a path
  if('_path' in e.popup._source) {
    console.log("Path");
    if ('classList' in e.popup._source._path) {
      console.log("Path " + e.popup._source._path.classList);
      classes = e.popup._source._path.classList;
      for (index = 0; index < classes.length; ++index) {
        value = classes[index];
        if (value.substring(0, 4) === "line") {
             // You've found it, the full text is in `value`.
             // So you might grab it and break the loop, although
             // really what you do having found it depends on
             // what you need.
             element_details = {"type":"line", "name": value};
             break;
         }
      }
    }
  } else {
    element_details = JSON.parse(e.popup._source.getElement()['alt']);
  }
  temp = e;
  e.popup.setContent("Loading...").update();

  $.getJSON( "http://localhost:8000/vader/api/"+element_details['type']+"/"+element_details['name']+"", function(data) {
    e.popup.setContent(JSON.stringify(data['name'])).update();
  });

  // e.popup.setContent(marker + "Updated").update();
  // pop_name = marker.feature.properties.name;
  //
  // $.getJSON( "http://localhost:8000/vader/api/"+pop_name+"", function(datar) {
  //   // e.popup.setContent(datar).update();
  //   // alert(JSON.stringify(datar));
  //   contents = "<br><br><h3>"+marker.feature.properties.name+"</h3><br><TABLE>\
  //     <CAPTION>triplex_meter #1056</CAPTION>\
  //     <TR><TH WIDTH=\"35\" ALIGN=LEFT>Property<HR></TH>\
  //     <TH WIDTH=\"135\" COLSPAN=2 ALIGN=LEFT><NOBR>Line 1</NOBR><HR></TH>\
  //     <TH WIDTH=\"135\" COLSPAN=2 ALIGN=LEFT><NOBR>Line 2</NOBR><HR></TH>\
  //     <TH WIDTH=\"135\" COLSPAN=2 ALIGN=LEFT><NOBR>Neutral</NOBR><HR></TH>\
  //     </TR>\
  //     <TR><TH ALIGN=LEFT>Voltage</TH>\
  //     <TD ALIGN=RIGHT ><NOBR>"+datar.voltage_1+"</NOBR></TD>\
  //     <TD ALIGN=RIGHT ><NOBR>"+datar.voltage_2+"</NOBR></TD>\
  //     <TD ALIGN=RIGHT ><NOBR>"+datar.voltage_3+"</NOBR></TD>\
  //     <TR><TH ALIGN=LEFT>Power</TH>\
  //     <TD ALIGN=RIGHT ><NOBR>"+datar.power_1+"</NOBR</TD>\
  //     <TD ALIGN=RIGHT ><NOBR>"+datar.power_2+"</NOBR</TD>\
  //     <TD ALIGN=RIGHT ><NOBR>"+datar.power_3+"</NOBR</TD>\
  //     </TR>\
  //     </TABLE>";
  //
  //
  //   sparkline_contents="<br><br><div class=\"sparkline_one\">\
  //                 <canvas width=\"200\" height=\"60\" ></canvas></div>";
  //
  //   e.popup.setContent(contents + sparkline_contents).update();
  //
  //   $(".sparkline_one").sparkline([2, 4, 3, 4, 5, 4, 5, 4, 3, 4, 5, 6, 7, 5, 4, 3, 5, 6], {
  //     type: 'bar',
  //     height: '40',
  //     barWidth: 9,
  //     colorMap: {
  //       '7': '#a1a1a1'
  //     },
  //     barSpacing: 2,
  //     barColor: '#26B99A'
  //   });
  //
  // });

}

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties){// && feature.properties.popupContent) {
        layer.bindPopup("<div id=\"" + feature.properties.name + "\">" + feature.properties.name + ". This is a link: <a href='#' class='seeDetailsLink'>Click me</a></div>", {className: feature.properties.name, minWidth:500});
    }
}


//---- Layers Related

L.Control.Watermark = L.Control.extend({
    onAdd: function(map) {
      console.log("Testing");
        var img = L.DomUtil.create('img');

        img.src = 'https://www6.slac.stanford.edu/sites/all/themes/slac_www/logo.png';
        img.style.width = '200px';

        return img;
    },

    onRemove: function(map) {
      console.log("Testing");
        // Nothing to do here
    }
});

L.control.watermark = function(opts) {
  console.log("Testing");
    return new L.Control.Watermark(opts);
}

L.control.watermark({ position: 'bottomleft' }).addTo(map1);



//---- Movement Related



//---- Coloring Related



console.log("Handlers Finished");

//##################### Controls #####################



//
// L.ClickWindowHandler = L.Handler.extend({
//     addHooks: function() {
//         L.DomEvent.on(document, 'onClick', this._doSomething, this);
//     },
//
//     removeHooks: function() {
//         L.DomEvent.off(document, 'onClick', this._doSomething, this);
//     },
//
//     _doSomething: function(event) { alert('hi') }
// });


var baseLayers = {
    "Layer 1": layer1,
    "Layer 2": layer2
};

// Overlay Layers

var overlayLayers = {
    "Meters": meterLayer,
    "Switches": switchLayer,
    "Lines": lineLayer
};




console.log("Controls Finished");

//##################### Adding to Maps #####################


// L.Map.addInitHook('addHandler', '', L.ClickWindowHandler);
// function al(name) {
//   alert(name);
// }

var el = [];
maps.forEach(function(map){
  // Lines
  $.getJSON( "/static/data/model.geo.json", function(geo_json_data) {
    lineLayer.addLayer(L.geoJSON(geo_json_data,
        {filter: function(feature, layer) {return feature.geometry.type == "LineString";},
            onEachFeature: function(feature, layer) {
                  layer.bindPopup(feature.properties.name);
                  // layer.bindTooltip(feature.properties.name);
            },
            style: function(feature) {
              return {className:(feature.properties.name)};
            }
            // classname: function(feature, layer) {
            //   JSON.stringify({"type":"line","name":feature.properties.name})
            // }
      })//.bindPopup("hi")
    )//addTo(map);
  });


  $.getJSON( switchApiEndpoint, function(selements, error) {
    selements.forEach(function(element) {
      if (('latitude' in element) && ('longitude' in element)) {
        latlong = [parseFloat(element['latitude']), parseFloat(element['longitude'])];
        switchLayer.addLayer(L.marker(latlong, {
          icon: switchIcon,
          alt:JSON.stringify({"type":"switch","name":element['name']})
        }).bindPopup(element['name'] + " loading..."));
        //.bindTooltip(element['name']);
      } else {
        console.log(element['name'] + " Does Not Have Location Coordinates!!");
      }
    });
  });

  $.getJSON( meterApiEndpoint, function(elements, error) {
    elements.forEach(function(element) {
      latlong = [parseFloat(element['latitude']), parseFloat(element['longitude'])];
      meterLayer.addLayer(L.marker(latlong, {
        icon: meterIcon,
        alt:JSON.stringify({"type":"meter","name":element['name']})
      }).bindPopup(element['name'] + " loading..."));
    });
  });





  // $.getJSON( "/static/data/model.geo.json", function(geo_json_data) {
  //   var myLayer = L.geoJSON(geo_json_data, {
  //       style: myStyle,
  //       onEachFeature: onEachFeature,
  //       pointToLayer: function (feature, latlng) {
  //         element_num = parseInt(feature.properties.name.split("_")[1]);
  //         hexString = "#"+Math.min(element_num,255).toString(16) +"5400";
  //         geojsonMarkerOptions.fillColor = hexString;
  //         return L.circleMarker(latlng, geojsonMarkerOptions);
  //       }
  //   }).addTo(map);
  // });
});


maps.forEach(function(map){
  layerControl = L.control.layers(baseLayers, overlayLayers).addTo(map);
  // layerControl.addTo(map);
  map.on('click', function(e) {
    onMapClick(e, map);
  });
  map.on('popupopen', function(e) {
    pop_up(e);
  });
  // Sync to Other Maps
  // maps.forEach(function(syncMapTo){
  //   map.sync(syncMapTo);
  // });
  // map.addHandler('onClick', L.ClickWindowHandler)
});


console.log("Doneish");
