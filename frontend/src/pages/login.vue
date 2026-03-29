<script setup lang="ts">
import { showErrorMessage } from "@/components/apps/sweetAlerts/SweetAlets";
import { useTokenExpiringModal } from "@/composables/useTokenExpiringModal"; // o tu función de modal
import { router } from "@/plugins/1.router";
import { useAuthStore } from "@/stores/authStore"; // Importa el store
import { customRequest } from "@/utils/axiosInstance";
import logoTransparente from "@images/logos/logo - transparente.png";
const authStore = useAuthStore();

const { showTokenExpiringModal } = useTokenExpiringModal();

definePage({
  meta: {
    layout: "blank",
    public: true,
  },
});

const form = ref({
  email: "admin@gmail.com",
  password: "admin123",
  remember: false,
});

function detectDeviceType(): string {
  const ua = navigator.userAgent.toLowerCase();
  if (/(tablet|ipad)/i.test(ua)) return "tablet";
  if (/(mobi|android|iphone|ipod)/i.test(ua)) return "movil";
  return "desktop";
}

function getCurrentLocation(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number | null;
} | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null,
        });
      },
      () => resolve(null),
      {
        enableHighAccuracy: false,
        timeout: 2500,
        maximumAge: 60000,
      },
    );
  });
}

async function handleLogin() {
  const location = await getCurrentLocation();

  let response: any = await customRequest({
    url: "/api/login",
    method: "POST",
    data: {
      ...form.value,
      clientInfo: {
        user_agent: navigator.userAgent,
        device_type: detectDeviceType(),
        location,
      },
    },
  });
  if (response.data.result) {
    const userData = response.data.data.userData;
    const token = response.data.data.token;

    if (userData && token) {
      authStore.login(userData, token);
      setTimeout(() => {
        router.push({ name: "root" });
      }, 100);
    } else {
      showErrorMessage({
        title: "Error",
        message: "No se recibió información de usuario o token válida.",
      });
    }
  } else {
    // Maneja el error de inicio de sesión

    showErrorMessage({
      title: "Error",
      message: response.data.message,
    });
  }
  // Redirige a la página principal o dashboard
}

const isPasswordVisible = ref(false);
</script>

<template>
  <VRow no-gutters class="login-layout bg-surface">
    <VCol cols="12" lg="7" class="login-hero d-none d-lg-flex">
      <div class="login-hero__visual" aria-hidden="true">
        <img
          :src="logoTransparente"
          alt="Logo Seguridad CRM"
          class="login-hero__image"
        />
      </div>
    </VCol>

    <VCol
      cols="12"
      lg="5"
      class="login-panel d-flex align-center justify-center"
    >
      <div class="login-panel__inner">
        <div class="login-panel__brand mb-6 d-lg-none text-center">
          <img
            :src="logoTransparente"
            alt="Logo Seguridad CRM"
            class="login-panel__logo"
          />
        </div>

        <VCard flat class="login-card pa-2 pa-sm-4 pa-md-6">
          <VCardText class="pb-2">
            <h4 class="text-h6">Bienvenido a</h4>
            <h4 class="text-h3 mb-2 login-card__title w-full text-center">
              Sistema de Información Operativa y Coordinación
            </h4>
            <p class="text-body-1 text-medium-emphasis mb-0">
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </VCardText>

          <VCardText>
            <VForm @submit.prevent="handleLogin">
              <VRow>
                <VCol cols="12">
                  <AppTextField
                    v-model="form.email"
                    autofocus
                    label="Correo electrónico"
                    type="email"
                    placeholder="johndoe@email.com"
                  />
                </VCol>

                <VCol cols="12">
                  <AppTextField
                    v-model="form.password"
                    label="Contraseña"
                    placeholder="············"
                    :type="isPasswordVisible ? 'text' : 'password'"
                    autocomplete="current-password"
                    :append-inner-icon="
                      isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                    "
                    @click:append-inner="isPasswordVisible = !isPasswordVisible"
                  />

                  <div
                    class="d-flex align-center flex-wrap justify-space-between my-6 ga-2"
                  >
                    <VCheckbox v-model="form.remember" label="Recuérdame" />
                    <a
                      class="text-primary text-body-2"
                      href="javascript:void(0)"
                    >
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>

                  <VBtn block size="large" type="submit">Iniciar sesión</VBtn>
                </VCol>

                <VCol
                  cols="12"
                  class="text-body-2 text-center text-medium-emphasis"
                >
                  Si aún no tienes acceso, contacta a soporte para recibir tus
                  credenciales.
                </VCol>
              </VRow>
            </VForm>
          </VCardText>
        </VCard>
      </div>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth";

.login-layout {
  min-height: 100vh;
}

.login-hero {
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  padding: 56px;
  background:
    radial-gradient(
      circle at top left,
      rgba(var(--v-theme-primary), 0.14),
      transparent 32%
    ),
    linear-gradient(135deg, #f4f7ff 0%, #eef3ff 45%, #f9fbff 100%);
}

.login-hero__content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 520px;
}

.login-hero__logo {
  width: min(100%, 320px);
  margin-block-end: 20px;
  object-fit: contain;
}

.login-hero__title {
  margin: 0 0 16px;
  color: rgb(var(--v-theme-on-surface));
  font-size: clamp(2.1rem, 2.8vw, 3.4rem);
  font-weight: 800;
  line-height: 1.06;
}

.login-hero__text {
  margin: 0 0 24px;
  color: rgba(var(--v-theme-on-surface), 0.72);
  font-size: 1rem;
  line-height: 1.7;
}

.login-hero__highlights {
  display: grid;
  gap: 12px;
}

.login-hero__highlight {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  width: fit-content;
  padding: 12px 16px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(8px);
  color: rgb(var(--v-theme-on-surface));
  font-weight: 600;
}

.login-hero__visual {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.login-hero__image {
  display: block;
  width: min(72%, 560px);
  max-width: 560px;
  margin: 0;
}

.login-hero__mask {
  position: absolute;
  inset-inline: 0;
  inset-block-end: 0;
  width: 100%;
}

.login-panel {
  min-height: 100vh;
  padding: 24px;
}

.login-panel__inner {
  width: 100%;
  max-width: 540px;
}

.login-panel__logo {
  width: min(100%, 220px);
  margin: 0 auto 12px;
  object-fit: contain;
}

.login-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 28px;
  background: rgba(var(--v-theme-surface), 0.94);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
}

.login-card__title {
  text-wrap: balance;
}

@media (max-width: 1279px) {
  .login-panel {
    padding: 32px 20px;
  }

  .login-panel__inner {
    max-width: 620px;
  }

  .login-card {
    border-radius: 24px;
    box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06);
  }
}

@media (max-width: 599px) {
  .login-panel {
    min-height: 100dvh;
    padding: 16px;
  }

  .login-panel__inner {
    max-width: 100%;
  }

  .login-card {
    border-radius: 20px;
  }

  .login-card__title {
    font-size: 1.75rem !important;
    line-height: 1.15;
  }
}
</style>
