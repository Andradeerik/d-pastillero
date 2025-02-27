<template>
  <q-page class="">
    <!-- <button
      onclick="window.location.href='https://www.icloud.com/shortcuts/f83cfc9f6022476d92808f8152b3b51a'"
    >
      Instalar Atajo
    </button>

    <button
      onclick="window.location.href='shortcuts://run-shortcut?name=Hola%20mundo&input=text&text=Este%20es%20un%20mensaje%20desde%20la%20PWA'"
    >
      iniciar atajo
    </button> -->

    <!-- <p v-if="$q.platform.is.ios">Estás en iOS</p>
    <p v-else-if="$q.platform.is.android">Estás en Android</p> -->

    <div
      v-if="$q.platform.is.ios && !atajoInstalado"
      class="q-ma-md text-center"
    >
      <q-btn
        label="Generar Recordatorios en iOS"
        @click="modalInstalacion = true"
        color="primary"
        class="rounded-borders"
        padding="10px"
        push
      />
    </div>

    <q-dialog v-model="modalInstalacion" backdrop-filter="blur(4px)">
      <q-card class="rounded-borders q-ma-md">
        <q-card-section>
          <div class="text-h6">Instalar Atajo</div>
          <p>
            Para generar recordatorios en tu dispositivo iOS, debes instalar el
            atajo.
          </p>
          <!-- <a href="URL_DEL_ATAJO_EN_ICLOUD" target="_blank">Instalar Atajo</a> -->
          <q-btn
            label="Instalar Atajo"
            href="https://www.icloud.com/shortcuts/de3e7ead0d73424cb23678d03f0e5083"
            color="primary"
            class="rounded-borders"
            padding="10px"
            target="_blank"
            @click="instalanDoAtajo"
            push
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn label="Cerrar" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-list v-for="(item, index) in data" :key="index">
      <q-slide-item
        @left="onLeft(item, index, $event.reset)"
        @right="onRight(index, $event.reset)"
      >
        <template v-if="getNextDose(item)" v-slot:left>
          <q-icon name="done" /> Tomada
        </template>
        <!-- <template v-slot:right>
          <q-icon name="alarm" />
        </template> -->
        <q-expansion-item
          switch-toggle-side
          @click="setDefaultDateTime(item)"
          popup
          class="no-border"
          expand-icon-class="text-primary"
        >
          <template v-slot:header>
            <div class="row items-center">
              <q-item-section avatar>
                <q-icon color="primary" name="vaccines" />
              </q-item-section>
              <div class="col">
                <div>{{ item.info.name }}</div>
                <div class="text-caption">
                  {{ item.info.cantidad }}
                  {{ item.info.tipoDeMedicamento }} c/{{
                    item.info.frecuencia
                  }}
                  {{ item.info.tipoDeFrecuencia }} por
                  {{ item.info.porTiempo }}
                  {{ item.info.tipoDTiempo }}
                </div>
                <div class="text-caption" v-if="getNextDose(item)">
                  Siguiente toma: <br />
                  {{ formatFecha(getNextDose(item)) }}
                  {{ formatHora(getNextDose(item)) }}
                </div>
                <div class="text-caption" v-else>
                  No hay más tomas programadas
                </div>
              </div>
            </div>
          </template>
          <q-card>
            <q-card-section>
              <div
                v-if="$q.platform.is.ios && atajoInstalado"
                class="text-center q-ma-md"
              >
                <q-btn
                  v-if="getNextDose(item) && !item.recordatoriosGenerados"
                  color="primary"
                  push
                  label="Generar Recordatorios en Atajo de iOS"
                  @click="generarRecordatorios(item)"
                  class="rounded-borders"
                />
              </div>
              <q-item-label
                >Nota: <br />
                {{ item.info.notas }}</q-item-label
              >
              <q-list bordered separator>
                <q-item
                  v-for="(toma, index) in item.tomas"
                  :key="index"
                  :class="{ 'text-grey': toma.tomada }"
                >
                  <q-item-section>{{
                    formatHora(toma.timestamp)
                  }}</q-item-section>
                  <q-item-section>{{
                    formatFecha(toma.timestamp)
                  }}</q-item-section>
                  <q-item-section avatar>
                    <q-btn-group
                      push
                      v-if="!toma.tomada && isFirstPendingDose(item, index)"
                    >
                      <q-btn
                        color="green"
                        push
                        label="tomada"
                        icon="done"
                        @click="markAsTaken(item, index)"
                        class="text-weight-medium"
                      />
                    </q-btn-group>
                  </q-item-section>
                </q-item>
              </q-list>
              <div v-if="item.tomas.length === 0">
                <q-input
                  rounded
                  outlined
                  v-model="item.fechaPrimeraTomaFormatted"
                  label="Fecha y hora de la Primera Toma"
                  class="q-mt-md"
                >
                  <template v-slot:prepend>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy
                        ref="datePopup"
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-date
                          v-model="item.fechaPrimeraTomaFormatted"
                          mask="YYYY-MM-DD HH:mm"
                          @input="onDateSelected(item)"
                          class="rounded-borders"
                        >
                          <div class="row items-center justify-end">
                            <q-btn
                              v-close-popup
                              label="Close"
                              color="primary"
                              flat
                            />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:append>
                    <q-icon name="access_time" class="cursor-pointer">
                      <q-popup-proxy
                        cover
                        transition-show="scale"
                        transition-hide="scale"
                      >
                        <q-time
                          v-model="item.fechaPrimeraTomaFormatted"
                          mask="YYYY-MM-DD HH:mm"
                          format24h
                          @update:model-value="updateFechaPrimeraToma(item)"
                          class="rounded-borders"
                        >
                          <div class="row items-center justify-end">
                            <q-btn
                              v-close-popup
                              label="Close"
                              color="primary"
                              flat
                            />
                          </div>
                        </q-time>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
                <div class="row justify-center q-mt-md">
                  <q-btn
                    color="primary"
                    push
                    class="text-weight-medium bor rounded-borders"
                    @click="calculateNextDoses(item)"
                    >Calcular Tomas</q-btn
                  >
                </div>
              </div>
              <div class="row justify-center q-mt-md">
                <q-btn
                  color="red"
                  push
                  label="Eliminar"
                  icon="delete"
                  @click="confirmDeleteMed(index)"
                  class="q-mr-sm text-weight-medium rounded-borders"
                />
                <q-btn
                  color="blue"
                  push
                  label="Editar"
                  icon="edit"
                  @click="editMed(item, index)"
                  class="text-weight-medium rounded-borders"
                />
              </div>
            </q-card-section>
          </q-card>
        </q-expansion-item>
      </q-slide-item>
      <q-separator color="primary" inset />
    </q-list>
    <q-dialog v-model="card" backdrop-filter="blur(4px)">
      <q-card class="rounded-borders q-mr-md">
        <q-card-section>
          <div class="text-h6">Agregar Medicamento</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="onSubmit" @reset.prevent="onReset">
            <q-input
              ref="nameRef"
              dense
              rounded
              outlined
              v-model="newMed.name"
              label="Nombre del Medicamento"
              lazy-rules
              :rules="nameRules"
            />
            <q-input
              ref="cantidadRef"
              dense
              rounded
              outlined
              v-model="newMed.cantidad"
              label="Cantidad"
              type="number"
              lazy-rules
              :rules="cantidadRules"
            />
            <q-input
              ref="tipoDeMedicamentoRef"
              dense
              rounded
              outlined
              v-model="newMed.tipoDeMedicamento"
              label="Tipo de Medicamento"
              lazy-rules
              :rules="tipoDeMedicamentoRules"
            />
            <q-input
              ref="frecuenciaRef"
              dense
              rounded
              outlined
              v-model="newMed.frecuencia"
              label="Frecuencia"
              type="number"
              lazy-rules
              :rules="frecuenciaRules"
            />
            <q-select
              ref="tipoDeFrecuenciaRef"
              dense
              rounded
              outlined
              v-model="newMed.tipoDeFrecuencia"
              :options="['horas', 'días', 'meses']"
              label="Tipo de Frecuencia"
              menu-anchor="bottom left"
              menu-self="top left"
              lazy-rules
              :rules="tipoDeFrecuenciaRules"
            />
            <q-input
              ref="porTiempoRef"
              dense
              rounded
              outlined
              v-model="newMed.porTiempo"
              label="Por Tiempo"
              type="number"
              lazy-rules
              :rules="porTiempoRules"
            />
            <q-select
              ref="tipoDTiempoRef"
              dense
              rounded
              outlined
              v-model="newMed.tipoDTiempo"
              :options="['días', 'semanas', 'meses']"
              label="Tipo de Tiempo"
              menu-anchor="bottom left"
              menu-self="top left"
              lazy-rules
              :rules="tipoDTiempoRules"
            />
            <q-input
              dense
              rounded
              outlined
              v-model="newMed.notas"
              label="Notas"
            />

            <q-card-actions align="center">
              <q-btn
                label="Cancelar"
                color="primary"
                v-close-popup
                class="text-weight-medium"
                push
              />
              <q-btn
                label="Agregar"
                color="secondary"
                type="submit"
                class="text-weight-medium"
                push
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="confirmDeleteDialog" backdrop-filter="blur(4px)">
      <q-card class="rounded-borders">
        <q-card-section>
          <div class="text-h6">Confirmar Eliminación</div>
        </q-card-section>
        <q-card-section>
          <p>¿Estás seguro de que deseas eliminar este medicamento?</p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            label="Cancelar"
            color="primary"
            v-close-popup
            class="text-weight-medium"
            push
          />
          <q-btn
            label="Eliminar"
            color="red"
            @click="deleteMed(confirmDeleteIndex)"
            class="text-weight-medium"
            push
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn
        icon="add_circle"
        color="primary"
        @click="card = !card"
        push
        size="20px"
        class="rounded-borders"
        padding="10px"
      ></q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { date, useQuasar } from 'quasar';

