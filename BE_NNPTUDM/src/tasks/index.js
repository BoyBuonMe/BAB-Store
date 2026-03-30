// require("module-alias/register");
const fs = require("fs");

const basePath = "./src/tasks";
const postFix = ".task.js";

const entries = fs
  .readdirSync(basePath)
  .filter((fileName) => fileName.endsWith(postFix));

const tasksMap = entries.reduce((obj, fileName) => {
  return {
    ...obj,
    [fileName.replace(postFix, "")]: require(`./${fileName}`),
  };
}, {});

module.exports = tasksMap;
