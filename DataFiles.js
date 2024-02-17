const fs = require('fs');
const uuid = require('uuid');

class DataFiles {
  constructor() {
    this.images = new Map();
  }

  init() {
    // fs.stat('dataBase.json', function(err, stat) {
    //   if (err === null) {
    //     console.log('File dataBase.json exists');
    //   } else if (err.code === 'ENOENT') { 
    //     // file does not exist
    //     fs.open('dataBase.json', 'w', (err) => {
    //       if (err) throw err;
    //       console.log('File created');
    //     });
    //   } else {
    //     console.log('Some other error: ', err.code);
    //   }
    // });

    // fs.readFile("dataBase.json", this.initFile.bind(this));
    const files = fs.readdirSync("public");
    files.forEach((file) => {
      if (file === '.getkeep') {
        return;
      }
      const id = uuid.v4();
      this.images[id] = {
        name: file,
        path: `/${file}`
      };
    }); 
  // }
  }

  // initFile(error, data) {
  //   if (error) { // если возникла ошибка
  //     return console.log(error);
  //   }
  //   const json = JSON.parse(data);
  //   for (const id of Object.keys(json.images)) {
  //     console.log('++++file', id)
  //     // this.images.set(id, json.images[id]);
  //     this.images[id] = json.images[id];
  //   }
  //   console.log(this.images)
  // }

  addImage(file) {
    const id = uuid.v4();
    const index = file.name.lastIndexOf('.');
    const expansion = file.name.slice(index);
    const newName = id + expansion;
    this.images[id] = {
      name: file.name,
      path: `/${newName}`
    };
    // this.saveFile();
    return {
      id: id,
      value: this.images[id] 
    };
  }

  // saveFile() {
  //   // const jsonText = JSON.stringify(Array.from(this.images.entries()));
  //   fs.writeFile("dataBase.json", this.images, function(error){
  //     if(error){ // если ошибка
  //     return console.log(error);
  //     }
  //     console.log("Файл успешно записан");
  //   });
  // }
}

module.exports = {
  DataFiles
};
