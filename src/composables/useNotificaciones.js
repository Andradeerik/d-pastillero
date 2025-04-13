import { ref } from 'vue';

export const useNotificaciones = () => {
  const atajoInstalado = ref(localStorage.getItem('atajoInstalado') === 'true');
  const modalInstalacion = ref(false);

  const generarRecordatorios = (item) => {
    const json = {
      info: {
        nombre: item.info.name,
        notas: item.info.notas,
      },
      tomas: item.tomas.map((toma) => ({
        fechaHora: date.formatDate(toma.timestamp, 'YYYY-MM-DD HH:mm'),
      })),
    };

    const url = `shortcuts://run-shortcut?name=D-pastillero&input=text&text=${encodeURIComponent(
      JSON.stringify(json)
    )}`;
    window.location.href = url;
  };

  const scheduleNotification = (item, getNextDose) => {
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

  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          console.log('Permiso de notificaciones concedido');
        }
      });
    }
  };

  return {
    atajoInstalado,
    modalInstalacion,
    generarRecordatorios,
    scheduleNotification,
    requestNotificationPermission
  };
};
