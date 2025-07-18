<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated reveal :reveal-offset="100" class="header-transition">
      <q-toolbar>
        <q-btn flat round icon="home" @click="goToLanding" v-if="!isLandingPage" />
        <q-toolbar-title>{{ currentTitle }}</q-toolbar-title>
        <q-btn round flat class="q-ml-md">
          <q-avatar size="32px" color="primary" text-color="white">
            <q-icon name="person" size="20px" />
          </q-avatar>
          <q-menu
            transition-show="fade"
            transition-hide="fade"
            :offset="[0, 10]"
            ref="profileMenu"
            style="border-radius: 20px;"
          >
            <q-card :class="{ 'dark-card': isDark }">
              <q-btn
                flat
                round
                dense
                icon="close"
                class="close-btn"
                :class="{ 'dark-close-btn': isDark }"
                v-close-popup
              />
              <q-card-section class="row no-wrap q-pa-md" style="width: 300px">
              <div class="column items-center">
                <q-item >
                    <q-item-section>
                      <q-item-label>Perfil</q-item-label>
                    </q-item-section>
                  </q-item>
                <q-avatar size="72px" color="primary" text-color="white">
                  <q-icon name="person" size="40px" />
                </q-avatar>
                <div class="text-subtitle1 q-mt-md q-mb-xs">Usuario</div>
                <div class="text-caption q-mb-md">usuario@email.com</div>
              </div>

              <q-separator vertical inset class="q-mx-lg" />

              <div class="column col">
                <div class="text-h6 q-mb-md">Ajustes</div>
                <div class="column q-gutter-y-sm">

                  <q-item clickable v-ripple @click="toggleDarkMode" style="border-radius: 12px;">
                    <q-item-section>
                      <q-item-label>Modo Oscuro</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon :name="isDark ? 'dark_mode' : 'light_mode'" :color="isDark ? 'yellow' : 'primary'" />
                    </q-item-section>
                  </q-item>

                  <q-separator spaced />

                  <q-item clickable v-ripple class="text-negative" v-close-popup>
                    <q-item-section>
                      <q-item-label>Cerrar Sesión</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon name="logout" />
                    </q-item-section>
                  </q-item>
                </div>
              </div>
              </q-card-section>
            </q-card>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
    <q-tabs v-model="tab" class="nav-bar" active-color="primary" indicator-color="primary" align="justify"
      narrow-indicator dense no-caps
      style="position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%); width: calc(100% - 32px); z-index: 2000;">

      <q-route-tab name="doctors" to="/doctors" exact icon="medical_services" label="Doctores" />
      <q-route-tab name="medications" to="/medications" exact icon="medication" label="Pastillero" />
      <q-route-tab name="pharmacies" to="/pharmacies" exact icon="local_pharmacy" label="Farmacias" />
    </q-tabs>
  </q-layout>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useDarkMode } from '../composables/useDarkMode';

const router = useRouter();
const route = useRoute();
const tab = ref('medications');
const { isDark, toggleDarkMode } = useDarkMode();

// Comprobar si estamos en la landing page
const isLandingPage = computed(() => route.path === '/');

// Título dinámico según la ruta
const currentTitle = computed(() => {
  switch (route.path) {
    case '/medications':
      return 'Gestor de Medicamentos';
    case '/doctors':
      return 'Buscar Doctores';
    case '/pharmacies':
      return 'Buscar Farmacias';
    default:
      return 'Gestor de Medicamentos';
  }
});

// Función para ir a la landing page
const goToLanding = () => {
  router.push('/');
};
</script>

<style>
.header-transition {
  transition: transform 0.3s ease !important;
}

.nav-bar {
  background: rgba(139, 188, 243, 0.2) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(139, 188, 243, 0.3) !important;
  border-radius: 16px !important;
  box-shadow: 0 4px 20px rgba(139, 188, 243, 0.2) !important;
  padding: 4px !important;
  transition: all 0.3s ease !important;
}

.dark .nav-bar {
  background: rgba(29, 29, 29, 0.8) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

/* Estilos para el menú de perfil */
.profile-menu {
  margin-top: 12px;
}

.profile-menu::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: -1;
}

.profile-card {
  background: rgba(139, 188, 243, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 188, 243, 0.3);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.dark-card {
  background: rgba(33, 33, 33, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.profile-card .q-item {
  border-radius: 8px;
  transition: all 0.3s ease;
  margin: 4px 0;
}

.profile-card .q-item:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: translateX(4px);
}

.dark-card .q-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.profile-card .q-separator {
  opacity: 0.2;
  margin: 8px 0;
}

.profile-card .q-avatar {
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: border-color 0.3s ease;
}

.dark-card .q-avatar {
  border-color: rgba(255, 255, 255, 0.1);
}

.close-btn {
  position: absolute;
  right: 8px;
  top: 8px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
  z-index: 1000;
}

.close-btn:hover {
  opacity: 1;
}

.dark-close-btn {
  color: white;
}
</style>