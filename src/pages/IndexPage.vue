<template>
  <q-page class="landing-page">
    <!-- Hero Section -->
    <section :class="['hero-section q-pa-md', isDark ? 'bg-dark' : '']">
      <div class="container">
        <div class="row items-center">
          <div class="col-12 col-md-6 text-center text-md-left">
            <h1 class="text-h3 text-weight-bold q-mb-md">D-Pastillero</h1>
            <p class="text-h6 q-mb-lg" :class="isDark ? 'text-grey-4' : 'text-grey-8'">
              Controla y sigue tus medicamentos de forma fácil y efectiva.
            </p>
            <q-btn
              to="/medications"
              :color="isDark ? 'white' : 'primary'"
              :text-color="isDark ? 'primary' : 'white'"
              label="Comenzar"
              class="q-px-xl q-py-sm text-weight-bold"
              push
              size="large"
            />
          </div>
          <div class="col-12 col-md-6 q-pt-md q-pt-md-none text-center">
            <img
              src="/logo.svg"
              alt="D-Pastillero Logo"
              :style="{
                'max-width': '300px',
                'width': '100%',
                'transition': 'filter 0.3s ease'
              }"
              class="q-mx-auto"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section :class="['features-section q-pa-md q-py-lg', isDark ? 'bg-dark-page' : 'bg-grey-1']">
      <div class="container">
        <h2 class="text-h4 text-center q-mb-xl">Características Principales</h2>
        <div class="row q-col-gutter-md q-col-gutter-lg-xl">
          <!-- Feature 1 -->
          <div class="col-12 col-md-4">
            <q-card flat :class="['feature-card text-center q-pa-md', isDark ? 'bg-dark' : '']">
              <q-icon name="schedule" size="4rem" :color="isDark ? 'white' : 'primary'" />
              <h3 class="text-h6 q-mt-md">Recordatorios Inteligentes</h3>
              <p class="text-body1" :class="isDark ? 'text-grey-4' : 'text-grey-8'">
                Nunca olvides tomar tus medicamentos con nuestro sistema de recordatorios personalizables
              </p>
            </q-card>
          </div>

          <!-- Feature 2 -->
          <div class="col-12 col-md-4">
            <q-card flat :class="['feature-card text-center q-pa-md', isDark ? 'bg-dark' : '']">
              <q-icon name="medication" size="4rem" :color="isDark ? 'white' : 'primary'" />
              <h3 class="text-h6 q-mt-md">Gestión de Medicamentos</h3>
              <p class="text-body1" :class="isDark ? 'text-grey-4' : 'text-grey-8'">
                Administra fácilmente tus medicamentos, dosis y horarios en un solo lugar
              </p>
            </q-card>
          </div>

          <!-- Feature 3 -->
          <div class="col-12 col-md-4">
            <q-card flat :class="['feature-card text-center q-pa-md', isDark ? 'bg-dark' : '']">
              <q-icon name="local_pharmacy" size="4rem" :color="isDark ? 'white' : 'primary'" />
              <h3 class="text-h6 q-mt-md">Farmacias Cercanas</h3>
              <p class="text-body1" :class="isDark ? 'text-grey-4' : 'text-grey-8'">
                Encuentra farmacias cercanas y mantén un registro de tus medicamentos disponibles
              </p>
            </q-card>
          </div>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section :class="['benefits-section q-pa-md q-py-lg', isDark ? 'bg-dark' : '']">
      <div class="container">
        <h2 class="text-h4 text-center q-mb-xl">Beneficios</h2>
        <div class="row q-col-gutter-lg reverse">
          <div class="col-12 col-md-6">
            <div class="benefit-list">
              <q-list>
                <q-item v-for="(benefit, index) in benefits" :key="index" :class="isDark ? 'bg-dark-page' : 'bg-grey-1'">
                  <q-item-section avatar>
                    <q-icon :name="benefit.icon" :color="isDark ? 'white' : 'primary'" size="2rem" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ benefit.title }}</q-item-label>
                    <q-item-label caption :class="isDark ? 'text-grey-4' : ''">{{ benefit.description }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
          <div class="col-12 col-md-6 text-center">
            <img
              src="/logo.svg"
              alt="D-Pastillero Logo"
              :style="{
                'max-width': '400px',
                'width': '100%',
                'filter': isDark ? 'invert(1) hue-rotate(180deg)' : 'none',
                'transition': 'filter 0.3s ease'
              }"
              class="q-mx-auto"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section q-pa-md q-py-xl bg-primary text-white text-center">
      <div class="container">
        <h2 class="text-h4 q-mb-md">Comienza a gestionar tus medicamentos hoy</h2>
        <p class="text-h6 q-mb-lg">
          Únete a miles de usuarios que ya confían en D-Pastillero
        </p>
        <q-btn
          to="/medications"
          color="white"
          text-color="primary"
          label="Comenzar Ahora"
          class="q-px-xl q-py-sm text-weight-bold"
          push
          size="large"
        />
      </div>
    </section>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useDarkMode } from '../composables/useDarkMode';

const { isDark } = useDarkMode();

const benefits = ref([
  {
    icon: 'check_circle',
    title: 'Mejora la adherencia al tratamiento',
    description: 'Aumenta la efectividad de tus tratamientos médicos cumpliendo con los horarios'
  },
  {
    icon: 'notifications',
    title: 'Recordatorios personalizados',
    description: 'Configura recordatorios según tus necesidades y horarios específicos'
  },
  {
    icon: 'family_restroom',
    title: 'Gestión familiar',
    description: 'Administra los medicamentos de toda tu familia en una sola aplicación'
  },
  {
    icon: 'history',
    title: 'Historial completo',
    description: 'Mantén un registro detallado de tus medicamentos y tratamientos'
  },
  {
    icon: 'local_hospital',
    title: 'Conexión con profesionales',
    description: 'Encuentra y contacta con médicos y farmacias cercanas'
  }
]);
</script>

<style scoped>
.landing-page {
  overflow-x: hidden;
}

.hero-section {
  min-height: 80vh;
  display: flex;
  align-items: center;
}

.hero-section:not(.bg-dark) {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
}

.bg-dark {
  background: linear-gradient(135deg, #1d1d1d 0%, #2d2d2d 100%);
}

.bg-dark-page {
  background: #1d1d1d;
}

.feature-card {
  height: 100%;
  transition: all 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-card.bg-dark {
  background: #2d2d2d;
}

.benefits-section:not(.bg-dark) {
  background: #ffffff;
}

.benefit-list .q-item {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.benefit-list .q-item:hover {
  transform: translateX(5px);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 767px) {
  .hero-section {
    text-align: center;
    padding-top: 2rem;
    padding-bottom: 2rem;
  }
}
</style>
