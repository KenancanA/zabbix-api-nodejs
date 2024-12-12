const axios = require("axios");
const fs = require("fs");

// Zabbix API bağlantı ayarları
const zabbixUrl = "";
const authToken = "";

// Tüm host ve grupları çekme fonksiyonu
async function fetchAllHostsAndGroups() {
  try {
    // Tüm hostları ve gruplarını çek
    const response = await axios.post(zabbixUrl, {
      jsonrpc: "2.0",
      method: "host.get",
      params: {
        selectGroups: "extend",
        output: ["hostid", "host", "name"],
      },
      id: 1,
      auth: authToken,
    });

    const hosts = response.data.result;

    // Host ve grup bilgilerini json dosyasına yaz
    const formattedData = hosts.map((host) => {
      return {
        HOSTNAME: host.host,
        HOSTID: host.hostid,
        GROUPS: host.groups.map((group) => ({
          groupid: group.groupid,
          name: group.name,
        })),
      };
    });

    fs.writeFileSync(
      "./hostget.json",
      JSON.stringify(formattedData, null, 2),
      "utf8"
    );
    console.log(
      `Tüm host ve grup bilgileri "hostget.json" dosyasına kaydedildi.`
    );
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
  await fetchAllHostsAndGroups();
})();
