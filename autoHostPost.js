const axios = require("axios");
const fs = require("fs");

// Zabbix API bağlantı ayarları
const zabbixUrl = "";
const authToken = ""; // Buraya doğrudan tokeninizi ekleyin

// JSON dosyasını yükleme
const jsonData = JSON.parse(fs.readFileSync("./output.json", "utf8"));

// Grup oluştur veya mevcut grup ID'sini al ve host'a ekle
async function ensureGroupAndAddToHost(hostname, groupName) {
  try {
    const groupCheckResponse = await axios.post(zabbixUrl, {
      jsonrpc: "2.0",
      method: "hostgroup.get",
      params: {
        filter: { name: groupName },
        output: ["groupid"],
      },
      id: 1,
      auth: authToken,
    });

    let groupid;

    if (groupCheckResponse.data.result.length > 0) {
      // Grup zaten mevcut
      groupid = groupCheckResponse.data.result[0].groupid;
      console.log(`Grup zaten mevcut: ${groupName} (ID: ${groupid})`);
    } else {
      // Yeni grup oluştur
      const createGroupResponse = await axios.post(zabbixUrl, {
        jsonrpc: "2.0",
        method: "hostgroup.create",
        params: {
          name: groupName,
        },
        id: 2,
        auth: authToken,
      });

      if (
        !createGroupResponse.data.result ||
        !createGroupResponse.data.result.groupids
      ) {
        console.error(
          `Grup oluşturulamadı veya API beklenen sonucu döndürmedi:`,
          createGroupResponse.data
        );
        return;
      }

      groupid = createGroupResponse.data.result.groupids[0];
      console.log(`Yeni grup oluşturuldu: ${groupName} (ID: ${groupid})`);
    }

    // Belirli host'u getir
    const hostResponse = await axios.post(zabbixUrl, {
      jsonrpc: "2.0",
      method: "host.get",
      params: {
        filter: { host: hostname },
        selectGroups: "extend",
        output: ["hostid", "groups"],
      },
      id: 3,
      auth: authToken,
    });

    const hosts = hostResponse.data.result;
    if (hosts.length === 0) {
      console.log(`Belirtilen host bulunamadı: ${hostname}`);
      return;
    }

    const host = hosts[0];
    console.log(`Host bulundu: ${host.host} (ID: ${host.hostid})`);

    // Mevcut grupları kontrol et ve yeni grubu ekle
    const existingGroups = host.groups
      ? host.groups.map((group) => ({ groupid: group.groupid }))
      : [];
    const isGroupAlreadyAdded = existingGroups.some(
      (group) => group.groupid === groupid
    );

    if (isGroupAlreadyAdded) {
      console.log(
        `Grup zaten bu host için atanmış: ${groupName} (ID: ${groupid})`
      );
      return;
    }

    const updatedGroups = [...existingGroups, { groupid }];

    // Host'a yeni grup ekleme
    const updateResponse = await axios.post(zabbixUrl, {
      jsonrpc: "2.0",
      method: "host.update",
      params: {
        hostid: host.hostid,
        groups: updatedGroups, // Mevcut gruplar + yeni grup
      },
      id: 4,
      auth: authToken,
    });

    console.log(
      `Yeni grup host'a başarıyla eklendi! Güncellenmiş gruplar:`,
      updatedGroups
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

// Tüm host ve grupları işleme
(async function () {
  for (const entry of jsonData) {
    const { HOSTNAME, SERVER } = entry;
    console.log(`\nİşleniyor: Hostname=${HOSTNAME}, Group=${SERVER}`);
    await ensureGroupAndAddToHost(HOSTNAME, SERVER);
  }
})();
