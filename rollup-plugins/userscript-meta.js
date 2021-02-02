const fs = require("fs");

export default (config = {}) => {
  let { path } = config;
  return {
    name: "configer",
    renderChunk: function (code) {
      return new Promise((resolve, reject) => {
        fs.readFile(path, (err, data) => {
          if (err) reject(err);
          else resolve(data.toString().trim() + "\n\n" + code);
        });
      });
    }
  };
};
