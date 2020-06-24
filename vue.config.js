module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  "pluginOptions":{
    electronBuilder: {
      externals:['node-thermal-printer'],
      nodeIntegration: true
    }
  }
}