const axios = require("axios");
const fs = require("fs"); // Dosya yazma işlemi için gerekli

// Zabbix API bağlantı ayarları
const zabbixUrl = "";
const authToken = "";

// Tüm grupları getirme fonksiyonu
async function getHostGroups() {
  try {
    const response = await axios.post(zabbixUrl, {
      jsonrpc: "2.0",
      method: "hostgroup.get",
      params: {
        output: ["groupid", "name"],
      },
      id: 1,
      auth: authToken,
    });

    const groups = response.data.result;

    // Grupları konsola yazdır
    console.log("Mevcut Gruplar:");
    groups.forEach((group) => {
      console.log(`Group ID: ${group.groupid}, Name: ${group.name}`);
    });

    // JSON dosyasına yaz
    fs.writeFileSync("./groups.json", JSON.stringify(groups, null, 2), "utf8");
    console.log('Gruplar "groups.json" dosyasına yazıldı.');
  } catch (error) {
    if (error.response) {
      console.error("API Hatası:", error.response.data);
    } else if (error.request) {
      console.error("Sunucu yanıt vermedi:", error.request);
    } else {
      console.error("Axios Hatası:", error.message);
    }
  }
}

// Fonksiyonu çalıştır
(async function () {
  await getHostGroups();
})();
