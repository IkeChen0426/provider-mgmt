<template lang="html">
  <commodity-form :is-edit="false"></commodity-form>
</template>

<script>
export default {
  name: 'CommodityCreate',
  components: {
    CommodityForm: () => import('./components/CommodityForm.vue')
  }
}
</script>
