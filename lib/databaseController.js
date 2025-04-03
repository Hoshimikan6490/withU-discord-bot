// for using sentry
require("../lib/instrument");
const fs = require("fs");
const Sentry = require("@sentry/node");

// データベース検索用function。引数は(keyword: 検索キーワード, searchFromID: 検索キーワードに学校IDを使う場合はtrue)
function getDatabaseFromSchoolName(keyword) {
  try {
    let data = fs.readFileSync("./universityList.json");
    data = JSON.parse(data);

    if (keyword) {
      data = data.filter((result) => result["schoolName"].includes(keyword));
    }

    return data;
  } catch (err) {
    Sentry.captureException(err);
  }
}

function getDatabaseFromSchoolID(schoolID) {
  try {
    let data = fs.readFileSync("./universityList.json");
    data = JSON.parse(data);

    if (schoolID) {
      data = data.filter((result) => result["schoolID"] == schoolID);
    }

    return data;
  } catch (err) {
    Sentry.captureException(err);
  }
}

module.exports["getDatabaseFromSchoolName"] = getDatabaseFromSchoolName;
module.exports["getDatabaseFromSchoolID"] = getDatabaseFromSchoolID;
