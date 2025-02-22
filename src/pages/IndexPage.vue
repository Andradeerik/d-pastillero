<template>
  <q-page class>
    <q-list v-for="(item, index) in data" :key="index" bordered class="rounded-borders">
      <q-expansion-item 
      switch-toggle-side
      expand-separator
@click="setDefaultDateTime(item)">
        <template v-slot:header>
          <div class="row items-center">
<q-item-section avatar>
            <q-icon color="primary" name="vaccines" />
          </q-item-section>
            <div class="col">
              <div>{{ item.info.name }}</div>
              <div class="text-caption">{{ item.info.cantidad }} {{ item.info.tipoDeMedicamento }} c/{{ item.info.frecuencia }} {{ item.info.tipoDeFrecuencia }} por {{ item.info.porTiempo }} {{ item.info.tipoDTiempo }}</div>
              <div class="text-caption">Siguiente toma: {{ formatFecha(getNextDose(item)) }} {{ formatHora(getNextDose(item)) }}</div>
            </div>
          </div>
        </template>
        <q-card>
          <q-card-section>
            <q-item-label header>{{ item.info.notas }}</q-item-label>
            <q-list bordered separator>
              <q-item v-for="(toma, index) in item.tomas" :key="index" :class="{ 'text-grey': toma.tomada }">
                <q-item-section>{{ formatHora(toma.timestamp) }}</q-item-section>
                <q-item-section>{{ formatFecha(toma.timestamp) }}</q-item-section>
                <q-item-section avatar>
                  <q-btn-group push v-if="!toma.tomada">
                    <q-btn color="green" push label="tomada" icon="done" @click="markAsTaken(item, index)" />
                  </q-btn-group>
                </q-item-section>
              </q-item>
            </q-list>
            <div v-if="item.tomas.length === 0">
              <q-input filled v-model="item.fechaPrimeraTomaFormatted">
                <template v-slot:prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="item.fechaPrimeraTomaFormatted" mask="YYYY-MM-DD HH:mm">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
                <template v-slot:append>
                  <q-icon name="access_time" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-time v-model="item.fechaPrimeraTomaFormatted" mask="YYYY-MM-DD HH:mm" format24h>
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="Close" color="primary" flat />
                        </div>
                      </q-time>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-btn color="primary" @click="calculateNextDoses(item)">Calcular Tomas</q-btn>
            </div>
            <q-btn color="red" push label="Eliminar" icon="delete" @click="deleteMed(index)" />
            <q-btn color="blue" push label="Editar" icon="edit" @click="editMed(item, index)" />
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
    <q-dialog v-model="card">
      <q-card>
        <q-card-section>
          <div class="text-h6">Agregar Medicamento</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="newMed.name" label="Nombre del Medicamento" />
          <q-input v-model="newMed.cantidad" label="Cantidad" type="number" />
          <q-input v-model="newMed.tipoDeMedicamento" label="Tipo de Medicamento" />
          <q-input v-model="newMed.frecuencia" label="Frecuencia" type="number" />
          <q-select v-model="newMed.tipoDeFrecuencia" :options="['horas', 'días', 'meses']" label="Tipo de Frecuencia" />
          <q-input v-model="newMed.porTiempo" label="Por Tiempo" type="number" />
          <q-select v-model="newMed.tipoDTiempo" :options="['días', 'semanas', 'meses']" label="Tipo de Tiempo" />
          <q-input v-model="newMed.notas" label="Notas" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="primary" v-close-popup />
          <q-btn flat label="Agregar" color="primary" @click="addMed()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn round icon="add" color="primary" @click="card = !card"></q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { date } from 'quasar';

console.log('hola');
const card = ref(false);
const data = ref([]);

const loadFromLocalStorage = () => {
  const storedData = localStorage.getItem('medicamentos');
  if (storedData) {
    data.value = JSON.parse(storedData);
  } else {
    // Agregar ejemplos si no hay datos en localStorage
    data.value = [
      {
        info: {
          name: 'Amoxicilina',
          cantidad: 1,
          tipoDeMedicamento: 'tableta',
          frecuencia: 8,
          tipoDeFrecuencia: 'horas',
          porTiempo: 5,
          tipoDTiempo: 'días',
          notas: 'Para la infección',
        },
        tomas: [
          {
            timestamp: new Date('2025-02-20T08:00:00').getTime(),
            tomada: true,
          },
          {
            timestamp: new Date('2025-02-20T16:00:00').getTime(),
            tomada: false,
          },
        ],
        fechaPrimeraToma: new Date('2025-02-20T08:00:00').getTime(),
      },
      {
        info: {
          name: 'Ibuprofeno',
          cantidad: 1,
          tipoDeMedicamento: 'tableta',
          frecuencia: 8,
          tipoDeFrecuencia: 'horas',
          porTiempo: 3,
          tipoDTiempo: 'días',
          notas: 'Para el dolor de cabeza',
        },
        tomas: [],
        fechaPrimeraToma: '',
      },
    ];
  }
};

const saveToLocalStorage = () => {
  localStorage.setItem('medicamentos', JSON.stringify(data.value));
};