const $q = useQuasar();

const card = ref(false);
const recordatoriosGenerados = ref(
  localStorage.getItem('recordatoriosGenerados') === 'true'
);
const confirmDeleteDialog = ref(false);
const confirmDeleteIndex = ref(null);
const data = ref([]);
const datePopup = ref(null);
let timer = null;

const atajoInstalado = ref(localStorage.getItem('atajoInstalado') === 'true');
const modalInstalacion = ref(false);

const loadFromLocalStorage = () => {
  const storedData = localStorage.getItem('medicamentos');
  if (storedData) {
    data.value = JSON.parse(storedData);
  } else {
    // Agregar ejemplos si no hay datos en localStorage
    data.value = [
      {
        id: date.formatDate(new Date(), 'x'),
        recordatoriosGenerados: false,
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
        id: date.formatDate(new Date(), 'x'),
        recordatoriosGenerados: false,
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

watch(recordatoriosGenerados, (newValue) => {
  localStorage.setItem('recordatoriosGenerados', newValue);
});

function generarRecordatorios(item) {
  console.log('Generar recordatorios para:', item.info.name);
  const json = {
    info: {
      nombre: item.info.name,
      notas: item.info.notas,
    },
    tomas: item.tomas.map((toma) => ({
      fechaHora: date.formatDate(toma.timestamp, 'YYYY-MM-DD HH:mm'),
    })),
  };
  console.log(json);
  const url = `shortcuts://run-shortcut?name=D-pastillero&input=text&text=${encodeURIComponent(
    JSON.stringify(json)
  )}`;
  window.location.href = url;

  $q.dialog({
    title: 'Confirm',
    message: '¿Se generaron los recordatorios?',
    ok: {
      label: 'Sí',
      color: 'positive',
      flat: true,
    },
    cancel: {
      label: 'No',
      color: 'negative',
      flat: true,
    },
    persistent: true,
    style: "border-radius: 20px; 'backdrop-filter': 'blur(4px)'",
  })
    .onOk(() => {
      item.recordatoriosGenerados = true;
    })
    .onCancel(() => {})
    .onDismiss(() => {
      // console.log('I am triggered on both OK and Cancel')
    });

  // window.location
  //   .href(url)
  //   .then(() => {
  //     console.log('Atajo iniciado');
  //   })
  //   .catch((error) => {
  //     console.error('Error al iniciar el atajo:', error);
  //   });
}

function instalanDoAtajo() {
  modalInstalacion.value = false;
  $q.dialog({
    title: 'Confirm',
    message: '¿Pudo completar la instalación del atajo?',
    ok: {
      label: 'Sí',
      color: 'positive',
      flat: true,
    },
    cancel: {
      label: 'No',
      color: 'negative',
      flat: true,
    },
    persistent: true,
    style: "border-radius: 20px; 'backdrop-filter': 'blur(4px)'",
  })
    .onOk(() => {
      atajoInstalado.value = true;
    })
    .onCancel(() => {})
    .onDismiss(() => {
      // console.log('I am triggered on both OK and Cancel')
    });
}

const saveToLocalStorage = () => {
  localStorage.setItem('medicamentos', JSON.stringify(data.value));
};

onMounted(() => {
  loadFromLocalStorage();

  if ('Notification' in window) {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        console.log('Permiso de notificaciones concedido');
        mostrarNotificacion(); // Llama a la función para mostrar la notificación
      } else {
        console.log('Permiso de notificaciones denegado');
      }
    });
  }
});

watch(atajoInstalado, (newValue) => {
  localStorage.setItem('atajoInstalado', newValue);
});

const mostrarNotificacion = () => {
  console.log('Función mostrarNotificacion ejecutada'); // Agrega esta línea
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Push messaging soportado');
    navigator.serviceWorker.ready.then((registration) => {
      console.log('Service Worker listo');
      console.log(registration.showNotification);
      // registration.showNotification('¡Notificación de Prueba!', {
      //   body: 'Esta es una notificación de ejemplo.',
      //   icon: '/icons/icon-128x128.png',
      //   vibrate: [200, 100, 200],
      //   tag: 'prueba-notificacion',
      // });
      console.log('Notificación mostrada');
    });
  } else {
    console.warn('Push messaging no está soportado');
  }
};

