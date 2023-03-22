<template>
  <div id="toolbar">
    <table>
      <tbody data-bind="foreach: layers">
        <tr
          data-bind="css: { up: $parent.upLayer === $data, down: $parent.downLayer === $data }"
        >
          <td><input type="checkbox" data-bind="checked: show" /></td>
          <td>
            <span
              data-bind="text: name, visible: !$parent.isSelectableLayer($data)"
            ></span>
            <select
              data-bind="visible: $parent.isSelectableLayer($data), options: $parent.baseLayers, optionsText: 'name', value: $parent.selectedLayer"
            ></select>
          </td>
          <td>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              data-bind="value: alpha, valueUpdate: 'input'"
            />
          </td>
          <td>
            <button
              type="button"
              class="cesium-button"
              data-bind="click: function() { $parent.raise($data, $index()); }, visible: $parent.canRaise($index())"
            >
              ▲
            </button>
          </td>
          <td>
            <button
              type="button"
              class="cesium-button"
              data-bind="click: function() { $parent.lower($data, $index()); }, visible: $parent.canLower($index())"
            >
              ▼
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: "layerTree",
  components: {},
  data() {
    return {};
  },
  mounted() {
    this.$nextTick(() => {
      const imageryLayers = window.viewer.imageryLayers;
      const viewModel = {
        layers: [],
        baseLayers: [],
        upLayer: null,
        downLayer: null,
        selectedLayer: null,
        isSelectableLayer: function (layer) {
          return this.baseLayers.indexOf(layer) >= 0;
        },
        raise: function (layer, index) {
          imageryLayers.raise(layer);
          viewModel.upLayer = layer;
          viewModel.downLayer = viewModel.layers[Math.max(0, index - 1)];
          updateLayerList();
          window.setTimeout(function () {
            viewModel.upLayer = viewModel.downLayer = null;
          }, 10);
        },
        lower: function (layer, index) {
          imageryLayers.lower(layer);
          viewModel.upLayer =
            viewModel.layers[Math.min(viewModel.layers.length - 1, index + 1)];
          viewModel.downLayer = layer;
          updateLayerList();
          window.setTimeout(function () {
            viewModel.upLayer = viewModel.downLayer = null;
          }, 10);
        },
        canRaise: function (layerIndex) {
          return layerIndex > 0;
        },
        canLower: function (layerIndex) {
          return layerIndex >= 0 && layerIndex < imageryLayers.length - 1;
        },
      };
      const baseLayers = viewModel.baseLayers;
      Cesium.knockout.track(viewModel);
      function setupLayers() {
        // Create all the base layers that this example will support.
        // These base layers aren't really special.  It's possible to have multiple of them
        // enabled at once, just like the other layers, but it doesn't make much sense because
        // all of these layers cover the entire globe and are opaque.
        addBaseLayerOption("Bing Maps Aerial", undefined); // the current base layer
        addBaseLayerOption(
          "Bing Maps Road",
          Cesium.createWorldImagery({
            style: Cesium.IonWorldImageryStyle.ROAD,
          })
        );
        addBaseLayerOption(
          "ArcGIS World Street Maps",
          new Cesium.ArcGisMapServerImageryProvider({
            url: "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer",
          })
        );
        addBaseLayerOption(
          "OpenStreetMaps",
          new Cesium.OpenStreetMapImageryProvider()
        );
        addBaseLayerOption(
          "Stamen Maps",
          new Cesium.OpenStreetMapImageryProvider({
            url: "https://stamen-tiles.a.ssl.fastly.net/watercolor/",
            fileExtension: "jpg",
            credit:
              "Map tiles by Stamen Design, under CC BY 3.0. Data by OpenStreetMap, under CC BY SA.",
          })
        );
        addBaseLayerOption(
          "Natural Earth II (local)",
          new Cesium.TileMapServiceImageryProvider({
            url: Cesium.buildModuleUrl("Assets/Textures/NaturalEarthII"),
          })
        );
        addBaseLayerOption(
          "USGS Shaded Relief (via WMTS)",
          new Cesium.WebMapTileServiceImageryProvider({
            url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSShadedReliefOnly/MapServer/WMTS",
            layer: "USGSShadedReliefOnly",
            style: "default",
            format: "image/jpeg",
            tileMatrixSetID: "default028mm",
            maximumLevel: 19,
            credit: "U. S. Geological Survey",
          })
        );

        // Create the additional layers
        addAdditionalLayerOption(
          "土地利用图层",
          new Cesium.WebMapServiceImageryProvider({
            url: "http://118.31.71.216:8080/geoserver/sjh/wms",
            layers: "sjh:SJH_class_20171219",
            credit: "土地利用",
            parameters: {
              transparent: "true",
              format: "image/png",
            },
          })
        );
        addAdditionalLayerOption(
          "核心区",
          new Cesium.WebMapServiceImageryProvider({
            url: "http://118.31.71.216:8080/geoserver/sjh/wms",
            layers: "sjh:hxq2",
            credit: "核心区",
            parameters: {
              transparent: "true",
              format: "image/png",
            },
          })
        );
        addAdditionalLayerOption(
          "实验区",
          new Cesium.WebMapServiceImageryProvider({
            url: "http://118.31.71.216:8080/geoserver/sjh/wms",
            layers: "sjh:syq",
            credit: "实验区",
            parameters: {
              transparent: "true",
              format: "image/png",
            },
          })
        );
        addAdditionalLayerOption(
          "缓冲区",
          new Cesium.WebMapServiceImageryProvider({
            url: "http://118.31.71.216:8080/geoserver/sjh/wms",
            layers: "sjh:hcq",
            credit: "缓冲区",
            parameters: {
              transparent: "true",
              format: "image/png",
            },
          })
        );
        addAdditionalLayerOption(
          "湿地监测点",
          new Cesium.WebMapServiceImageryProvider({
            url: "http://118.31.71.216:8080/geoserver/sjh/wms",
            layers: "sjh:sjh:sjh_point_name",
            credit: "湿地监测点",
            parameters: {
              transparent: "true",
              format: "image/png",
            },
          })
        );
      }
      function addBaseLayerOption(name, imageryProvider) {
        let layer;
        if (typeof imageryProvider === "undefined") {
          layer = imageryLayers.get(0);
          viewModel.selectedLayer = layer;
        } else {
          layer = new Cesium.ImageryLayer(imageryProvider);
        }
        layer.name = name;
        baseLayers.push(layer);
      }

      function addAdditionalLayerOption(name, imageryProvider, alpha, show) {
        const layer = imageryLayers.addImageryProvider(imageryProvider);
        layer.alpha = Cesium.defaultValue(alpha, 0.5);
        layer.show = Cesium.defaultValue(show, true);
        layer.name = name;
        Cesium.knockout.track(layer, ["alpha", "show", "name"]);
      }

      function updateLayerList() {
        const numLayers = imageryLayers.length;
        viewModel.layers.splice(0, viewModel.layers.length);
        for (let i = numLayers - 1; i >= 0; --i) {
          viewModel.layers.push(imageryLayers.get(i));
        }
      }

      setupLayers();
      updateLayerList();

      //Bind the viewModel to the DOM elements of the UI that call for it.
      const toolbar = document.getElementById("toolbar");
      Cesium.knockout.applyBindings(viewModel, toolbar);

      Cesium.knockout
        .getObservable(viewModel, "selectedLayer")
        .subscribe(function (baseLayer) {
          // Handle changes to the drop-down base layer selector.
          let activeLayerIndex = 0;
          const numLayers = viewModel.layers.length;
          for (let i = 0; i < numLayers; ++i) {
            if (viewModel.isSelectableLayer(viewModel.layers[i])) {
              activeLayerIndex = i;
              break;
            }
          }
          const activeLayer = viewModel.layers[activeLayerIndex];
          const show = activeLayer.show;
          const alpha = activeLayer.alpha;
          imageryLayers.remove(activeLayer, false);
          imageryLayers.add(baseLayer, numLayers - activeLayerIndex - 1);
          baseLayer.show = show;
          baseLayer.alpha = alpha;
          updateLayerList();
        });
    });
  },
};
</script>

<style scoped>
#toolbar {
  background: rgba(42, 42, 42, 0.8);
  padding: 4px;
  border-radius: 4px;
}

#toolbar input {
  vertical-align: middle;
  padding-top: 2px;
  padding-bottom: 2px;
}

#toolbar table tr {
  transform: translateY(0);
  transition: transform 0.4s ease-out;
}

#toolbar table tr.up {
  transform: translateY(33px);
  transition: none;
}

#toolbar table tr.down {
  transform: translateY(-33px);
  transition: none;
}
</style>
