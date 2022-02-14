const axios = require("axios");
const fs = require("fs");
const logapiPort = "8578"

function logStats() {
  async function makeGetRequest() {
    let res = await axios.get(
      "https://tontine-stats.s3.us-east-1.amazonaws.com/random.json"
    );
    RandomDataUnchecked = res.data.items;
    global.RandomData = [...new Set(RandomDataUnchecked)]
    let checkedNames = [];
    var dupeNames = 0;
    var updatedNames = 0;
    var fakeAccs = 0;

    var nameArrayUnchecked = fs.readFileSync("log.txt").toString().split("\n");
    nameArrayUnchecked.pop();
    var nameArray = [...new Set(nameArrayUnchecked)]
    var numLogged = nameArray.length

    for (let i = 0; i < global.RandomData.length; i++) {
      var lastPress = global.RandomData[i].lastPress.toString();
      var name = global.RandomData[i].name.toString();
      var avatar = global.RandomData[i].type.toString();
      var color = global.RandomData[i].color.toString();
      var grave = global.RandomData[i].graveType.toString();
      var unixTime = Math.floor(+new Date())
      global.RandomData[i].ts = unixTime
      var userJSON = global.RandomData[i]
      
      checkedNames.push(JSON.stringify(userJSON));

      if (nameArray.length > 0) {
        for (let j = 0; j < nameArray.length; j++) {
          var existingNames = JSON.parse(nameArray[j]).name.toString();
          var existingAvatar = JSON.parse(nameArray[j]).type.toString();
          var existingColor = JSON.parse(nameArray[j]).color.toString();
          var existingGrave = JSON.parse(nameArray[j]).graveType.toString();
          var existingLastPress = JSON.parse(nameArray[j]).lastPress.toString();

          if (name === existingNames) {
            if (avatar === existingAvatar && color === existingColor && grave === existingGrave) {
              dupeNames += 1;
              if (lastPress != existingLastPress) { updatedNames += 1 }
              nameArray[j] = (JSON.stringify(userJSON))
              checkedNames.pop();
            } // avatar, color, grave == existing avatar, color, grave
          } // name === existing name
        } // j for loop
      } // if length > 0
    } // i for loop

    // writing new data to file
    var combo = []
    for (let i = 0; i < nameArray.length; i++) { combo.push(nameArray[i]) }
    for (let i = 0; i < checkedNames.length; i++) { combo.push(checkedNames[i]) }
    combo = [...new Set(combo)]
    var comboPrep = ''
    for (let i = 0; i < combo.length; i++) { comboPrep += (combo[i] + "\n"); }
    fs.writeFileSync('log.txt', comboPrep)

    // saving data
    var newAccLogged = combo.length - numLogged
    var texttolog = `logged data at ${Date()} with the first user being: ${global.RandomData[0].name.toString()}\n# of duplicate names: ${dupeNames}\n# of updated accounts: ${updatedNames}\n# of new accounts logged: ${newAccLogged}\n# of total accounts logged: ${combo.length}\n# of accounts to be logged: ${7141 - combo.length}`
    console.log(texttolog);
    fs.appendFileSync("logs.txt", `${texttolog}\n--------------------------\n`);

    // making tplf file
    var tplfWrite = ''
    for (let i = 0; i < combo.length; i++) {
      var account = JSON.parse(combo[i])
      tplfWrite += `${account.name}#S#${account.color}#S#${account.type}#S#${account.graveType}#S#${account.lastPress}#S#${account.ts}#NLN#`
    }
    fs.writeFileSync('log.tplf', tplfWrite.toString())
  }
  makeGetRequest()
}

logStats();
setInterval(logStats, 180000);

/*
tontine tplf s params
0: name
1: color
2: account type
3: grave type
4: unix time last pressed
5: unix time of last data update
*/

// log api
var http = require('http');
http.createServer(function (req, res) {
  if (req.url == '/logs') {
    var logs = fs.readFileSync('logs.txt').toString()
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(logs);
  } else if (req.url) {
    var log = fs.readFileSync('log.tplf').toString()
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(log);
  }
}).listen(logapiPort);