<template>
  <div>
    <loading :active.sync="isLoading"></loading>

    <div class="home row no-gutters">
      <div class="listArea">
        <div v-if="cityName.length" class="toolbox">
          <div class="sticky-top bg-white shadow-sm p-2">
            <h6 class="mask-title">口罩地圖 - 藥局地點查詢</h6>
            <div class="form-group d-flex">
              <label for="cityName" class="mr-2 col-form-label text-right">縣市</label>
              <div class="flex-fill">
                <select
                  id="cityName"
                  class="form-control"
                  v-model="select.city"
                  @change="select.area = ''"
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
                <select
                  id="area"
                  class="form-control"
                  v-if="select.city.length"
                  v-model="select.area"
                  @change="updateSelect"
                >
                  <option value>-- Select One --</option>
                  <option
                    :value="a.AreaName"
                    v-for="a in cityName.find((city) => city.CityName === select.city).AreaList"
                    :key="a.AreaName"
                  >{{ a.AreaName }}</option>
                </select>
              </div>
            </div>
            <p class="mb-0 small text-muted text-right">請先選擇區域查看（綠色表示還有口罩）</p>
          </div>

          <ul class="list-group">
            <template v-for="(item, key) in data">
              <a
                class="list-group-item text-left"
                :key="key"
                v-if="item.properties.county === select.city
                && item.properties.town === select.area"
                :class="{ 'highlight': item.properties.mask_adult || item.properties.mask_child, 'noMask': item.properties.mask_adult === 0, 'noMask': item.properties.mask_child === 0}"
                @click="penTo(item)"
              >
                <h3>
                  <a
                    :href="`https://www.google.com.tw/maps/place/${item.properties.address}`"
                    target="_blank"
                    title="Google Map"
                  >{{ item.properties.name }}</a>
                </h3>
                <p class="mb-1">電話：{{item.properties.phone}}</p>
                <p class="mb-1">
                  地址：{{ item.properties.address }}
                  <a
                    class="navigation-link"
                    :href="`https://www.google.com.tw/maps/place/${item.properties.address}`"
                    target="_blank"
                    title="於Google Map開啟"
                  >
                    <img class="navigation-icon" src="https://imgur.com/okN7VLW.png" alt=""/>
                  </a>
                </p>
                <p class="maskQty">
                  <span
                    class="a-mask"
                    :class="{ 'noStock': item.properties.mask_adult === 0}"
                  >成人口罩：{{item.properties.mask_adult}}</span>
                  <span
                    class="c-mask"
                    :class="{ 'noStock': item.properties.mask_child === 0}"
                  >兒童口罩：{{item.properties.mask_child}}</span>
                </p>
                <p class="small-text">最後更新時間：{{item.properties.updated}}</p>
              </a>
            </template>
          </ul>
        </div>
      </div>
      <div class="mapArea">
        <div id="map"></div>
      </div>
    </div>
  </div>
</template>

<script>
import L from "leaflet"; // 在OpenStreetMap裡使用標記功能
import cityName from "./assets/cityName.json"; // 將城市及行政區載入以便使用

let osmMap = {};

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
    // 使用bindPopup，在點擊大頭針時就可跳出座標的資訊（以字串方式帶入），這邊使用ES6的寫法使用反引號方便帶入API資訊
    L.marker([y, x], {
      icon,
    }).addTo(osmMap).bindPopup(`
    <div class="popup-content">
    <h4>${item.name}</h4> 
    <a
      class="popup-link" 
      href="https://www.google.com.tw/maps/place/${item.address}"
      target="_blank"
      title="於Google Map開啟">
      <img class="popup-link-icon" src="https://imgur.com/okN7VLW.png" alt="">
    </a>
    <br>
    <p>
    口罩剩餘：<strong>
    成人 - ${item.mask_adult ? `${item.mask_adult} 個` : "無庫存"}/ 
    兒童 - ${item.mask_child ? `${item.mask_child} 個` : "無庫存"}
    </strong>
    </p>
    <br>
    <p>
    地址: ${item.address}</a>
    </p>
    <br>
    <p>電話: ${item.phone}</p>
    <br>
    <small>最後更新時間: ${item.updated}</small>
    </div>
    `);
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
        `
    <div class="popup-content">
    <h4>${item.name}</h4> 
    <a
      class="popup-link" 
      href="https://www.google.com.tw/maps/place/${item.address}"
      target="_blank"
      title="於Google Map開啟">
      <img class="popup-link-icon" src="https://imgur.com/okN7VLW.png" alt="">
    </a>
    <br>
    <p>
    口罩剩餘：<strong>
    成人 - ${item.mask_adult ? `${item.mask_adult} 個` : "無庫存"}/ 
    兒童 - ${item.mask_child ? `${item.mask_child} 個` : "無庫存"}
    </strong>
    </p>
    <br>
    <p>
    地址: ${item.address}</a>
    </p>
    <br>
    <p>電話: ${item.phone}</p>
    <br>
    <small>最後更新時間: ${item.updated}</small>
    </div>`
      )
      .openPopup();
  },
};

