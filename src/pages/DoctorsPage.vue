<template>
  <q-page class="q-pa-md doctors-page">
    <!-- Barra de búsqueda y filtros fija -->
    <div class="search-bar-container">
      <div class="row q-col-gutter-md items-center">
        <div class="col">
          <q-input
            v-model="searchQuery"
            dense
            outlined
            label="Buscar doctor"
            clearable
            @update:model-value="filterDoctors"
            class="search-input"
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>
        <div class="col-auto">
          <q-btn
            flat
            round
            color="primary"
            icon="tune"
            @click="showFilters = !showFilters"
          >
            <q-badge
              v-if="activeFiltersCount > 0"
              color="primary"
              floating
            >
              {{ activeFiltersCount }}
            </q-badge>
          </q-btn>
        </div>
      </div>

      <!-- Panel de filtros desplegable -->
      <q-slide-transition>
        <div v-show="showFilters" class="filters-panel q-pa-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-select
                v-model="selectedSpecialty"
                :options="specialties"
                dense
                outlined
                label="Especialidad"
                clearable
                @update:model-value="filterDoctors"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-select
                v-model="selectedLocation"
                :options="locations"
                dense
                outlined
                label="Ubicación"
                clearable
                @update:model-value="filterDoctors"
              />
            </div>
          </div>
        </div>
      </q-slide-transition>
    </div>

    <!-- Lista de doctores -->
    <div class="row q-col-gutter-md q-mt-lg">
      <div v-for="doctor in filteredDoctors" :key="doctor.id" class="col-12 col-md-6 col-lg-4">
        <q-card class="doctor-card">
          <q-card-section>
            <div class="row items-center">
              <q-avatar size="64px" class="q-mr-md">
                <img :src="doctor.avatar" :alt="doctor.name">
              </q-avatar>
              <div class="col">
                <div class="text-h6">{{ doctor.name }}</div>
                <div class="text-subtitle2">{{ doctor.specialty }}</div>
                <div class="text-caption">
                  <q-icon name="location_on" size="xs" />
                  {{ doctor.location }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-section>
            <div class="text-body2">
              <div class="row items-center q-mb-sm">
                <q-icon name="medical_services" size="sm" class="q-mr-sm" />
                <span>{{ doctor.experience }} años de experiencia</span>
              </div>
              <div class="row items-center q-mb-sm">
                <q-icon name="schedule" size="sm" class="q-mr-sm" />
                <span>{{ doctor.availability }}</span>
              </div>
              <div class="row items-center">
                <q-icon name="phone" size="sm" class="q-mr-sm" />
                <span>{{ doctor.phone }}</span>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              color="primary"
              label="Ver perfil"
              icon="person"
              @click="showProfile(doctor)"
            />
            <q-btn flat color="primary" label="Agendar cita" icon="event" />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <!-- Diálogo del perfil -->
    <q-dialog
      v-model="showProfileDialog"
      full-width
      :maximized="$q.screen.lt.md"
    >
      <q-card class="profile-layout">
        <q-toolbar class="bg-transparent">
          <q-toolbar-title>Perfil del Doctor</q-toolbar-title>
          <q-btn flat round icon="close" v-close-popup />
        </q-toolbar>

        <q-card-section class="q-pa-md scroll" v-if="selectedDoctor">
          <div class="row q-col-gutter-lg">
            <div class="col-12 text-center">
              <q-avatar size="150px">
                <img :src="selectedDoctor.avatar" :alt="selectedDoctor.name">
              </q-avatar>
              <div class="text-h5 q-mt-md">{{ selectedDoctor.name }}</div>
              <div class="text-subtitle1">{{ selectedDoctor.specialty }}</div>
              <div class="text-caption q-mt-sm">
                <q-icon name="location_on" size="xs" />
                {{ selectedDoctor.location }}
              </div>
            </div>

            <div class="col-12">
              <div class="text-h6 q-mb-md">Información Profesional</div>
              <q-list>
                <q-item>
                  <q-item-section avatar>
                    <q-icon name="medical_services" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Experiencia</q-item-label>
                    <q-item-label caption>{{ selectedDoctor.experience }} años</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="schedule" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Horario</q-item-label>
                    <q-item-label caption>{{ selectedDoctor.availability }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="phone" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Teléfono</q-item-label>
                    <q-item-label caption>{{ selectedDoctor.phone }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="star" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Calificación</q-item-label>
                    <q-item-label caption>{{ selectedDoctor.ratings }} ({{ selectedDoctor.reviews }} reseñas)</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="school" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Educación</q-item-label>
                    <q-item-label caption>{{ selectedDoctor.education }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="language" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Idiomas</q-item-label>
                    <q-item-label caption>{{ selectedDoctor.languages.join(', ') }}</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section avatar>
                    <q-icon name="map" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Ubicación</q-item-label>
                    <q-item-label caption>
                      <div class="map-container q-mt-sm">
                        <iframe
                          width="100%"
                          height="200"
                          frameborder="0"
                          style="border:0"
                          :src="`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${selectedDoctor.coordinates.lat},${selectedDoctor.coordinates.lng}&zoom=15`"
                          allowfullscreen
                        ></iframe>
                      </div>
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { ref, computed, onBeforeUnmount } from 'vue';
import { useQuasar } from 'quasar';

export default {
  name: 'DoctorsPage',
  setup() {
    const $q = useQuasar();
    // Datos de ejemplo
    const doctors = ref([
      {
        id: 1,
        name: 'Dr. Juan Pérez',
        specialty: 'Medicina General',
        location: 'Ciudad de México',
        coordinates: { lat: 19.4326, lng: -99.1332 },
        experience: 15,
        education: 'Universidad Nacional Autónoma de México',
        ratings: 4.5,
        reviews: 120,
        languages: ['Español', 'Inglés'],
        availability: 'Lun-Vie 9:00-18:00',
        phone: '555-0123',
        avatar: 'https://cdn.quasar.dev/img/avatar.png'
      },
      {
        id: 2,
        name: 'Dra. María García',
        specialty: 'Cardiología',
        location: 'Guadalajara',
        coordinates: { lat: 20.6597, lng: -103.3496 },
        experience: 20,
        availability: 'Mar-Sáb 8:00-17:00',
        phone: '555-0124',
        avatar: 'https://cdn.quasar.dev/img/avatar2.png'
      },
      {
        id: 3,
        name: 'Dr. Carlos López',
        specialty: 'Pediatría',
        location: 'Monterrey',
        coordinates: { lat: 25.6866, lng: -100.3161 },
        experience: 10,
        availability: 'Lun-Vie 10:00-19:00',
        phone: '555-0125',
        avatar: 'https://cdn.quasar.dev/img/avatar3.png'
      },
      {
        id: 4,
        name: 'Dra. Ana Martínez',
        specialty: 'Dermatología',
        location: 'Ciudad de México',
        coordinates: { lat: 19.4326, lng: -99.1332 },
        experience: 12,
        availability: 'Mar-Sáb 9:00-18:00',
        phone: '555-0126',
        avatar: 'https://cdn.quasar.dev/img/avatar4.png'
      },
      {
        id: 5,
        name: 'Dr. Roberto Sánchez',
        specialty: 'Oftalmología',
        location: 'Puebla',
        coordinates: { lat: 19.0413, lng: -98.2062 },
        experience: 18,
        availability: 'Lun-Vie 8:00-17:00',
        phone: '555-0127',
        avatar: 'https://cdn.quasar.dev/img/avatar5.png'
      }
    ]);

    // Filtros
    const searchQuery = ref('');
    const selectedSpecialty = ref(null);
    const selectedLocation = ref(null);
    const showFilters = ref(false);

    // Opciones para los filtros
    const specialties = [
      'Medicina General',
      'Cardiología',
      'Pediatría',
      'Dermatología',
      'Oftalmología'
    ];

    const locations = [
      'Ciudad de México',
      'Guadalajara',
      'Monterrey',
      'Puebla'
    ];

    // Contador de filtros activos
    const activeFiltersCount = computed(() => {
      let count = 0;
      if (selectedSpecialty.value) count++;
      if (selectedLocation.value) count++;
      return count;
    });

    // Filtrar doctores
    const filteredDoctors = computed(() => {
      return doctors.value.filter(doctor => {
        const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                            doctor.specialty.toLowerCase().includes(searchQuery.value.toLowerCase());
        const matchesSpecialty = !selectedSpecialty.value || doctor.specialty === selectedSpecialty.value;
        const matchesLocation = !selectedLocation.value || doctor.location === selectedLocation.value;

        return matchesSearch && matchesSpecialty && matchesLocation;
      });
    });

    const filterDoctors = () => {
      // Esta función se llama cuando cambian los filtros
      // El filtrado se maneja automáticamente a través del computed
    };

    // Datos adicionales de ejemplo
    doctors.value = doctors.value.map(doctor => ({
      ...doctor,
      especialidades: [
        doctor.specialty,
        'Medicina General',
        'Consulta Externa'
      ]
    }));

    const showProfileDialog = ref(false);
    const selectedDoctor = ref(null);

    const showProfile = (doctor) => {
      selectedDoctor.value = doctor;
      showProfileDialog.value = true;
    };

    // Limpiar al salir
    onBeforeUnmount(() => {
      showProfileDialog.value = false;
      selectedDoctor.value = null;
    });

    return {
      doctors,
      searchQuery,
      selectedSpecialty,
      selectedLocation,
      specialties,
      locations,
      filteredDoctors,
      filterDoctors,
      showFilters,
      activeFiltersCount,
      showProfileDialog,
      selectedDoctor,
      showProfile,
      quasar: $q
    };
  }
};
</script>

<style scoped>
.doctors-page {
  height: 100%;
}

.profile-layout {
  width: 100%;
  max-width: 600px;
  background: rgba(139, 188, 243, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 188, 243, 0.3);
}

.profile-layout .q-toolbar {
  border-bottom: 1px solid rgba(139, 188, 243, 0.3);
}

.search-bar-container {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(139, 188, 243, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 188, 243, 0.3);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 20px rgba(139, 188, 243, 0.2);
  transition: all 0.3s ease;
}

.filters-panel {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(139, 188, 243, 0.3);
}

.doctor-card {
  transition: transform 0.3s;
  background: rgba(139, 188, 243, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 188, 243, 0.3);
}

.doctor-card:hover {
  transform: translateY(-5px);
}

/* Ajustes para modo oscuro */
:deep(.q-dark) .search-bar-container {
  background: rgba(139, 188, 243, 0.2);
  border-color: rgba(139, 188, 243, 0.3);
}

:deep(.q-dark) .filters-panel {
  border-top-color: rgba(139, 188, 243, 0.3);
}

:deep(.q-dark) .doctor-card {
  background: rgba(139, 188, 243, 0.2);
  border-color: rgba(139, 188, 243, 0.3);
}

/* Asegurar que el scroll funcione dentro del diálogo */
.scroll {
  max-height: calc(100vh - 50px);
  overflow-y: auto;
}

.map-container {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.map-container iframe {
  border-radius: 8px;
}

.text-caption {
  margin-top: 4px;
}
</style>
