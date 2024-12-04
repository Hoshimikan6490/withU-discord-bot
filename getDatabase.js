const fs = require("fs");

function getData(filter) {
  let data = fs.readFileSync("./universityList.json");
  data = JSON.parse(data);

  if (filter) {
    data = data.filter((result) => result["schoolName"].includes(filter));
  }

  return data;
}

module.exports = getData;
