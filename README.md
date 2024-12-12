# Zabbix Host and Group Management Automation

This project provides a solution that automates the processing of host and item data on Zabbix, parsing it in JSON format and assigning it to host groups according to certain criteria.

## 🚀 Features

- **Host Item Data Extraction**: It takes certain item data from Zabbix and organises it in JSON format.
- **Host Grouping**: Groups the hosts according to the desired properties according to the captured data.
- **Automatic Group Creation**: If a specific group does not exist, it creates a new group in Zabbix and assigns hosts to this group.
- **Working on JSON File**: The organisation of host and group information is controlled by a JSON file.
- **Pulling All Hosts and Groups**: Includes a tool to backup all host and group information on Zabbix.

## 📁 File Structure

- `allHostGet.js`: It stores host data retrieved from Zabbix in JSON format.
- `itemHostGet.js`: It stores host and item data retrieved from Zabbix in JSON format.
- `groupsGet.js`: It stores host and groups data retrieved from Zabbix in JSON format.
- `specificHostGet.js`: It stores a single host data pulled from Zabbix in JSON format.
- `specificHostPost.js`: It assigns groups to a single desired host in Zabbix.
- `autoHostPost.js`: The data retrieved with itemHostGet is read and edited from the JSON file and loaded into Zabbix.
  

## 🛠️ Requirements

- Node.js (v14+)
- Zabbix API access information (URL ve token)
- Axios (Node.js library)

## 🔧Installation and Use

1. **Clone or Download This Project**:
   ```bash
   git clone https://github.com/KenancanA/zabbix-api-nodejs.git
   cd zabbix-api-nodejs
2. **Install The Required Dependencies**
   ```bash
   npm install
3. **Zabbix URL ve Token**
   ```bash
    const zabbixUrl = "";
    const authToken = "";
5. **Running the Code (All js files work separately.)**
   ```bash
   node allHostGet.js
   node itemHostGet.js
