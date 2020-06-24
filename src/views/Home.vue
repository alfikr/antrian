<template>
  <v-container>
    <div style="height:100%">
      <v-col>
        <v-card height="800" data-app>
          <v-row dense>
            <v-col cols="4" v-for="item in items" :key="item.id">
              <layanan
                class="infoc"
                v-bind:layanan="item"
                v-on:click="openDialog(item)"
                @send-message="openDialog"
              ></layanan>
            </v-col>
          </v-row>
          <v-dialog
            v-model="dialog"
            persistent
            hide-overlay
            max-width="800px"
            transition="dialog-bottom-transition"
            @click:outside="handleDialog"
          >
            <v-card>
              <v-toolbar dense>
                <v-toolbar-title>{{itemSelected.namaLayanan}}</v-toolbar-title>
              </v-toolbar>
              <v-card-text>
                <v-list dense>
                  <v-list-item v-for="(item,i) in itemSelected.Syarat" :key="i">
                    <v-list-item-content>{{item}}</v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-dialog>
        </v-card>
        <v-card height="200">
          <v-row align="center">
            <v-col class="text-center" cols="12" sm="12">
              <div class="my-2">
                <v-btn color="success" x-large dark @click="cetakNomor()">
                  <span>Ambil Antrian</span>
                  <v-icon>fa fa-print</v-icon>
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </div>
  </v-container>
</template>

