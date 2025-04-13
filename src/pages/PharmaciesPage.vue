<template>
  <q-page class="q-pa-md">
    <!-- Mini banner de ofertas -->
    <div class="row q-col-gutter-md q-mb-sm">
      <div class="col-12">
        <q-carousel
          v-model="slide"
          transition-prev="fade"
          transition-next="fade"
          swipeable
          animated
          infinite
          control-color="white"
          navigation-icon="none"
          arrows-icon="none"
          height="65px"
          class="mini-promo"
          autoplay
          :autoplay-delay="4000"
        >
          <q-carousel-slide
            v-for="med in medicamentosDestacados"
            :key="med.id"
            :name="med.id"
            :class="'slide-' + med.estilo"
          >
            <div class="mini-promo-content">
              <div class="promo-bg"></div>
              <div class="promo-overlay"></div>
              <div class="promo-text">
                <div class="promo-info" @click="buscarMedicamento(med.nombre)">
                  <q-icon name="local_offer" color="white" size="20px" class="q-mr-sm" />
                  <span class="text-subtitle1 text-weight-medium cursor-pointer hover-underline">
                    {{ med.nombre }}
                  </span>
                  <span class="text-h6 text-weight-bold q-mx-sm">${{ med.precio }}</span>
                  <q-badge
                    v-if="med.descuento"
                    color="negative"
                    class="text-subtitle2"
                  >
                    -{{ med.descuento }}%
                  </q-badge>
                </div>
                <q-btn
                  flat
                  dense
                  round
                  color="white"
                  icon="search"
                  class="search-btn"
                  @click="buscarMedicamento(med.nombre)"
                >
                  <q-tooltip>Buscar {{ med.nombre }}</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-carousel-slide>
        </q-carousel>
      </div>
    </div>

    <!-- Buscador de medicamentos -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12">
        <q-input
          ref="searchInput"
          v-model="searchQuery"
          dense
          outlined
          rounded
          placeholder="Buscar medicamento..."
          class="search-input"
          bg-color="dark"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>
    </div>

    <!-- Lista de medicamentos encontrados -->
    <div v-if="searchQuery" class="row q-col-gutter-md q-mb-md">
      <div class="col-12">
        <q-card v-for="med in medicamentosFiltrados" :key="med.nombre" class="q-mb-sm">
          <q-card-section>
            <div class="text-h6">{{ med.nombre }}</div>
            <div class="text-subtitle2">{{ med.descripcion }}</div>
          </q-card-section>
          <q-card-section>
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-list>
                  <q-item v-for="farmacia in med.farmacias" :key="farmacia.id">
                    <q-item-section>
                      <q-item-label>{{ farmacia.nombre }}</q-item-label>
                      <q-item-label caption>
                        <q-icon name="location_on" size="xs" /> {{ farmacia.direccion }}
                      </q-item-label>
                      <q-item-label caption>
                        <q-icon name="phone" size="xs" /> {{ farmacia.telefono }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="text-h6 text-primary">${{ farmacia.precio }}</div>
                      <q-chip
                        v-if="farmacia.descuento"
                        color="positive"
                        text-color="white"
                        size="sm"
                      >
                        -{{ farmacia.descuento }}%
                      </q-chip>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Lista de farmacias cercanas -->
    <div v-else class="row q-col-gutter-md">
      <div class="col-12">
        <div class="text-h5 q-mb-md">Farmacias cercanas</div>
        <q-card v-for="farmacia in farmaciasCercanas" :key="farmacia.id" class="q-mb-sm">
          <q-card-section>
            <div class="row items-center">
              <div class="col">
                <div class="text-h6">{{ farmacia.nombre }}</div>
                <div class="text-subtitle2">
                  <q-icon name="location_on" size="xs" /> {{ farmacia.direccion }}
                </div>
                <div class="text-subtitle2">
                  <q-icon name="phone" size="xs" /> {{ farmacia.telefono }}
                </div>
              </div>
              <div class="col-auto">
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="directions"
                  @click="abrirMapa(farmacia)"
                >
                  <q-tooltip>Ver en mapa</q-tooltip>
                </q-btn>
              </div>
            </div>
          </q-card-section>
          <q-card-section v-if="farmacia.servicios.length">
            <div class="text-subtitle2 q-mb-sm">Servicios disponibles:</div>
            <div class="row q-col-gutter-sm">
              <div v-for="servicio in farmacia.servicios" :key="servicio" class="col-auto">
                <q-chip
                  outline
                  color="primary"
                  text-color="primary"
                  size="sm"
                >
                  {{ servicio }}
                </q-chip>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';

export default {
  setup() {
    const $q = useQuasar();
    const searchQuery = ref('');
    const slide = ref(1);
    const searchInput = ref(null);

    // Datos simplificados para el mini banner
    const medicamentosDestacados = ref([
      {
        id: 1,
        nombre: 'Ibuprofeno 400mg',
        precio: 18.99,
        descuento: 10,
        estilo: 'azul'
      },
      {
        id: 2,
        nombre: 'Paracetamol 500mg',
        precio: 15.99,
        descuento: 15,
        estilo: 'verde'
      },
      {
        id: 3,
        nombre: 'Vitamina C 1000mg',
        precio: 25.99,
        descuento: 20,
        estilo: 'morado'
      }
    ]);

    // Datos de ejemplo - En una aplicación real, esto vendría de una API
    const medicamentos = ref([
      {
        nombre: 'Paracetamol 500mg',
        descripcion: 'Analgésico y antipirético',
        farmacias: [
          {
            id: 1,
            nombre: 'Farmacia del Ahorro',
            direccion: 'Av. Principal 123',
            telefono: '555-0123',
            precio: 15.99,
            descuento: 10
          },
          {
            id: 2,
            nombre: 'Farmacia San José',
            direccion: 'Calle Secundaria 456',
            telefono: '555-0124',
            precio: 16.50,
            descuento: 5
          }
        ]
      },
      {
        nombre: 'Ibuprofeno 400mg',
        descripcion: 'Antiinflamatorio no esteroideo',
        farmacias: [
          {
            id: 1,
            nombre: 'Farmacia del Ahorro',
            direccion: 'Av. Principal 123',
            telefono: '555-0123',
            precio: 18.99,
            descuento: 15
          }
        ]
      }
    ]);

    const farmaciasCercanas = ref([
      {
        id: 1,
        nombre: 'Farmacia del Ahorro',
        direccion: 'Av. Principal 123',
        telefono: '555-0123',
        servicios: ['Entrega a domicilio', 'Servicio 24 horas', 'Descuentos por membresía']
      },
      {
        id: 2,
        nombre: 'Farmacia San José',
        direccion: 'Calle Secundaria 456',
        telefono: '555-0124',
        servicios: ['Entrega a domicilio', 'Servicio de urgencias']
      }
    ]);

    const medicamentosFiltrados = computed(() => {
      if (!searchQuery.value) return [];
      const query = searchQuery.value.toLowerCase();
      return medicamentos.value.filter(med =>
        med.nombre.toLowerCase().includes(query) ||
        med.descripcion.toLowerCase().includes(query)
      );
    });

    const abrirMapa = (farmacia) => {
      // En una aplicación real, esto abriría Google Maps o una aplicación similar
      $q.notify({
        message: `Abriendo mapa para ${farmacia.nombre}`,
        color: 'info'
      });
    };

    const buscarMedicamento = (nombre) => {
      searchQuery.value = nombre;
      // Hacer focus en el input de búsqueda
      searchInput.value.focus();
      // Desplazar suavemente hacia el input
      searchInput.value.$el.scrollIntoView({ behavior: 'smooth' });
    };

    return {
      searchQuery,
      medicamentosFiltrados,
      farmaciasCercanas,
      abrirMapa,
      slide,
      medicamentosDestacados,
      buscarMedicamento,
      searchInput
    };
  }
};
</script>

<style scoped>
.mini-promo {
  border-radius: 12px;
  height: 65px !important;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.mini-promo-content {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.promo-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  transform: scale(1.1);
  transition: transform 0.3s ease;
}

.promo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.4);
}

.promo-text {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  height: 100%;
  padding: 0 24px;
}

.promo-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.hover-underline:hover {
  text-decoration: underline;
}

.search-btn {
  opacity: 0.8;
  transition: all 0.3s ease;
}

.search-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.slide-azul .promo-bg {
  background-image: url('https://img.freepik.com/free-vector/abstract-medical-wallpaper-template-design_53876-61802.jpg');
}

.slide-verde .promo-bg {
  background-image: url('https://img.freepik.com/free-vector/gradient-medical-healthcare-icons-pattern_53876-116871.jpg');
}

.slide-morado .promo-bg {
  background-image: url('https://img.freepik.com/free-vector/gradient-medical-wallpaper_23-2149611645.jpg');
}

.q-carousel__slide {
  padding: 0;
}

.q-badge {
  font-size: 14px;
  padding: 4px 8px;
}

/* Efecto hover */
.mini-promo-content:hover .promo-bg {
  transform: scale(1.2);
}

/* Ajustes para modo oscuro */
.body--dark .mini-promo {
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

/* Ajustes para modo claro */
.body--light .mini-promo {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-input {
  max-width: 600px;
  margin: 0 auto;
}
</style>