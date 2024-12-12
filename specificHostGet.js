const axios = require("axios");
const fs = require("fs"); // Dosya yazma işlemi için gerekli

// Zabbix API bağlantı ayarları
const zabbixUrl = "";
const authToken = "";

// Belirli bir host için groups bilgilerini al
async function getGroupsForSpecificHost(hostname) {
  try {
    // Belirli host'u getir
    const hostResponse = await axios.post(zabbixUrl, {
      jsonrpc: "2.0",
      method: "host.get",
      params: {
        filter: { host: hostname },
        selectGroups: "extend",
        output: ["hostid", "host"],
      },
      id: 1,
      auth: authToken,
    });

    const hosts = hostResponse.data.result;
    if (hosts.length === 0) {
      console.log(`Belirtilen host bulunamadı: ${hostname}`);
      return [];
    }

    const host = hosts[0];
    console.log(`Host bulundu: ${host.host} (ID: ${host.hostid})`);

    // Groups bilgilerini döndür
    const resultList = host.groups.map((group) => ({
      GROUPID: group.groupid,
      GROUPNAME: group.name,
    }));

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

// JSON olarak dışa aktarma fonksiyonu
function exportToJSON(data, fileName) {
  fs.writeFileSync(fileName, JSON.stringify(data, null, 2), "utf8");
  console.log(`Sonuçlar JSON formatında "${fileName}" dosyasına yazıldı.`);
}

// Belirli bir host için işlemi başlat
(async function () {
  const hostname = ""; // Belirli host adı
  const resultList = await getGroupsForSpecificHost(hostname);

  if (resultList && resultList.length > 0) {
    exportToJSON(resultList, "./specific_host_groups.json");
  } else {
    console.log(
      "Belirtilen host için uygun group bulunamadı veya host erişilemedi."
    );
  }
})();
