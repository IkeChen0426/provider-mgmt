<template lang="html">
  <commodity-form :is-edit="true"></commodity-form>
</template>

<script>
export default {
  name: 'CommodityEdit',
  components: {
    CommodityForm: () => import('./components/CommodityForm.vue')
  }
}
</script>
