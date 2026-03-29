import { createPinia } from "pinia"; // Importa Pinia
import { createApp } from "vue";

import App from "@/App.vue";
import { registerPlugins } from "@core/utils/plugins";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Toastify from "vue3-toastify";
import "vue3-toastify/dist/index.css";
// Styles
import "@core/scss/template/index.scss";
import "@styles/cardStyles.css";
import "@styles/styles.css";
import "@styles/styles.scss";

// Create vue app
const app = createApp(App);

// Crea la instancia de Pinia
const pinia = createPinia();

// Usa Pinia en la aplicación
app.use(pinia);

// Register plugins
app.use(Toastify);

registerPlugins(app);

// Mount vue app
app.mount("#app");
