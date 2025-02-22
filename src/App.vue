<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { onMounted } from 'vue';

export default {
  name: 'App',
  setup() {
    onMounted(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
          .then(function(registration) {
            console.log('Service Worker registrado con éxito:', registration);
          })
          .catch(function(error) {
            console.log('Error al registrar el Service Worker:', error);
          });
      }

      if ('Notification' in window && 'serviceWorker' in navigator) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Permiso de notificación concedido.');
          } else {
            console.log('Permiso de notificación denegado.');
          }
        });
      }
    });
  }
};
</script>