export default {
  name: "home",
  data: () => ({
    cityName,
    data: {},
    osmMap: {},
    select: {
      city: "臺北市",
      area: "大安區",
    },
    isLoading: false,
  }),
  methods: {
    updateMarker() {
      // 第一次迴圈：使用filter跑迴圈，先將台北市的藥局資訊抓出
      const pharmacies = this.data.filter((pharmacy) => {
        if (!this.select.area) {
          return pharmacy.properties.county === this.select.city;
        }
        return pharmacy.properties.town === this.select.area;
      });
      // 第二次回圈：使用forEach跑迴圈，是為了確認將台北市的藥局加到畫面上，並將大頭針釘在指定座標上
      pharmacies.forEach((pharmacy) => {
        const { properties, geometry } = pharmacy;
        // pharmacy.geometry.coordinates為API中的座標
        // pharmacy.geometry.coordinates[1],
        // pharmacy.geometry.coordinates[0],
        // 因前面已使用const取用pharmacy中的properties即geometry，因此不需寫pharmacy
        osm.addMapMarker(
          geometry.coordinates[0],
          geometry.coordinates[1],
          properties
        );
      });
      // this.penTo(pharmacies[0]);
    },
    removeMarker() {
      osm.removeMapMarker();
    },
    penTo(pharmacy) {
      const { properties, geometry } = pharmacy;
      osm.penTo(geometry.coordinates[0], geometry.coordinates[1], properties);
    },
    updateSelect() {
      this.removeMarker();
      this.updateMarker();
      const pharmacy = this.data.find(
        (item) => item.properties.town === this.select.area
      );
      const { geometry, properties } = pharmacy;
      osm.penTo(geometry.coordinates[0], geometry.coordinates[1], properties);
    },
  },
  mounted() {
    // OSM
    osmMap = L.map("map", {
      center: [25.03, 121.55],
      zoom: 15,
    });
    // 載入地圖的tileLayer，也就是以圖片拼接出來的完整大地圖
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '<a target="_blank" href="https://www.openstreetmap.org/">© OpenStreetMap 貢獻者</a>',
      maxZoom: 18,
    }).addTo(osmMap);
    // 載入有販售口罩的藥局資訊
    const vm = this;
    vm.isLoading = true;
    this.$http
      .get(
        "https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json"
      )
      .then((res) => {
        this.data = res.data.features;
        this.updateMarker();
        vm.isLoading = false;
      });
  },
};
</script>

<style lang="scss">
@import "bootstrap/scss/bootstrap";

#map {
  height: 100vh;
}

.mask-title {
  text-align: center;
  background: #003060;
  color: white;
  padding: 8px;
  border-radius: 5px;
}

.listArea {
  width: 380px;
}

.mapArea {
  width: calc(100% - 380px);
}

@media (max-width: 1028px) {
  .listArea {
    width: 350px;
  }
  .mapArea {
    width: calc(100% - 350px);
  }
}
@media (max-width: 768px) {
  .listArea {
    width: 300px;
  }
  .mapArea {
    width: calc(100% - 300px);
  }
  .a-mask,
  .c-mask {
    font-size: 14px;
  }
}

.home {
  position: relative;
}

.hightlight {
  position: relative;
}

.highlight:hover {
  background: #c4e1ff;
  text-decoration: none;
  cursor: default;
}
.hightlight:focus {
  background: #acd6ff;
}

.noMask {
  background: #ffd2d2;
}

.noMask:hover {
  cursor: default;
  background: #ffb5b5;
  text-decoration: none;
}

.toolbox {
  height: 100vh;
  overflow-y: auto;

  a {
    cursor: pointer;
  }
}

h3 a {
  color: #408080;
}

h3 a:hover {
  color: #408080;
}

p,
a {
  color: #272727;
}

.navigation-link {
  display: block;
  background: #e0e0e0;
  border-radius: 1px;
  text-align: center;
  margin-left: 15px;
  position: absolute;
  top: 15px;
  right: 15px;
}

.navigation-icon {
  width: 40px;
  padding: 10px;
}

.maskQty {
  margin: 15px 0;
}

.a-mask {
  background: #d1e9e9;
  padding: 10px 5px;
  border-radius: 5px;
}

.c-mask {
  background: #ffe6d9;
  padding: 10px 5px;
  border-radius: 5px;
  margin-left: 5px;
}

.popup-content {
  line-height: 1em;
  h4 {
    margin: 0 0 10px 0;
    padding-top: 7px;
    color: #408080;
  }
  p {
    margin: 0;
    font-size: 13px;
  }
}

.popup-link {
  display: block;
  background: #f0f0f0;
  border-radius: 1px;
  text-align: center;
  margin-left: 15px;
  position: absolute;
  top: 15px;
  right: 17px;
}

.popup-link-icon {
  width: 40px;
  padding: 10px;
}

.noStock {
  color: red;
}

.small-text {
  font-size: 10px;
}
</style>