<template>
    <q-page class="q-pa-none">
      <div v-if="!data || data.length === 0" class="empty-state">
        <div class="text-center">
          <svg width="200" height="200" viewBox="0 0 24 24" class="empty-state-icon">
            <path fill="currentColor" d="M6 3h12c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2m0 2v14h12V5H6m3 3h6v2H9V8m0 4h6v2H9v-2m0 4h6v2H9v-2z"/>
          </svg>
          <div class="text-h6 q-mt-md">No hay medicamentos registrados</div>
          <div class="text-body2 text-grey q-mb-md">
            Comienza agregando tu primer medicamento para gestionar tus tratamientos
          </div>
          <q-btn
            :color="isDark ? 'white' : 'primary'"
            class="action-btn q-px-lg"
            @click="card = true"
            unelevated
          >
            <div class="row items-center no-wrap">
              <q-icon name="add_circle" size="24px" class="q-mr-sm" />
              <div class="text-body1">Registrar Medicamento</div>
            </div>
          </q-btn>
        </div>
      </div>
  
      <div v-else>
        <div v-if="$q.platform.is.ios && !atajoInstalado" class="q-pa-md">
          <q-btn
            label="Generar Recordatorios en iOS"
            @click="modalInstalacion = true"
            color="primary"
            class="rounded-borders full-width"
            padding="10px"
            push
          />
        </div>
  
        <q-dialog v-model="modalInstalacion" backdrop-filter="blur(4px)">
          <q-card class="rounded-borders q-pa-md">
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
                class="rounded-borders full-width"
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
  
        <q-list class="q-px-none q-list" style="padding-bottom: 150px">
          <div v-for="(item, index) in data" :key="index">
            <q-slide-item  v-if="item.tomas && item.tomas.length > 0" @left="onLeft(item, index, $event.reset)">
              <template v-slot:left>
                <div class="">
                  <q-icon name="done" size="20px" />
                  <span>Tomada</span>
                </div>
              </template>
  
              <q-expansion-item
                v-model="expandedItems[item.id]"
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
                    <div v-if="item.info.notas && item.info.notas.trim().length > 0" class="text-caption q-mb-md">
                      <div class="text-subtitle2">Nota:</div>
                      <div class="text-body2">{{ item.info.notas }}</div>
                    </div>
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
                              v-model="datePopupOpen"
                              cover
                              transition-show="scale"
                              transition-hide="scale"
                            >
                              <q-date
                                v-model="item.fechaPrimeraTomaFormatted"
                                mask="YYYY-MM-DD HH:mm"
                                @update:model-value="(val) => {
                                  if (val) {
                                    onDateSelected(item);
                                    datePopupOpen = false;
                                  }
                                }"
                                class="rounded-borders"
                              >
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="OK"
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
                              v-model="timePopupOpen"
                              cover
                              transition-show="scale"
                              transition-hide="scale"
                            >
                              <q-time
                                v-model="item.fechaPrimeraTomaFormatted"
                                mask="YYYY-MM-DD HH:mm"
                                format24h
                                @click:minute="() => timePopupOpen = false"
                                class="rounded-borders"
                              >
                                <div class="row items-center justify-end">
                                  <q-btn
                                    v-close-popup
                                    label="OK"
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
  
            <q-expansion-item
              v-else
              switch-toggle-side
              @click="setDefaultDateTime(item)"
              popup
              class="no-border"
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
                  <div v-if="item.info.notas && item.info.notas.trim().length > 0" class="text-caption q-mb-md">
                    <div class="text-subtitle2">Nota:</div>
                    <div class="text-body2">{{ item.info.notas }}</div>
                  </div>
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
                            v-model="datePopupOpen"
                            cover
                            transition-show="scale"
                            transition-hide="scale"
                          >
                            <q-date
                              v-model="item.fechaPrimeraTomaFormatted"
                              mask="YYYY-MM-DD HH:mm"
                              @update:model-value="(val) => {
                                if (val) {
                                  onDateSelected(item);
                                  datePopupOpen = false;
                                }
                              }"
                              class="rounded-borders"
                            >
                              <div class="row items-center justify-end">
                                <q-btn
                                  v-close-popup
                                  label="OK"
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
                            v-model="timePopupOpen"
                            cover
                            transition-show="scale"
                            transition-hide="scale"
                          >
                            <q-time
                              v-model="item.fechaPrimeraTomaFormatted"
                              mask="YYYY-MM-DD HH:mm"
                              format24h
                              @click:minute="() => timePopupOpen = false"
                              class="rounded-borders"
                            >
                              <div class="row items-center justify-end">
                                <q-btn
                                  v-close-popup
                                  label="OK"
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
            <q-separator color="primary" inset />
          </div>
        </q-list>
      </div>
  
      <q-dialog
        v-model="card"
        transition-show="slide-up"
        transition-hide="slide-down"
        backdrop-filter="blur(4px)"
      >
        <q-card class="rounded-borders" style="width: 100%; max-width: 400px;">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">Agregar Medicamento</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>
  
          <q-separator />
  
          <q-card-section style="max-height: 60vh" class="scroll">
            <q-stepper v-model="step" ref="stepper" color="primary" animated flat vertical class="no-shadow" style="background: transparent">
              <q-step
                :name="1"
                title="Medicamento"
                prefix="1"
                :done="step > 1"
                :error="stepErrors.step1"
                header-nav
              >
                <div class="text-h6 q-mb-md">¿Qué medicamento necesitas?</div>
  
                <q-select
                  ref="nameRef"
                  dense
                  rounded
                  outlined
                  v-model="newMed.name"
                  :options="medicamentosAutocompletado"
                  label="Nombre del Medicamento"
                  lazy-rules
                  :rules="nameRules"
                  class="q-mb-md"
                  use-input
                  input-debounce="0"
                  @filter="filterMedicamentos"
                  :loading="loading"
                  clearable
                  hide-selected
                  fill-input
                  input-class="text-subtitle1"
                >
                  <template v-slot:prepend>
                    <q-icon name="medication" color="primary" />
                  </template>
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        No se encontraron resultados
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
  
                <div class="text-subtitle1 q-mb-sm">Sugerencias:</div>
                <q-scroll-area
                  visible
                  style="height: 150px;"
                  class="rounded-borders"
                >
                  <div class="q-pa-sm">
                    <div v-for="(info, nombre) in medicamentosInfo" :key="nombre" class="col-12">
                      <q-chip
                        clickable
                        @click="newMed.name = nombre"
                        outline
                        :color="medicamentosIconos[nombre]?.color || medicamentosIconos.default.color"
                        text-color="primary"
                        class="full-width justify-center q-mb-sm"
                      >
                        <q-avatar :color="medicamentosIconos[nombre]?.color || medicamentosIconos.default.color" text-color="white">
                          <q-icon :name="medicamentosIconos[nombre]?.icono || medicamentosIconos.default.icono" />
                        </q-avatar>
                        <div class="ellipsis">{{ nombre }}</div>
                        <q-tooltip>
                          {{ info.tipo }} - {{ info.cantidadesComunes[0]?.concentracion || info.cantidadesComunes[0] + ' mg' }}
                        </q-tooltip>
                      </q-chip>
                    </div>
                  </div>
                </q-scroll-area>
              </q-step>
  
              <q-step
                :name="2"
                title="Detalles"
                prefix="2"
                :done="step > 2"
                :error="stepErrors.step2"
                header-nav
              >
                <div class="row q-col-gutter-sm">
                  <div class="col-12">
                    <div class="row q-col-gutter-sm">
                      <div class="col">
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
                        >
                          <template v-slot:append>
                            <q-icon
                              name="help"
                              color="info"
                              size="20px"
                              class="cursor-pointer"
                            >
                              <q-tooltip>
                                Indica la cantidad del medicamento
                              </q-tooltip>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>
                      <div class="col">
                        <q-select
                          ref="tipoDeMedicamentoRef"
                          dense
                          rounded
                          outlined
                          v-model="newMed.tipoDeMedicamento"
                          :options="tiposDeMedicamentos"
                          label="Tipo de Medicamento"
                          lazy-rules
                          :rules="tipoDeMedicamentoRules"
                        >
                          <template v-slot:append>
                            <q-icon
                              name="help"
                              color="info"
                              size="20px"
                              class="cursor-pointer"
                            >
                              <q-tooltip>
                                Selecciona el tipo de medicamento (tableta, cápsula, jarabe, etc.)
                              </q-tooltip>
                            </q-icon>
                          </template>
                          <template v-if="newMed.name && medicamentosInfo[newMed.name]" v-slot:hint>
                            Sugerido: {{ medicamentosInfo[newMed.name].tipo }}
                          </template>
                        </q-select>
                      </div>
                    </div>
                  </div>
  
                  <div class="col-12">
                    <div class="row q-col-gutter-sm">
                      <div class="col">
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
                        >
                          <template v-slot:append>
                            <q-icon
                              name="help"
                              color="info"
                              size="20px"
                              class="cursor-pointer"
                            >
                              <q-tooltip>
                                Indica cada cuánto tiempo debe tomarse el medicamento
                              </q-tooltip>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>
                      <div class="col-auto">
                        <q-select
                          dense
                          rounded
                          outlined
                          v-model="newMed.tipoDeFrecuencia"
                          :options="['minutos', 'horas', 'días', 'meses']"
                          style="min-width: 120px"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </q-step>
  
              <q-step
                :name="3"
                title="Duración"
                prefix="3"
                :done="step > 3"
                :error="stepErrors.step3"
                header-nav
              >
                <div class="row q-col-gutter-sm">
                  <div class="col-12">
                    <div class="row q-col-gutter-sm">
                      <div class="col">
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
                        >
                          <template v-slot:append>
                            <q-icon
                              name="help"
                              color="info"
                              size="20px"
                              class="cursor-pointer"
                            >
                              <q-tooltip>
                                Indica por cuánto tiempo debe tomar el medicamento
                              </q-tooltip>
                            </q-icon>
                          </template>
                        </q-input>
                      </div>
                      <div class="col">
                        <q-select
                          ref="tipoDTiempoRef"
                          dense
                          rounded
                          outlined
                          v-model="newMed.tipoDTiempo"
                          :options="['días', 'semanas', 'meses']"
                          label="Tipo de Tiempo"
                          lazy-rules
                          :rules="tipoDTiempoRules"
                        >
                          <template v-slot:append>
                            <q-icon
                              name="help"
                              color="info"
                              size="20px"
                              class="cursor-pointer"
                            >
                              <q-tooltip>
                                Selecciona la unidad de tiempo del tratamiento
                              </q-tooltip>
                            </q-icon>
                          </template>
                        </q-select>
                      </div>
                    </div>
                  </div>
  
                  <div class="col-12">
                    <q-input
                      dense
                      rounded
                      outlined
                      v-model="newMed.notas"
                      label="Notas"
                      type="textarea"
                      autogrow
                    >
                      <template v-slot:append>
                        <q-icon
                          name="help"
                          color="info"
                          size="20px"
                          class="cursor-pointer"
                        >
                          <q-tooltip>
                            Agrega notas o instrucciones especiales sobre el medicamento
                          </q-tooltip>
                        </q-icon>
                      </template>
                    </q-input>
                  </div>
                </div>
              </q-step>
            </q-stepper>
          </q-card-section>
  
          <q-separator />
  
          <q-card-actions align="right" class="bg-white">
            <q-btn v-if="step > 1" flat color="primary" label="Atrás" @click="step--" class="q-px-md" rounded />
            <q-btn v-if="step < 3" color="primary" label="Siguiente" @click="nextStep" class="q-px-md" rounded unelevated />
            <q-btn v-if="step === 3" color="primary" label="Agregar" @click="onSubmit" class="q-px-md" rounded unelevated />
          </q-card-actions>
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
  
      <!-- Barra de navegación inferior -->
  
  
      <q-page-sticky v-if="data && data.length > 0" position="bottom-right" :offset="[18, 94]">
        <q-btn
          :color="isDark ? 'white' : 'primary'"
          icon="add_circle"
          class="floating-btn"
          @click="card = true"
        />
      </q-page-sticky>
    </q-page>
  </template>
  
  <script setup>
  import { ref, onMounted, watch, nextTick } from 'vue';
  import { date, useQuasar } from 'quasar';
  import { useMedicamentos } from '../composables/useMedicamentos';
  import { useNotificaciones } from '../composables/useNotificaciones';
  import { useDarkMode } from '../composables/useDarkMode';
  
  const $q = useQuasar();
  const { isDark, toggleDarkMode } = useDarkMode();
  
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
  
  const step = ref(1);
  const stepErrors = ref({
    step1: false,
    step2: false,
    step3: false
  });
  const medicamentosInfo = {
    'Paracetamol': {
      tipo: 'tableta',
      cantidadesComunes: [
        { cantidad: 1, unidad: 'tableta', concentracion: '500 mg' },
        { cantidad: 1, unidad: 'tableta', concentracion: '650 mg' },
        { cantidad: 1, unidad: 'tableta', concentracion: '1000 mg' }
      ],
      frecuenciasComunes: [
        { intervalo: 6, unidad: 'horas' },
        { intervalo: 8, unidad: 'horas' },
        { intervalo: 1, unidad: 'días' }
      ],
      duracionComun: {
        tiempo: 3,
        unidad: 'días'
      }
    },
    'Ibuprofeno': {
      tipo: 'tableta',
      cantidadesComunes: [
        { cantidad: 1, unidad: 'tableta', concentracion: '200 mg' },
        { cantidad: 1, unidad: 'tableta', concentracion: '400 mg' },
        { cantidad: 1, unidad: 'tableta', concentracion: '600 mg' }
      ],
      frecuenciasComunes: [
        { intervalo: 8, unidad: 'horas' },
        { intervalo: 12, unidad: 'horas' },
        { intervalo: 1, unidad: 'días' }
      ],
      duracionComun: {
        tiempo: 5,
        unidad: 'días'
      }
    },
    'Amoxicilina': {
      tipo: 'cápsula',
      cantidadesComunes: [500, 750, 1000], // en mg
      frecuenciasComunes: [8, 12], // en horas
      duracionComun: {
        tiempo: 7,
        unidad: 'días'
      }
    },
    'Omeprazol': {
      tipo: 'cápsula',
      cantidadesComunes: [20, 40], // en mg
      frecuenciasComunes: [24], // en horas
      duracionComun: {
        tiempo: 14,
        unidad: 'días'
      }
    },
    'Metformina': {
      tipo: 'tableta',
      cantidadesComunes: [500, 850, 1000], // en mg
      frecuenciasComunes: [12, 24], // en horas
      duracionComun: {
        tiempo: 30,
        unidad: 'días'
      }
    },
    'Losartán': {
      tipo: 'tableta',
      cantidadesComunes: [50, 100], // en mg
      frecuenciasComunes: [24], // en horas
      duracionComun: {
        tiempo: 30,
        unidad: 'días'
      }
    },
    'Aspirina': {
      tipo: 'tableta',
      cantidadesComunes: [81, 100, 325], // en mg
      frecuenciasComunes: [24], // en horas
      duracionComun: {
        tiempo: 30,
        unidad: 'días'
      }
    },
    'Loratadina': {
      tipo: 'tableta',
      cantidadesComunes: [10], // en mg
      frecuenciasComunes: [24], // en horas
      duracionComun: {
        tiempo: 15,
        unidad: 'días'
      }
    },
    'Cetirizina': {
      tipo: 'tableta',
      cantidadesComunes: [10], // en mg
      frecuenciasComunes: [24], // en horas
      duracionComun: {
        tiempo: 15,
        unidad: 'días'
      }
    },
    'Salbutamol': {
      tipo: 'inhalador',
      cantidadesComunes: [100, 200], // en mcg por inhalación
      frecuenciasComunes: [4, 6, 8], // en horas
      duracionComun: {
        tiempo: 30,
        unidad: 'días'
      }
    }
  };
  
  const tiposDeMedicamentos = [
    'tableta',
    'cápsula',
    'jarabe',
    'gotas',
    'inhalador',
    'crema',
    'parche',
    'supositorio',
    'inyectable',
    'suspensión'
  ];
  
  const medicamentosTemporada = [
    {
      nombre: 'Paracetamol',
      color: 'primary',
      icono: 'medication',
      temporada: 'invierno'
    },
    {
      nombre: 'Ibuprofeno',
      color: 'secondary',
      icono: 'healing',
      temporada: 'primavera'
    },
    {
      nombre: 'Vitamina C',
      color: 'positive',
      icono: 'vitamin',
      temporada: 'otoño'
    }
  ];
  
  const loading = ref(false);
  const medicamentosOriginales = [
    'Paracetamol',
    'Ibuprofeno',
    'Amoxicilina',
    'Omeprazol',
    'Metformina',
    'Losartán',
    'Aspirina',
    'Diclofenaco',
    'Cetirizina',
    'Ranitidina',
    'Loratadina',
    'Dexametasona',
    'Prednisona',
    'Metronidazol',
    'Ciprofloxacino',
    'Azitromicina',
    'Claritromicina',
    'Fluconazol',
    'Nistatina',
    'Salbutamol'
  ];
  const medicamentosAutocompletado = ref(medicamentosOriginales);
  
  const filterMedicamentos = (val, update, abort) => {
    if (val.length < 2) {
      update(() => {
        medicamentosAutocompletado.value = medicamentosOriginales;
      });
      return;
    }
  
    update(() => {
      const needle = val.toLowerCase();
      medicamentosAutocompletado.value = medicamentosOriginales.filter(
        v => v.toLowerCase().indexOf(needle) > -1
      );
    });
  };
  
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
    cantidad: 1,
    unidadCantidad: '',
    concentracion: '',
    tipoDeMedicamento: '',
    frecuencia: 0,
    tipoDeFrecuencia: 'horas',
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
    const validations = [
      nameRef.value?.validate(),
      cantidadRef.value?.validate(),
      tipoDeMedicamentoRef.value?.validate(),
      frecuenciaRef.value?.validate(),
      porTiempoRef.value?.validate(),
      tipoDTiempoRef.value?.validate()
    ];
  
    stepErrors.value.step1 = nameRef.value?.hasError || false;
    stepErrors.value.step2 = cantidadRef.value?.hasError ||
      tipoDeMedicamentoRef.value?.hasError ||
      frecuenciaRef.value?.hasError || false;
    stepErrors.value.step3 = porTiempoRef.value?.hasError ||
      tipoDTiempoRef.value?.hasError || false;
  
    const hasErrors = [
      nameRef.value?.hasError,
      cantidadRef.value?.hasError,
      tipoDeMedicamentoRef.value?.hasError,
      frecuenciaRef.value?.hasError,
      porTiempoRef.value?.hasError,
      tipoDTiempoRef.value?.hasError
    ].some(error => error === true);
  
    if (hasErrors) {
      $q.notify({
        color: 'negative',
        message: 'Por favor complete todos los campos requeridos',
        position: 'top'
      });
    } else {
      addMed();
      $q.notify({
        icon: 'done',
        color: 'positive',
        message: 'Medicamento agregado',
        position: 'top'
      });
    }
  };
  
  const onReset = () => {
    newMed.value = {
      name: '',
      cantidad: 0,
      tipoDeMedicamento: '',
      frecuencia: 0,
      tipoDeFrecuencia: 'horas',
      porTiempo: 0,
      tipoDTiempo: '',
      notas: '',
      fechaPrimeraToma: '',
    };
  
    // Reset solo las validaciones de los campos que existen
    nameRef.value?.resetValidation();
    cantidadRef.value?.resetValidation();
    tipoDeMedicamentoRef.value?.resetValidation();
    frecuenciaRef.value?.resetValidation();
    porTiempoRef.value?.resetValidation();
    tipoDTiempoRef.value?.resetValidation();
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
      tipoDeFrecuencia: 'horas',
      porTiempo: 0,
      tipoDTiempo: '',
      notas: '',
      fechaPrimeraToma: '',
    };
    // Resetear el stepper al primer paso
    step.value = 1;
  };
  
  const expandedItems = ref({});
  
  const deleteMed = (index) => {
    // Eliminar inmediatamente sin animación
    data.value.splice(index, 1);
    confirmDeleteDialog.value = false;
  };
  
  const confirmDeleteMed = (index) => {
    confirmDeleteIndex.value = index;
    confirmDeleteDialog.value = true;
  };
  
  const editMed = (item, index) => {
    // Guardar el índice original
    const originalIndex = index;
    newMed.value = { ...item.info, fechaPrimeraToma: item.fechaPrimeraToma };
    // Eliminar el item actual
    data.value.splice(index, 1);
    card.value = true;
  
    // Cuando se cierre el diálogo, insertar el nuevo item en la posición original
    const unwatch = watch(card, (newValue) => {
      if (!newValue) {
        // Si el diálogo se cerró y hay un nuevo item, insertarlo en la posición original
        if (data.value.length > originalIndex) {
          const lastItem = data.value.pop();
          if (lastItem) {
            data.value.splice(originalIndex, 0, lastItem);
          }
        }
        unwatch(); // Dejar de observar después de manejar el cierre
      }
    });
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
  
  const nextStep = () => {
    if (step.value === 1) {
      nameRef.value.validate();
      stepErrors.value.step1 = nameRef.value.hasError;
      if (nameRef.value.hasError) return;
    } else if (step.value === 2) {
      cantidadRef.value.validate();
      tipoDeMedicamentoRef.value.validate();
      frecuenciaRef.value.validate();
      stepErrors.value.step2 = cantidadRef.value.hasError ||
          tipoDeMedicamentoRef.value.hasError ||
          frecuenciaRef.value.hasError;
      if (stepErrors.value.step2) return;
    }
    step.value++;
  };
  
  const onTipoMedicamentoChange = (value) => {
    // Si el tipo seleccionado es diferente al sugerido, mostrar una notificación
    if (newMed.value.name && medicamentosInfo[newMed.value.name] &&
        value !== medicamentosInfo[newMed.value.name].tipo) {
      $q.notify({
        message: `El tipo sugerido para ${newMed.value.name} es ${medicamentosInfo[newMed.value.name].tipo}`,
        color: 'info',
        position: 'top',
        timeout: 3000
      });
    }
  };
  
  watch(() => newMed.value.name, (newValue) => {
    if (newValue && medicamentosInfo[newValue]) {
      // Autocompletar el tipo de medicamento
      newMed.value.tipoDeMedicamento = medicamentosInfo[newValue].tipo;
  
      // Sugerir la primera cantidad común
      if (medicamentosInfo[newValue].cantidadesComunes.length > 0) {
        newMed.value.cantidad = medicamentosInfo[newValue].cantidadesComunes[0].cantidad;
        newMed.value.unidadCantidad = medicamentosInfo[newValue].cantidadesComunes[0].unidad;
        newMed.value.concentracion = medicamentosInfo[newValue].cantidadesComunes[0].concentracion;
      }
  
      // Sugerir la primera frecuencia común
      if (medicamentosInfo[newValue].frecuenciasComunes.length > 0) {
        newMed.value.frecuencia = medicamentosInfo[newValue].frecuenciasComunes[0].intervalo;
        newMed.value.tipoDeFrecuencia = medicamentosInfo[newValue].frecuenciasComunes[0].unidad;
      }
  
      // Sugerir la duración común
      if (medicamentosInfo[newValue].duracionComun) {
        newMed.value.porTiempo = medicamentosInfo[newValue].duracionComun.tiempo;
        newMed.value.tipoDTiempo = medicamentosInfo[newValue].duracionComun.unidad;
      }
    }
  });
  
  const seleccionarDosis = (dosis) => {
    newMed.value.cantidad = dosis.cantidad;
    newMed.value.unidadCantidad = dosis.unidad;
    newMed.value.concentracion = dosis.concentracion;
  };
  
  const seleccionarFrecuencia = (freq) => {
    newMed.value.frecuencia = freq.intervalo;
    newMed.value.tipoDeFrecuencia = freq.unidad;
  };
  
  const medicamentosIconos = {
    'Paracetamol': { icono: 'medication', color: 'primary' },
    'Ibuprofeno': { icono: 'healing', color: 'secondary' },
    'Amoxicilina': { icono: 'medication', color: 'deep-orange' },
    'Omeprazol': { icono: 'medication', color: 'purple' },
    'Metformina': { icono: 'medication', color: 'indigo' },
    'Losartán': { icono: 'medication', color: 'blue-grey' },
    'Aspirina': { icono: 'medication', color: 'pink' },
    'Loratadina': { icono: 'air', color: 'light-blue' },
    'Cetirizina': { icono: 'air', color: 'cyan' },
    'Salbutamol': { icono: 'air', color: 'teal' },
    'default': { icono: 'medication', color: 'grey' }
  };
  
  const datePopupOpen = ref(false);
  const timePopupOpen = ref(false);
  
  const tab = ref('medicamentos');
  
  const addButton = ref(null);
  const dialogRef = ref(null);
  const cardRef = ref(null);
  
  const isMorphing = ref(false);
  let currentMorphCancel = null;
  
  const startMorph = () => {
    isMorphing.value = true;
    card.value = true;
  
    nextTick(() => {
      currentMorphCancel = morph({
        from: addButton.value.$el,
        to: cardRef.value.$el,
        duration: 300,
        easing: 'ease-in-out',
        classes: 'morph-transition',
        onEnd: (direction) => {
          if (direction === 'to') {
            isMorphing.value = false;
          }
        }
      });
    });
  };
  
  const endMorph = () => {
    if (!isMorphing.value) {
      isMorphing.value = true;
  
      currentMorphCancel = morph({
        from: cardRef.value.$el,
        to: addButton.value.$el,
        duration: 300,
        easing: 'ease-in-out',
        classes: 'morph-transition',
        onEnd: (direction) => {
          if (direction === 'to') {
            isMorphing.value = false;
            card.value = false;
          }
        }
      });
    }
  };
  </script>
  
  <style>
  
  /* Estilos para modo oscuro */
  .body--dark {
    --card-bg: #1d1d1d;
    --card-bg-hover: rgba(45, 45, 45, 0.9);
    --card-border: rgba(255, 255, 255, 0.12);
    --card-shadow: rgba(0, 0, 0, 0.2);
    --card-shadow-hover: rgba(0, 0, 0, 0.3);
    --text-color: rgba(255, 255, 255, 0.9);
    --text-secondary: rgba(255, 255, 255, 0.7);
    --border-color: rgba(255, 255, 255, 0.12);
    --page-bg: #121212;
    --btn-shadow: rgba(0, 0, 0, 0.3);
    --btn-shadow-hover: rgba(0, 0, 0, 0.4);
    --btn-bg: #8bbcf3;
    --btn-bg-hover: #79b0f2;
    --btn-border: #8bbcf3;
    --btn-text: #121212;
  }
  
  /* Estilos para modo claro */
  .body--light {
    --card-bg: white;
    --card-bg-hover: rgba(255, 255, 255, 0.9);
    --card-border: rgba(139, 188, 243, 0.2);
    --card-shadow: rgba(139, 188, 243, 0.2);
    --card-shadow-hover: rgba(139, 188, 243, 0.3);
    --text-color: rgba(0, 0, 0, 0.9);
    --text-secondary: rgba(0, 0, 0, 0.7);
    --border-color: rgba(0, 0, 0, 0.12);
    --page-bg: #f5f5f5;
    --btn-shadow: rgba(0, 0, 0, 0.15);
    --btn-shadow-hover: rgba(0, 0, 0, 0.2);
    --btn-bg: #8bbcf3;
    --btn-bg-hover: #79b0f2;
    --btn-border: #8bbcf3;
    --btn-text: white;
  }
  
  /* Estilos para los botones de acción */
  .action-btn {
    border-radius: 12px !important;
    height: 48px !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    box-shadow: 0 4px 20px var(--btn-shadow) !important;
    transition: all 0.3s ease !important;
    background: var(--btn-bg) !important;
    border: 1px solid var(--btn-border) !important;
    color: var(--btn-text) !important;
  }
  
  .action-btn:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 24px var(--btn-shadow-hover) !important;
    background: var(--btn-bg-hover) !important;
  }
  
  .floating-btn {
    border-radius: 15px !important;
    width: 48px !important;
    height: 48px !important;
    backdrop-filter: blur(10px) !important;
    -webkit-backdrop-filter: blur(10px) !important;
    box-shadow: 0 4px 20px var(--btn-shadow) !important;
    transition: all 0.3s ease !important;
    background: var(--btn-bg) !important;
    border: 1px solid var(--btn-border) !important;
    color: var(--btn-text) !important;
    z-index: 2001 !important;
  }
  
  .floating-btn:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 6px 24px var(--btn-shadow-hover) !important;
    background: var(--btn-bg-hover) !important;
  }
  
  /* Estilos para las tarjetas de medicamentos */
  .medication-card {
    overflow: hidden;
    width: 100%;
  }
  
  .medication-card .q-expansion-item__container {
    background: var(--card-bg) !important;
    border: none !important;
    margin: 0 !important;
    padding: 8px 16px !important;
  }
  
  /* Estilos para el slide action */
  .slide-action {
    height: 100%;
    width: 100%;
    background: var(--q-positive);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }
  
  /* Eliminar efectos no deseados y ajustar el slide */
  .q-slide-item {
    margin: 0;
    overflow: hidden;
    background: transparent !important;
  }
  
  .q-slide-item__content {
    background: var(--card-bg) !important;
    border-bottom: 1px solid var(--border-color) !important;
  }
  
  .q-slide-item__left {
    background: var(--q-positive) !important;
    color: white !important;
    min-width: 100px !important;
  }
  
  /* Ajustes para el modo oscuro/claro */
  .body--dark .q-slide-item__content,
  .body--dark .medication-card .q-expansion-item__container {
    background: #1d1d1d !important;
    border-bottom-color: rgba(255, 255, 255, 0.12) !important;
  }
  
  .body--light .q-slide-item__content,
  .body--light .medication-card .q-expansion-item__container {
    background: white !important;
    border-bottom-color: rgba(0, 0, 0, 0.12) !important;
  }
  
  /* Eliminar bordes verdes después del slide */
  .q-slide-item::after,
  .q-slide-item::before,
  .q-slide-item__content::after,
  .q-slide-item__content::before {
    display: none !important;
  }
  
  /* Quitar el borde del expansion item popup */
  .q-expansion-item--popup > .q-expansion-item__container {
    border: none !important;
  }
  
  /* Restaurar estilos de la barra de navegación */
  
  
  .nav-bar:hover {
    transform: translateX(-50%) translateY(-2px) !important;
    box-shadow: 0 8px 32px rgba(139, 188, 243, 0.3) !important;
    background: rgba(139, 188, 243, 0.25) !important;
  }
  
  .nav-bar .q-tab {
    border-radius: 12px !important;
    margin: 0 2px !important;
    transition: all 0.3s !important;
    min-height: 40px !important;
    padding: 0 8px !important;
    color: var(--text-color) !important;
  }
  
  .nav-bar .q-tab:hover {
    background: rgba(139, 188, 243, 0.2) !important;
  }
  
  .nav-bar .q-tab--active {
    background: rgba(139, 188, 243, 0.3) !important;
    color: var(--text-color) !important;
  }
  
  .rounded-borders {
    border-radius: 20px;
  }
  
  .q-card {
    border-radius: 20px;
  }
  
  /* Estilos para los diálogos y modales */
  .q-dialog__inner > div {
    border-radius: 20px !important;
  }
  
  .q-dialog .q-card {
    border-radius: 20px !important;
    overflow: hidden;
  }
  
  /* Quitar bordes redondeados internos pero mantenerlos en los botones */
  .q-dialog .q-card .q-card,
  .q-dialog .q-stepper,
  .q-dialog .q-input,
  .q-dialog .q-select {
    border-radius: 0 !important;
  }
  
  /* Mantener bordes redondeados solo en botones de acciones */
  .q-dialog .q-card__actions .q-btn {
    border-radius: 12px !important;
    padding: 8px 16px !important;
    min-width: 100px !important;
  }
  
  .q-dialog .q-card__actions {
    padding: 16px !important;
    background: var(--card-bg) !important;
  }
  
  /* .q-list {
     !important;
  } */
  
  /* Estilos para el diálogo de agregar medicamento */
  .q-dialog__card {
    display: flex !important;
    flex-direction: column !important;
  }
  
  .q-dialog__card .q-card__section.scroll {
    flex: 1 1 auto !important;
    overflow-y: auto !important;
  }
  
  .q-dialog__card .q-card__actions {
    flex: 0 0 auto !important;
  }
  
  /* Ajustar el tamaño de las notas */
  .text-body2 {
    font-size: 14px;
    line-height: 1.4;
    color: var(--text-secondary);
  }
  
  /* Ajustes para las notas */
  .text-caption .text-subtitle2 {
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .text-caption .text-body2 {
    color: var(--text-secondary);
    font-size: 0.875rem;
    line-height: 1.4;
  }
  
  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 150px);
    padding: 24px;
  }
  
  .empty-state-icon {
    color: var(--primary);
    opacity: 0.7;
    margin-bottom: 24px;
    animation: float 3s ease-in-out infinite;
  }
  
  .empty-state .text-h6 {
    font-weight: 500;
    color: var(--text-color);
    margin-bottom: 8px;
  }
  
  .empty-state .text-body2 {
    max-width: 280px;
    margin: 0 auto 24px;
    line-height: 1.5;
    color: var(--text-secondary);
  }
  
  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
    100% {
      transform: translateY(0px);
    }
  }
  
  /* Estilos para la transición de morphing */
  .morph-transition {
    display: none;
  }
  
  /* Ajustar el z-index del diálogo para que esté por encima del morphing */
  .q-dialog {
    z-index: 5999 !important;
  }
  
  .q-dialog__backdrop {
    display: none;
  }
  </style>