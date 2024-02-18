const path = require('path');
const fs = require('fs');
const koaStatic = require('koa-static');
const cors = require('@koa/cors');
const koaBody = require('koa-body'); // нужен для обработки тела запроса
const Koa = require('koa'); // импорт библиотеки (фреймворк сервера)
const { DataFiles } = require('./DataFiles');

const dataBase = new DataFiles();
dataBase.init();

const app = new Koa(); // создание нашего сервера

const publicImg = path.join(__dirname, '/public');
app.use(koaStatic(publicImg)); // Дает возможность раздавать файлы

app.use(koaBody({
  // чтобы обработать тело запроса (обязательно объявить до Middleware где работаем с body)
  urlencoded: true, // иначе тело будет undefined (тело будет строкой)
  multipart: true, // если тело запроса закодировано через FormData
}));

app.use(cors());

app.use((ctx, next) => {
  // Добавление новых файлов
  const { method } = ctx.request.query;
  if ((ctx.request.method !== 'POST') || (method !== 'addImages')) {
    next();
    return;
  }
  // console.log('files', ctx.request.files); // Получение списка файлов по имени поля FormData
  // file - имя поля input
  const { file } = ctx.request.files;
  const listImages = [];
  if (file.length > 1) {
    /* eslint-disable-next-line */
    for (const item of file) {
      const obj = dataBase.addImage(item);
      fs.copyFileSync(item.path, publicImg + obj.path);
      listImages.push(obj);
    }
  } else {
    const obj = dataBase.addImage(file);
    fs.copyFileSync(file.path, publicImg + obj.path);
    listImages.push(obj);
  }
  ctx.response.body = listImages;
  ctx.response.status = 201;
  next();
});

app.use((ctx, next) => {
  // Получение всех файлов
  const { method } = ctx.request.query;
  if ((ctx.request.method !== 'GET') || (method !== 'getImages')) {
    next();
    return;
  }
  ctx.response.body = dataBase.images;
  ctx.response.status = 200;
  next();
});

app.use((ctx, next) => {
  // Удаление файлов
  const { method, id } = ctx.request.query;
  if ((ctx.request.method !== 'POST') || (method !== 'removeImage')) {
    next();
    return;
  }
  const index = dataBase.images.findIndex((item) => item.id === id);
  const { name } = dataBase.images[index];
  const pathToFile = `./public${dataBase.images[index].path}`;
  dataBase.images.splice(index, 1);
  const newIndex = dataBase.images.findIndex((item) => item.name === name);
  if (newIndex === -1) {
    fs.unlinkSync(pathToFile);
  }
  dataBase.saveFile();
  ctx.response.body = 'ok';
  ctx.response.status = 204;
  next();
});

app.use((ctx) => {
  // DROP фото
  const { method } = ctx.request.query;
  if ((ctx.request.method !== 'POST') || (method !== 'dropImages')) {
    return;
  }
  const { file } = ctx.request.files;
  const listImages = [];
  if (file.length > 1) {
    /* eslint-disable-next-line */
    for (const item of file) {
      const obj = dataBase.addImage(item);
      fs.copyFileSync(item.path, publicImg + obj.path);
      listImages.push(obj);
    }
  } else {
    const obj = dataBase.addImage(file);
    fs.copyFileSync(file.path, publicImg + obj.path);
    listImages.push(obj);
  }
  ctx.response.body = listImages;
  ctx.response.status = 201;
});

app.listen('9000', (err) => {
  // два аргумента (1-й это порт, 2-й это callback по результатам запуска сервера)
  if (err) { // в callback может быть передана ошибка
    // (выводим её в консоль для примера, если она появится)
    console.log(err);
    return;
  }
  console.log('Server is listening to 9000');
});
