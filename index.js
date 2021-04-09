import 'ol/ol.css';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import OSM from 'ol/source/OSM';

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    }),
    new TileLayer({
        id: "positions",
        visible: true,
        selectable: "html",
        source: new TileWMS({
          refresh: {
            force: true,
          },
          visible: true,
          projections: ["EPSG:4326"],
          url: "http://localhost:8001/SEGServer/v1/wms/SEGGetMap",
          params: {
            LAYERS: "SEG:SEG_ALL",
            VERSION: "1.1.0",
          },
          serverType: 'geoserver',
          tileLoadFunction: function(image, src) {
            console.log(image)
            //imageTile.getImage().src = src;
            var xhr = new XMLHttpRequest();
            const dataEntries = src.split("?");
            const url = dataEntries[0];
            const params = dataEntries[1];
            xhr.open('POST', url, true);
            xhr.responseType = 'arraybuffer';
            xhr.onload = function(e) {
              //image.getImage().src = this.response;
              if (this.status === 200) {
                var uInt8Array = new Uint8Array(this.response);
                var i = uInt8Array.length;
                var binaryString = new Array(i);
                while (i--) {
                  binaryString[i] = String.fromCharCode(uInt8Array[i]);
                }
                var data = binaryString.join('');
                var type = xhr.getResponseHeader('content-type');
                if (type.indexOf('image') === 0) {
                  //console.log('data:' + type + ';base64,' + window.btoa(data));
                  image.getImage().src = 'data:' + type + ';base64,' + window.btoa(data);
                }
              }
            };
            //SET THE PROPER HEADERS AND FINALLY SEND THE PARAMETERS 
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.setRequestHeader("Content-length", params.length);
            xhr.setRequestHeader("Connection", "close");
            xhr.send(params);
          }
        }),
      })
  ],
  view: new View({
    center: [0, 0],
    zoom: 0
  })
});