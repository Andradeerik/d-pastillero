import { ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { Dark } from 'quasar';

export const useDarkMode = () => {
  const $q = useQuasar();
  const isDark = ref(Dark.isActive);

  const toggleDarkMode = () => {
    Dark.toggle();
    isDark.value = Dark.isActive;
  };

  watch(isDark, (val) => {
    Dark.set(val);
  });

  return {
    isDark,
    toggleDarkMode
  };
};
