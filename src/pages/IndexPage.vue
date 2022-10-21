<template>
  <q-page class="">
    <q-list
      v-for="(item, index) in data"
      :key="index"
      bordered
      class="rounded-borders"
    >
      <q-expansion-item
        expand-separator
        icon="vaccines"
        :label="item.info.name"
        :caption="`${item.info.cantidad} c/${item.info.frecuencia} ${item.info.tipoDeFrecuencia} por ${item.info.porTiempo} ${item.info.tipoDTiempo}`"
      >
        <q-card>
          <q-card-section>
            <q-item-label header>{{ item.info.notas }}</q-item-label>
            <q-list bordered separator>
              <q-item v-for="(toma, index) in item.tomas" :key="index">
                <q-item-section>8:30am</q-item-section>
                <q-item-section avatar>
                  <q-btn-group push>
                    <q-btn
                      color="red"
                      push
                      label="pospone"
                      icon="watch_later"
                    />
                    <q-btn color="green" push label="tomada" icon="done" />
                  </q-btn-group>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
    <q-dialog v-model="card">
      <q-card>
        <q-card-section>
          <div class="text-h6">pastilla</div>
        </q-card-section>

        <q-card-section class="q-pt-none"> </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn round icon="add" color="accent" @click="card = !card"></q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
const card = ref(false);
const data = [
  {
    info: {
      name: 'Amoxixilina',
      cantidad: 1,
      frecuencia: 8,
      tipoDeFrecuencia: 'horas',
      porTiempo: 5,
      tipoDTiempo: 'dias',
      notas: 'para la infeccion',
    },
    tomas: [
      {
        hora: '8:30',
        tomada: false,
      },
      {
        hora: '2:30',
        tomada: false,
      },
    ],
  },
  {
    info: {
      name: 'Amoxixilina2',
      cantidad: 2,
      frecuencia: 6,
      tipoDeFrecuencia: 'horas',
      porTiempo: 10,
      tipoDTiempo: 'dias',
      notas: 'para el dolor',
    },
    tomas: [
      {
        hora: '8:30',
        tomada: false,
      },
      {
        hora: '2:30',
        tomada: false,
      },
    ],
  },
];
</script>
