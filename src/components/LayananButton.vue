<template>
  <v-card class="info" color="layanan.warna" dark>
    <v-card-title class="headline">{{layanan.namaLayanan}}</v-card-title>

    <v-card-subtitle v-text="layanan.description"></v-card-subtitle>

    <v-card-actions>
      <v-btn text v-on:click="popupLayanan(layanan)">Lihat syarat</v-btn>
    </v-card-actions>
  </v-card>
</template>
<script>
export default {
  props: {
    layanan: Object,
    default: () => ({
      id: "1010",
      namaLayanan: "",
      description: "",
      warna: "#1F7087",
      Syarat: []
    })
  },
  methods: {
    popupLayanan(layanan) {
      this.$emit('send-message',layanan)
    }
  }
};
</script>
<style scoped>
.headline{
    text-align: center;
}
</style>