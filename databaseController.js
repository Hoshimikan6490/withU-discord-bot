const fs = require("fs");

// データベース検索用function。引数は(keyword: 検索キーワード, searchFromID: 検索キーワードに学校IDを使う場合はtrue)
function getDatabaseFromSchoolName(keyword) {
  let data = fs.readFileSync("./universityList.json");
  data = JSON.parse(data);

  if (keyword) {
    data = data.filter((result) => result["schoolName"].includes(keyword));
  }

  return data;
}
function getDatabaseFromSchoolID(schoolID) {
  let data = fs.readFileSync("./universityList.json");
  data = JSON.parse(data);

  if (schoolID) {
    data = data.filter((result) => result["schoolID"] == schoolID);
  }

  return data;
}

module.exports["getDatabaseFromSchoolName"] = getDatabaseFromSchoolName;
module.exports["getDatabaseFromSchoolID"] = getDatabaseFromSchoolID;
