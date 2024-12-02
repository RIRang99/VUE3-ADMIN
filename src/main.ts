import { createApp } from "vue";
import { createPinia } from "pinia";
import "./style.css";
import App from "./App.vue";
import Antd from "ant-design-vue";
import router from "@/router/index";
import "ant-design-vue/dist/reset.css";

const pinia = createPinia();

createApp(App).use(pinia).use(Antd).use(router).mount("#app");