<script>
import Layanan from "../components/LayananButton";
import store from "../config/firebaseFirestore";
import database from "../config/firebasedatabase";
import auth from "../config/firebaseAuth";
const ThermalPrinter = require("node-thermal-printer").printer;
const Types = require("node-thermal-printer").types;
export default {
  name: "Home",
  components: {
    Layanan
  },
  data() {
    return {
      items: [],
      dialog: false,
      itemSelected: {},
      downInner: false,
      printer: null,
      isConnected: false,
      lastCall: 0,
      lastName: ""
    };
  },
  watch: {
    dialog() {
      this.downInner = false;
    }
  },
  async beforeMount() {
    this.printer = new ThermalPrinter({
      type: Types.EPSON, // 'star' or 'epson'
      interface: "com1",
      options: {
        timeout: 1000
      },
      width: 48, // Number of characters in one line - default: 48
      characterSet: "SLOVENIA", // Character set - default: SLOVENIA
      removeSpecialCharacters: false, // Removes special characters - default: false
      lineCharacter: "-" // Use custom character for drawing lines - default: -
    });
    this.reauth();
  },
  mounted() {
    this.getDataPelayanan();
    this.getAntrianAkhir();
  },
  methods: {
    reauth() {
      auth
        .signInWithEmailAndPassword("kec.bergas@gmail.com", "bergas1234")
        .catch(a => {
          console.error(a);
        });
    },
    getDataPelayanan() {
      let data = store.collection("pelayanan");
      this.items = [];
      data.get().then(d => {
        d.forEach(doc => {
          let da = doc.data();
          this.items.push({
            id: doc.id,
            namaLayanan: da.namaPelayanan,
            description: da.keterangan,
            Syarat: da.syarat
          });
        });
      });
    },
    getAntrianAkhir(){
      database.ref("antrian/calling").once("value", x => {
        if (x.exists) {
          this.playAudio(x.val());
        }
      });
      // database.ref("antrian/lastCall").on("value", sn => {
      //   if (sn.val === this.lastCall) {
      //     return;
      //   }
      //   database.ref("antrian/calling").once("value",x=>{
      //     if(x.exists){
      //       this.playAudio(x.val())
      //     }
      //   })
      // });
    },
    playAudio(q) {
      var audio = new Audio(
        "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=id&q=" +
          q.split(" ").join("+")
      );
      audio.play();
    },
    setMouseDown() {
      this.downInner = true;
    },
    handleDialog() {
      if (this.downInner === false) {
        this.dialog = false;
      }
      this.downInner = false;
    },
    openDialog(item) {
      this.itemSelected = item;
      this.dialog = true;
    },
    cetakNomor() {
      let las = 0;
      database
        .ref("antrian/lastNumb")
        .once("value")
        .then(sn => {
          las = sn.val() + 1;
          let upd = {
            lastNumb: las
          };
          database
            .ref("antrian")
            .update(upd)
            .then(() => {
              this.printPaper(parseInt(las));
            });
        });
    },
    async printPaper(a) {
      console.log("printPaper! start");
      if (this.printer === null) {
        console.log("error printer null");
        return;
      }
      this.isConnected = await this.printer.isPrinterConnected();
      console.log("Printer connected:", this.isConnected);
      if (!this.isConnected) {
        console.log("printer not connected");
        return;
      }
      let printer = this.printer;
      printer.alignCenter();
      printer.setTypeFontA();
      printer.bold();
      printer.setTextQuadArea();
      printer.println("Kantor Kecamatan Bergas");
      printer.setTypeFontB();
      printer.setTextNormal();
      printer.println("Jl. Soekarno Hatta No 68 Telp. (0298) 523024");
      printer.println("Bergas 50552");
      printer.drawLine();
      printer.setTypeFontA();
      printer.println("Antrian Nomor");
      printer.newLine();
      printer.bold();
      printer.setTextSize(7, 7);
      printer.setTextQuadArea();
      printer.println(a);
      printer.newLine();
      printer.setTextNormal();
      printer.println("24-07-2020");
      printer.newLine();
      printer.println("Mohon untuk menunggu");
      printer.println("hingga nomor anda dipanggil");
      printer.cut();
      try {
        await printer.execute();
        console.log("Print success.");
      } catch (error) {
        console.error("Print error:", error);
      }
    }
  }
};
</script>
<style>
.informasi {
  height: 90vh;
  overflow: hidden;
}
.infoc {
  margin-left: 20px;
  margin-right: 20px;
  margin-top: 20px;
}
</style>
// let printer = new ThermalPrinter({
//     type: Types.EPSON,  // 'star' or 'epson'
//     interface: "/dev/usb/lp0",
//     options: {
//       timeout: 1000
//     },
//     width: 48,                         // Number of characters in one line - default: 48
//     characterSet: 'SLOVENIA',          // Character set - default: SLOVENIA
//     removeSpecialCharacters: false,    // Removes special characters - default: false
//     lineCharacter: "-",                // Use custom character for drawing lines - default: -
//   });

//   let isConnected = await printer.isPrinterConnected();
//   console.log("Printer connected:", isConnected);
//   if(!isConnected){
//     return
//   }
//   printer.alignCenter();
//   printer.setTypeFontA();
//   printer.bold();
//   printer.setTextQuadArea();
//   printer.println("Kantor Kecamatan Bergas");
//   printer.setTypeFontB();
//   printer.setTextNormal();
//   printer.println("Jl. Soekarno Hatta No 68 Telp. (0298) 523024")
//   printer.println("Bergas 50552")
//   printer.drawLine();
//   printer.setTypeFontA();
//   if(coba){
//     printer.println("Percobaan cetak")
//   }else{
//     printer.println("Antrian Nomor")
//   }
//   printer.newLine();
//   printer.bold()
//   printer.setTextSize(7,7)
//   printer.setTextQuadArea();
//   printer.println(antrian)
//   printer.newLine();
//   printer.setTextNormal();
//   printer.println("24-07-2020")
//   printer.newLine();
//   if(coba){
//     printer.println("Printing berhasil")
//   }else{
//     printer.println("Mohon untuk menunggu");
//     printer.println("hingga nomor anda dipanggil")
//   }
//   printer.cut();
//   try {
//     await printer.execute();
//     console.log("Print success.");
//   } catch (error) {
//     console.error("Print error:", error);
//   }