watch(data, saveToLocalStorage, { deep: true });

const newMed = ref({
  id: '',
  recordatoriosGenerados: false,
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

const nameRef = ref(null);
const cantidadRef = ref(null);
const tipoDeMedicamentoRef = ref(null);
const frecuenciaRef = ref(null);
const tipoDeFrecuenciaRef = ref(null);
const porTiempoRef = ref(null);
const tipoDTiempoRef = ref(null);

const nameRules = [
  (val) =>
    (val && val.length > 0) || 'Por favor ingrese el nombre del medicamento',
];
const cantidadRules = [
  (val) => (val !== null && val !== '') || 'Por favor ingrese la cantidad',
  (val) => val > 0 || 'La cantidad debe ser mayor a 0',
];
const tipoDeMedicamentoRules = [
  (val) =>
    (val && val.length > 0) || 'Por favor ingrese el tipo de medicamento',
];
const frecuenciaRules = [
  (val) => (val !== null && val !== '') || 'Por favor ingrese la frecuencia',
  (val) => val > 0 || 'La frecuencia debe ser mayor a 0',
];
const tipoDeFrecuenciaRules = [
  (val) =>
    (val && val.length > 0) || 'Por favor seleccione el tipo de frecuencia',
];
const porTiempoRules = [
  (val) => (val !== null && val !== '') || 'Por favor ingrese el tiempo',
  (val) => val > 0 || 'El tiempo debe ser mayor a 0',
];
const tipoDTiempoRules = [
  (val) => (val && val.length > 0) || 'Por favor seleccione el tipo de tiempo',
];

const onSubmit = () => {
  nameRef.value.validate();
  cantidadRef.value.validate();
  tipoDeMedicamentoRef.value.validate();
  frecuenciaRef.value.validate();
  tipoDeFrecuenciaRef.value.validate();
  porTiempoRef.value.validate();
  tipoDTiempoRef.value.validate();

  if (
    nameRef.value.hasError ||
    cantidadRef.value.hasError ||
    tipoDeMedicamentoRef.value.hasError ||
    frecuenciaRef.value.hasError ||
    tipoDeFrecuenciaRef.value.hasError ||
    porTiempoRef.value.hasError ||
    tipoDTiempoRef.value.hasError
  ) {
    // form has error
  } else {
    addMed();
    $q.notify({
      icon: 'done',
      color: 'positive',
      message: 'Medicamento agregado',
      position: 'top-right',
    });
  }
};

const onReset = () => {
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

  nameRef.value.resetValidation();
  cantidadRef.value.resetValidation();
  tipoDeMedicamentoRef.value.resetValidation();
  frecuenciaRef.value.resetValidation();
  tipoDeFrecuenciaRef.value.resetValidation();
  porTiempoRef.value.resetValidation();
  tipoDTiempoRef.value.resetValidation();
};

const addMed = () => {
  data.value.push({
    id: date.formatDate(new Date(), 'x'),
    recordatoriosGenerados: false,
    info: { ...newMed.value },
    tomas: [],
    fechaPrimeraToma: '',
  });
  card.value = false;
  newMed.value = {
    id: '',
    recordatoriosGenerados: false,
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
  confirmDeleteDialog.value = false;
};

const confirmDeleteMed = (index) => {
  confirmDeleteIndex.value = index;
  confirmDeleteDialog.value = true;
};

const editMed = (item, index) => {
  newMed.value = { ...item.info, fechaPrimeraToma: item.fechaPrimeraToma };
  data.value.splice(index, 1);
  card.value = true;
};

const markAsTaken = (item, index) => {
  $q.notify({
    icon: 'done',
    color: 'positive',
    message: `${item.info.name} marcada como realizada el ${formatFecha(
      item.tomas[index].timestamp
    )} a las ${formatHora(item.tomas[index].timestamp)}`,
    position: 'top-right',
  });
  item.tomas[index].tomada = true;
  const takenDose = item.tomas.splice(index, 1)[0];
  item.tomas.push(takenDose);
};

const calculateNextDoses = (item) => {
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

  for (
    let i = 0;
    i < porTiempo * (tipoDTiempo === 'días' ? 24 / frecuencia : 1);
    i++
  ) {
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

  $q.notify({
    icon: 'done',
    color: 'positive',
    message: 'Tomas programadas',
    position: 'top-right',
  });
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
  const now = new Date();
  item.fechaPrimeraToma = now.getTime();
  item.fechaPrimeraTomaFormatted = date.formatDate(
    new Date(),
    'YYYY-MM-DD HH:mm'
  );
};

const getNextDose = (item) => {
  const nextDose = item.tomas.find((toma) => !toma.tomada);
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
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification('Recordatorio de Medicamento', {
              body: `Es hora de tomar tu ${item.info.name}.`,
              icon: 'icons/icon-128x128.png',
              badge: 'icons/icon-128x128.png',
            });
          });
        }
      }, delay);
    }
  }
};

// Llamar a scheduleNotification para cada medicamento
data.value.forEach((item) => {
  scheduleNotification(item);
});

const updateFechaPrimeraToma = (item) => {
  item.fechaPrimeraToma = new Date(item.fechaPrimeraTomaFormatted).getTime();
};

const onDateSelected = (item) => {
  updateFechaPrimeraToma(item);
  datePopup.value.hide();
};

const onLeft = (item, index, reset) => {
  markAsTaken(item, 0);
  reset();
};

const onRight = (index, reset) => {
  finalize(reset);
};

function finalize(reset) {
  timer = setTimeout(() => {
    reset();
  }, 1000);
}

const isFirstPendingDose = (item, index) => {
  return item.tomas.findIndex((toma) => !toma.tomada) === index;
};
</script>

<style scoped>
.text-grey {
  color: grey;
}
.rounded-borders {
  border-radius: 20px;
}
::v-deep(.q-expansion-item__container) {
  border: none !important;
  box-shadow: none !important;
}
</style>
