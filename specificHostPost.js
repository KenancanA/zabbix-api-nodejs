const axios = require("axios");

// Zabbix API bağlantı ayarları
const zabbixUrl = "";
const authToken = "";

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
        groups: updatedGroups,
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

// İşlemi başlat
(async function () {
  const hostname = ""; // Belirli host adı
  const groupName = ""; // Eklemek istediğiniz grup ismi
  await ensureGroupAndAddToHost(hostname, groupName);
})();
