import { ref, watch } from 'vue';
import { date, useQuasar } from 'quasar';

export const useMedicamentos = () => {
  const $q = useQuasar();
  const data = ref([]);
  const medicamentosInfo = {
    'Paracetamol': {
      tipo: 'tableta',
      cantidadesComunes: [
        { cantidad: 1, unidad: 'tableta', concentracion: '500 mg' },
        { cantidad: 1, unidad: 'tableta', concentracion: '650 mg' }
      ],
      frecuenciasComunes: [
        { intervalo: 6, unidad: 'horas' },
        { intervalo: 8, unidad: 'horas' }
      ],
      duracionComun: {
        tiempo: 3,
        unidad: 'días'
      }
    },
    'Ibuprofeno': {
      tipo: 'tableta',
      cantidadesComunes: [
        { cantidad: 1, unidad: 'tableta', concentracion: '400 mg' },
        { cantidad: 1, unidad: 'tableta', concentracion: '600 mg' }
      ],
      frecuenciasComunes: [
        { intervalo: 8, unidad: 'horas' },
        { intervalo: 12, unidad: 'horas' }
      ],
      duracionComun: {
        tiempo: 5,
        unidad: 'días'
      }
    }
  };

  const tiposDeMedicamentos = [
    'tableta',
    'cápsula',
    'jarabe',
    'gotas',
    'inhalador'
  ];

  const medicamentosIconos = {
    'Paracetamol': { icono: 'medication', color: 'primary' },
    'Ibuprofeno': { icono: 'healing', color: 'secondary' },
    'default': { icono: 'medication', color: 'grey' }
  };

  const loadFromLocalStorage = () => {
    const storedData = localStorage.getItem('medicamentos');
    if (storedData) {
      data.value = JSON.parse(storedData);
    }
  };

  const saveToLocalStorage = () => {
    localStorage.setItem('medicamentos', JSON.stringify(data.value));
  };

  const addMed = (newMed) => {
    data.value.push({
      id: date.formatDate(new Date(), 'x'),
      recordatoriosGenerados: false,
      info: { ...newMed },
      tomas: [],
      fechaPrimeraToma: '',
    });
  };

  const deleteMed = (index) => {
    data.value.splice(index, 1);
  };

  const editMed = (item, index) => {
    data.value.splice(index, 1);
    return { ...item.info, fechaPrimeraToma: item.fechaPrimeraToma };
  };

  const markAsTaken = (item, index) => {
    item.tomas[index].tomada = true;
    const takenDose = item.tomas.splice(index, 1)[0];
    item.tomas.push(takenDose);

    $q.notify({
      icon: 'done',
      color: 'positive',
      message: `${item.info.name} marcada como realizada el ${formatFecha(
        item.tomas[index].timestamp
      )} a las ${formatHora(item.tomas[index].timestamp)}`,
      position: 'top-right',
    });
  };

  const calculateNextDoses = (item) => {
    if (!item.fechaPrimeraToma) return;

    const frecuencia = item.info.frecuencia;
    const tipoDeFrecuencia = item.info.tipoDeFrecuencia;
    const porTiempo = item.info.porTiempo;
    const tipoDTiempo = item.info.tipoDTiempo;

    const primeraToma = new Date(item.fechaPrimeraToma);
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

  const getNextDose = (item) => {
    const nextDose = item.tomas.find((toma) => !toma.tomada);
    return nextDose ? nextDose.timestamp : null;
  };

  const isFirstPendingDose = (item, index) => {
    return item.tomas.findIndex((toma) => !toma.tomada) === index;
  };

  const formatHora = (timestamp) => {
    if (!timestamp) return '';
    return date.formatDate(new Date(timestamp), 'hh:mm A');
  };

  const formatFecha = (timestamp) => {
    if (!timestamp) return '';
    return date.formatDate(new Date(timestamp), 'ddd, D MMM');
  };

  watch(data, saveToLocalStorage, { deep: true });

  return {
    data,
    medicamentosInfo,
    tiposDeMedicamentos,
    medicamentosIconos,
    loadFromLocalStorage,
    addMed,
    deleteMed,
    editMed,
    markAsTaken,
    calculateNextDoses,
    getNextDose,
    isFirstPendingDose,
    formatHora,
    formatFecha
  };
};
