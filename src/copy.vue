<template>
  <div id="app">
    <div class="row no-gutters">
      <div class="col-sm-3">
        <div class="toolbox">
          <div class="sticky-top bg-white shadow-sm p-2">
            <div class="form-group d-flex">
              <label for="cityName" class="mr-2 col-form-label text-right">縣市</label>
              <div class="flex-fill">
                <select
                  id="cityName"
                  class="form-control"
                  v-model="select.city"
                  @change="removeMapMarker(); updateMap()"
                >
                  <option value>-- Select One --</option>
                  <option
                    :value="c.CityName"
                    v-for="c in cityName"
                    :key="c.CityName"
                  >{{ c.CityName }}</option>
                </select>
              </div>
            </div>
            <div class="form-group d-flex">
              <label for="area" class="mr-2 col-form-label text-right">地區</label>
              <div class="flex-fill">
                <select id="area" class="form-control">
                  <option value>-- Select One --</option>
                </select>
              </div>
            </div>
            <p class="mb-0 small text-muted text-right">請先選擇區域查看（綠色表示還有口罩）</p>
          </div>
          <ul class="list-group">
            <template>
              <a class="list-group-properties text-left">
                <h3>藥局名稱</h3>
                <p class="mb-0">成人口罩：1 | 兒童口罩：2</p>
                <p class="mb-0">
                  地址：
                  <a
                    href="https://www.google.com.tw/maps/place/..."
                    target="_blank"
                    title="Google Map"
                  >地址</a>
                </p>
              </a>
            </template>
          </ul>
        </div>
      </div>
      <div class="col-sm-9">
        <div id="map"></div>
      </div>
    </div>
  </div>
</template>

<script>
import L from "leaflet"; // 在OpenStreetMap裡使用標記功能
import cityName from "./assets/cityName.json"; // 將城市及行政區載入以便使用

let osmMap = {}; // 宣告後於mounted地圖座標中帶入座標位置
const iconsConfig = {
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
};
const icons = {
  green: new L.Icon({
    iconUrl:
      "https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    ...iconsConfig,
  }),
  grey: new L.Icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png",
    ...iconsConfig,
  }),
};
const osm = {
  addMapMarker(x, y, item) {
    const icon = item.mask_adult || item.mask_child ? icons.green : icons.grey;
    L.marker([y, x], {
      icon,
    }).addTo(osmMap).bindPopup(`<strong>${item.name}</strong> <br>
    口罩剩餘：<strong>成人 - ${
      item.mask_adult ? `${item.mask_adult} 個` : "未取得資料"
    }/ 兒童 - ${
      item.mask_child ? `${item.mask_child} 個` : "未取得資料"
    }</strong><br>
    地址: <a href="https://www.google.com.tw/maps/place/${
      item.address
    }" target="_blank">${item.address}</a><br>
    電話: ${item.phone}<br>
    <small>最後更新時間: ${item.updated}</small>`);
  },
  removeMapMarker() {
    osmMap.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        osmMap.removeLayer(layer);
      }
    });
  },
  penTo(x, y, item) {
    const icon = item.mask_adult || item.mask_child ? icons.green : icons.grey;
    osmMap.panTo(new L.LatLng(y, x));
    L.marker([y, x], {
      icon,
    })
      .addTo(osmMap)
      .bindPopup(
        `<strong>${item.name}</strong> <br>
    口罩剩餘：<strong>成人 - ${
      item.mask_adult ? `${item.mask_adult} 個` : "未取得資料"
    }/ 兒童 - ${
          item.mask_child ? `${item.mask_child} 個` : "未取得資料"
        }</strong><br>
    地址: <a href="https://www.google.com.tw/maps/place/${
      item.address
    }" target="_blank">${item.address}</a><br>
    電話: ${item.phone}<br>
    <small>最後更新時間: ${item.updated}</small>`
      )
      .openPopup();
  },
};

console.log(L);
export default {
  name: "App",
  data: () => ({
    cityName,
    select: {
      city: "臺北市",
      area: "大安區",
    },
  }),
  methods: {
    updateMap() {
      // 第一次迴圈：使用filter跑迴圈，先將台北市的藥局資訊抓出
      const pharmacies = this.data.filter(
        (pharmacy) => pharmacy.properties.county === this.select.city
      );
      // 第二次回圈：使用forEach跑迴圈，是為了確認將台北市的藥局加到畫面上，並將大頭針釘在指定座標上
      pharmacies.forEach((pharmacy) => {
        // 這樣的寫法等於是只取用pharmacy裡的porperties以及geometry資料，非全部資料，因此可省略掉在前面寫的pharmacy
        const { properties, geometry } = pharmacy;
        L.marker([
          // pharmacy.geometry.coordinates為API中的座標
          // pharmacy.geometry.coordinates[1],
          // pharmacy.geometry.coordinates[0],
          // 因前面已使用const取用pharmacy中的properties即geometry，因此不需寫pharmacy
          geometry.coordinates[1],
          geometry.coordinates[0],
          // 使用bindPopup，在點擊大頭針時就可跳出座標的資訊（以字串方式帶入），這邊使用ES6的寫法使用反引號方便帶入API資訊
        ]).addTo(osmMap).bindPopup(`
          <strong>${properties.name}</strong> <br>
          口罩剩餘：<strong>成人 - ${
            properties.mask_adult ? `${properties.mask_adult} 個` : "未取得資料"
          }/ 兒童 - ${
          properties.mask_child ? `${properties.mask_child} 個` : "未取得資料"
        }</strong><br>
          地址: <a href="https://www.google.com.tw/maps/place/${
            properties.address
          }" target="_blank">${properties.address}</a><br>
          電話: ${properties.phone}<br>
          <small>最後更新時間: ${properties.updated}</small>`);
      });
      this.penTo(pharmacies[0]);
    },
    removeMapMarker() {
      osmMap.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          osmMap.removeLayer(layer);
        }
      });
    },
    penTo(pharmacy) {
      const { properties, geometry } = pharmacy;
      osmMap.panTo(
        geometry.coordinates[0],
        geometry.coordinates[1],
        properties
      );
    },
  },
  // 於mounted階段載入以下功能
  mounted() {
    // 載入有販售口罩的藥局資訊
    const url =
      "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json";
    this.$http.get(url).then((response) => {
      console.log(response);
      this.data = response.data.features;
      this.updateMap();
    });

    // 將地圖中心點設定於指定的座標
    osmMap = L.map("map", {
      center: [25.03, 121.55],
      zoom: 15,
    });

    // 載入地圖的tileLayer，也就是以圖片拼接出來的完整大地圖
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '<a target="_blank" href="https://www.openstreetmap.org/">© OpenStreetMap 貢獻者</a>',
      maxZoom: 18, // 最大放大倍數，此處設定為18倍
    }).addTo(osmMap);

    // 加入Marker，也就是在地圖上的大頭針，這邊就先以osmMap的座標作為大頭針的位置
    // 新增一個圖標就等於新增很多的圖層，因此為了要隨著藥局的位置新增圖標，需要將加入Marker功能寫到methods裡的updateMap()裡
    // L.marker([25.03, 121.55]).addTo(osmMap);
  },
};
</script>

<style lang="scss">
@import "bootstrap/scss/bootstrap";
#map {
  height: 100vh;
}
.highlight {
  background: #e9ffe3;
}
.toolbox {
  height: 100vh;
  overflow-y: auto;
  a {
    cursor: pointer;
  }
}
</style>
