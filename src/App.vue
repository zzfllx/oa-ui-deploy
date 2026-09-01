<template>
  <router-view v-if="isLogin" />
  <AppShell v-else>
    <router-view />
  </AppShell>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppShell from './components/AppShell.vue'

const route = useRoute()
const isLogin = computed(() => route.name === 'login')
</script>
