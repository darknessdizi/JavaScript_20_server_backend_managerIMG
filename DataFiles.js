const fs = require('fs');
const uuid = require('uuid');

class DataFiles {
  constructor() {
    this.images = [];
  }

  init() {
    // инициализация класса
    fs.stat('./public/dataBase.json', (err) => {
      if (err === null) {
        console.log('File dataBase.json exists');
      } else if (err.code === 'ENOENT') {
        // file does not exist
        fs.open('./public/dataBase.json', 'w', (error) => {
          if (error) throw error;
          console.log('File created');
        });
      } else {
        console.log('Some other error: ', err.code);
      }
    });

    fs.readFile('./public/dataBase.json', 'utf8', this.initFile.bind(this));
  }

  initFile(error, data) {
    // Callback - чтение файла со списком фотографий
    if (error) { // если возникла ошибка
      return console.log(error);
    }
    const json = JSON.parse(data);
    /* eslint-disable-next-line */
    for (const obj of json.images) {
      this.images.push(obj);
    }
    return null;
  }

  addImage(file) {
    // Добавлениие новой фотографии в базу данных
    const result = {
      id: uuid.v4(),
      name: file.name,
      path: `/${file.name}`,
    };
    this.images.push(result);
    this.saveFile();
    return result;
  }

  saveFile() {
    // Сохраняет изменения в файл
    const obj = { images: this.images };
    const file = JSON.stringify(obj, null, 2);
    fs.writeFileSync('./public/dataBase.json', file);
  }
}

module.exports = {
  DataFiles,
};
