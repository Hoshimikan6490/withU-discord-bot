const fs = require("fs");

function getData(keyword, onlyUsed) {
  let data = fs.readFileSync("./universityList.json");
  data = JSON.parse(data);

  if (keyword) {
    data = data.filter((result) => result["schoolName"].includes(keyword));
  }

  if (onlyUsed) {
    data = data.filter((result) => result["used"] == true);
  }

  return data;
}

function setUsedStatus(schoolID, setTo) {
  let data = getData();

  data.forEach((key) => {
    if (schoolID) {
      if (key.schoolID == schoolID) {
        key.used = setTo;
      }
    } else {
      key.used = setTo;
    }
  });

  fs.writeFileSync("./universityList.json", JSON.stringify(data));

  return data;
}

module.exports["getDatabase"] = getData;
module.exports["setUsedStatus"] = setUsedStatus;
