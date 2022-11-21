const fse = require("fs-extra");

const { dbPoolPromise } = require("../databaseMiddleware/mySqlConnection");

module.exports.add = (req, res) => {
  const fileList = req.files;
  res.send(fileList);
  fileList.forEach(async (file) => {
    const [saveImage] = await dbPoolPromise.execute(
      "INSERT INTO images (id, name, source) VALUES (?, ?, ?)",
      [file.filename, file.originalname, file.path]
    );
  });
};

module.exports.delete = async (req, res) => {
  const imgUrl = req.body.url;
  const newUrl = JSON.stringify(`./${imgUrl.replace(/\\/g, "/")}`);
  fse.remove(imgUrl, (err) => {
    if (err) return console.log(err);
  });
  const [delImg] = await dbPoolPromise.execute(
    "DELETE FROM images WHERE source = ?",
    [imgUrl]
  );
};

module.exports.loadList = async (req, res) => {
  const [imageList] = await dbPoolPromise.execute("SELECT * FROM images");
  res.send(imageList);
};
