const axios = require("axios");
const fs = require("fs"); // Dosya yazma işlemi için gerekli

// Zabbix API bağlantı ayarları
const zabbixUrl = "";
const authToken = "";

// Sonuçları tutmak için bir liste
const resultList = [];

// Hostları getirme fonksiyonu
async function getHosts() {
  try {
    const response = await axios.post(zabbixUrl, {
      jsonrpc: "2.0",
      method: "host.get",
      params: {
        output: ["hostid", "host"],
      },
      id: 1,
      auth: authToken,
    });

    const hosts = response.data.result;

    // Her host için itemları getir
    for (const host of hosts) {
      await getItemsForHost(host);
    }

    return resultList;
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

// Belirli bir host için itemları getirme fonksiyonu
async function getItemsForHost(host) {
  try {
    const response = await axios.post(zabbixUrl, {
      jsonrpc: "2.0",
      method: "item.get",
      params: {
        output: ["itemid", "name", "lastvalue"],
        hostids: host.hostid,
      },
      id: 2,
      auth: authToken,
    });

    const items = response.data.result;

    items.forEach((item) => {
      // Sadece "Windows: System description" ismini kontrol et
      if (item.name && item.name.includes("Windows: System description")) {
        const match = item.lastvalue.match(/Windows Server \d{4}/); // Sadece Windows Server formatını al
        if (match && match[0]) {
          // Listeye key-value formatında ekle
          resultList.push({
            HOSTNAME: host.host,
            SERVER: match[0],
          });
        }
      }
    });
  } catch (error) {
    if (error.response) {
      console.error(
        `Host ${host.host} için item API Hatası:`,
        error.response.data
      );
    } else if (error.request) {
      console.error(
        `Host ${host.host} için sunucu yanıt vermedi:`,
        error.request
      );
    } else {
      console.error(`Host ${host.host} için Axios Hatası:`, error.message);
    }
  }
}

// JSON olarak dışa aktarma fonksiyonu
function exportToJSON(data, fileName) {
  fs.writeFileSync(fileName, JSON.stringify(data, null, 2), "utf8");
  console.log(`Sonuçlar JSON formatında "${fileName}" dosyasına yazıldı.`);
}

(async function () {
  const data = await getHosts();
  exportToJSON(data, "itemHostGet.json");
})();