onMounted(() => {
  loadFromLocalStorage();

  setTimeout(() => {
  if ('Notification' in window && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.showNotification('Notificación de Prueba', {
        body: 'Esta es una notificación de prueba.',
        icon: 'icons/icon-128x128.png',
        badge: 'icons/icon-128x128.png'
      });
    });
  }
}, 10000); 
});

watch(data, saveToLocalStorage, { deep: true });

const newMed = ref({
  name: '',
  cantidad: 0,
  tipoDeMedicamento: '',
  frecuencia: 0,
  tipoDeFrecuencia: '',
  porTiempo: 0,
  tipoDTiempo: '',
  notas: '',
  fechaPrimeraToma: '',
});

const addMed = () => {
  data.value.push({
    info: { ...newMed.value },
    tomas: [],
    fechaPrimeraToma: '',
  });
  card.value = false;
  newMed.value = {
    name: '',
    cantidad: 0,
    tipoDeMedicamento: '',
    frecuencia: 0,
    tipoDeFrecuencia: '',
    porTiempo: 0,
    tipoDTiempo: '',
    notas: '',
    fechaPrimeraToma: '',
  };
};

const deleteMed = (index) => {
  data.value.splice(index, 1);
};

const editMed = (item, index) => {
  newMed.value = { ...item.info, fechaPrimeraToma: item.fechaPrimeraToma };
  data.value.splice(index, 1);
  card.value = true;
};

const markAsTaken = (item, index) => {
  const now = new Date();
  item.tomas[index].timestamp = now.getTime();
  item.tomas[index].tomada = true;
  const takenDose = item.tomas.splice(index, 1)[0];
  item.tomas.push(takenDose);
};

const calculateNextDoses = (item) => {
  console.log('Calculando tomas para:', item);
  if (!item.fechaPrimeraToma) {
    console.error('Fecha de la primera toma no está definida');
    return;
  }

  const frecuencia = item.info.frecuencia;
  const tipoDeFrecuencia = item.info.tipoDeFrecuencia;
  const porTiempo = item.info.porTiempo;
  const tipoDTiempo = item.info.tipoDTiempo;

  const primeraToma = new Date(item.fechaPrimeraToma);

  if (!primeraToma) {
    console.error('Fecha inválida:', item.fechaPrimeraToma);
    return;
  }

  const tomas = [];
  let nextDose = new Date(primeraToma);

  for (let i = 0; i < porTiempo * (tipoDTiempo === 'días' ? 24 / frecuencia : 1); i++) {
    if (tipoDeFrecuencia === 'horas') {
      nextDose = date.addToDate(nextDose, { hours: frecuencia });
    } else if (tipoDeFrecuencia === 'días') {
      nextDose = date.addToDate(nextDose, { days: frecuencia });
    } else if (tipoDeFrecuencia === 'meses') {
      nextDose = date.addToDate(nextDose, { months: frecuencia });
    }

    tomas.push({
      timestamp: nextDose.getTime(),
      tomada: false,
    });
  }

  // Agregar la primera toma y marcarla como realizada al final de la lista
  tomas.push({
    timestamp: primeraToma.getTime(),
    tomada: true,
  });

  item.tomas = tomas;
  console.log('Tomas calculadas:', tomas);
};

const formatHora = (timestamp) => {
  if (!timestamp) {
    console.error('Timestamp no definido');
    return '';
  }
  return date.formatDate(new Date(timestamp), 'hh:mm A');
};

const formatFecha = (timestamp) => {
  if (!timestamp) {
    console.error('Timestamp no definido');
    return '';
  }
    try {
    return date.formatDate(new Date(timestamp), 'ddd, D MMM');
  } catch (error) {
    console.error('Error formateando fecha:', error);
    return '';
  }
};

const setDefaultDateTime = (item) => {
  if (!item.fechaPrimeraToma) {
    const now = new Date();
    item.fechaPrimeraToma = now.getTime();
  }
  item.fechaPrimeraTomaFormatted = date.formatDate(new Date(item.fechaPrimeraToma), 'YYYY-MM-DD HH:mm');
};

const getNextDose = (item) => {
  const nextDose = item.tomas.find(toma => !toma.tomada);
  return nextDose ? nextDose.timestamp : null;
};

// Programar notificaciones locales
const scheduleNotification = (item) => {
  const nextDoseTime = getNextDose(item);
  if (nextDoseTime) {
    const now = new Date().getTime();
    const delay = nextDoseTime - now - 2 * 60 * 1000; // 2 minutos antes
    if (delay > 0) {
      setTimeout(() => {
        if ('Notification' in window && 'serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification('Recordatorio de Medicamento', {
              body: `Es hora de tomar tu ${item.info.name}.`,
              icon: 'icons/icon-128x128.png',
              badge: 'icons/icon-128x128.png'
            });
          });
        }
      }, delay);
    }
  }
};

// Llamar a scheduleNotification para cada medicamento
data.value.forEach(item => {
  scheduleNotification(item);
});
</script>

<style scoped>
.text-grey {
  color: grey;
}
</style>
