const fs = require("fs");

// データベース検索用function。引数は(keyword: 検索キーワード, searchFromID: 検索キーワードに学校IDを使う場合はtrue, onlyUsed: 「onlyUsed」フラグがtrueのやつだけ抽出)
function getDatabaseFromSchoolName(keyword, onlyUsed) {
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
function getDatabaseFromSchoolID(schoolID, onlyUsed) {
  let data = fs.readFileSync("./universityList.json");
  data = JSON.parse(data);

  if (schoolID) {
    data = data.filter((result) => result["schoolID"] == schoolID);
  }

  if (onlyUsed) {
    data = data.filter((result) => result["used"] == true);
  }

  return data;
}

function setUsedStatus(schoolID, setTo) {
  let data = getDatabaseFromSchoolID();

  let error = false;
  data.forEach((key) => {
    if (schoolID) {
      if (key.schoolID == schoolID) {
        key.used = setTo;
      }
    } else {
      console.error(
        "[DatabaseController setUsedStatus Error]: 必ず学校IDを指定してください！"
      );
      error = true;
    }
  });

  if (!error) {
    fs.writeFileSync("./universityList.json", JSON.stringify(data));
    return data;
  } else {
    return null;
  }
}

module.exports["getDatabaseFromSchoolName"] = getDatabaseFromSchoolName;
module.exports["getDatabaseFromSchoolID"] = getDatabaseFromSchoolID;
module.exports["setUsedStatus"] = setUsedStatus;
