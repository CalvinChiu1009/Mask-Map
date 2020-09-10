import Vue from 'vue';
import axios from 'axios';
import VueAxios from 'vue-axios';
import Loading from 'vue-loading-overlay'; // 讀取中畫面
import 'vue-loading-overlay/dist/vue-loading.css'; // 讀取中畫面的css

import App from './App.vue';

Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
Vue.component('Loading', Loading); // 因為Loading是一個元件，因此要用Vue.component(要呈現的元件名稱, 元件)的方式來載入

new Vue({
  render: (h) => h(App),
}).$mount('#app');
