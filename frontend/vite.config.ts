import path from "node:path";
import { fileURLToPath } from "node:url";

import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { defineConfig, loadEnv } from "vite";

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import {
  VueRouterAutoImports,
  getPascalCaseRouteName,
} from "unplugin-vue-router";
import VueRouter from "unplugin-vue-router/vite";
import VueDevTools from "vite-plugin-vue-devtools";
import Layouts from "vite-plugin-vue-layouts";
import vuetify from "vite-plugin-vuetify";
import svgLoader from "vite-svg-loader";

// ======================================================
// VITE CONFIG
// ======================================================
export default defineConfig(({ mode }) => {
  // __dirname para ES Modules
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  // ======================================================
  // ENV CONFIG
  // ======================================================
  const envDir = path.resolve(__dirname, "../config");

  console.log("────────────────────────────────────");
  console.log("🧪 VITE MODE        =>", mode);
  console.log("📂 ENV DIRECTORY    =>", envDir);

  // Carga SOLO variables VITE_
  const env = loadEnv(mode, envDir, "VITE_");

  console.log("🧩 ENV VARIABLES    =>", env);
  console.log(
    "📄 ENV FILE ESPERADO =>",
    mode === "production"
      ? ".env / .env.production"
      : ".env / .env.development",
  );
  console.log("────────────────────────────────────");

  return {
    // 🔥 ESTO es lo que le dice a Vite dónde buscar los envs
    envDir,

    plugins: [
      // ----------------------------
      // Router automático
      // ----------------------------
      VueRouter({
        getRouteName: (routeNode) =>
          getPascalCaseRouteName(routeNode)
            .replace(/([a-z\d])([A-Z])/g, "$1-$2")
            .toLowerCase(),
      }),

      // ----------------------------
      // Vue
      // ----------------------------
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) =>
              tag === "swiper-container" || tag === "swiper-slide",
          },
        },
      }),

      VueDevTools(),
      vueJsx(),

      // ----------------------------
      // Vuetify
      // ----------------------------
      vuetify({
        styles: {
          configFile: "src/assets/styles/variables/_vuetify.scss",
        },
      }),

      // ----------------------------
      // Layouts
      // ----------------------------
      Layouts({
        layoutsDirs: "./src/layouts/",
      }),

      // ----------------------------
      // Auto Components
      // ----------------------------
      Components({
        dirs: ["src/@core/components", "src/views/demos", "src/components"],
        dts: true,
        resolvers: [
          (componentName) => {
            if (componentName === "VueApexCharts") {
              return {
                name: "default",
                from: "vue3-apexcharts",
                as: "VueApexCharts",
              };
            }
          },
        ],
      }),

      // ----------------------------
      // Auto Imports
      // ----------------------------
      AutoImport({
        imports: [
          "vue",
          VueRouterAutoImports,
          "@vueuse/core",
          "@vueuse/math",
          "vue-i18n",
          "pinia",
        ],
        dirs: [
          "./src/@core/utils",
          "./src/@core/composable/",
          "./src/composables/",
          "./src/utils/",
          "./src/plugins/*/composables/*",
        ],
        vueTemplate: true,
        ignore: ["useCookies", "useStorage"],
      }),

      // ----------------------------
      // SVG Loader
      // ----------------------------
      svgLoader(),
    ],

    // 🔥 Inyecta las variables VITE_ al frontend
    define: {
      "import.meta.env": {
        ...env,
      },
    },

    // ----------------------------
    // Alias
    // ----------------------------
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        "@themeConfig": fileURLToPath(
          new URL("./themeConfig.ts", import.meta.url),
        ),
        "@core": fileURLToPath(new URL("./src/@core", import.meta.url)),
        "@layouts": fileURLToPath(new URL("./src/@layouts", import.meta.url)),
        "@images": fileURLToPath(
          new URL("./src/assets/images/", import.meta.url),
        ),
        "@styles": fileURLToPath(
          new URL("./src/assets/styles/", import.meta.url),
        ),
        "@configured-variables": fileURLToPath(
          new URL(
            "./src/assets/styles/variables/_template.scss",
            import.meta.url,
          ),
        ),
        "@db": fileURLToPath(
          new URL("./src/plugins/fake-api/handlers/", import.meta.url),
        ),
        "@api-utils": fileURLToPath(
          new URL("./src/plugins/fake-api/utils/", import.meta.url),
        ),
      },
    },

    // ----------------------------
    // Build
    // ----------------------------
    build: {
      chunkSizeWarningLimit: 5000,
    },

    // ----------------------------
    // Optimize deps
    // ----------------------------
    optimizeDeps: {
      exclude: ["vuetify"],
      entries: ["./src/**/*.vue"],
    },
  };
});
