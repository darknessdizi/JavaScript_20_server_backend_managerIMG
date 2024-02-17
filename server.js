const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const koaStatic = require('koa-static');
const { DataFiles } = require('./DataFiles');

const dataBase = new DataFiles();
dataBase.init();
console.log(dataBase);

const Koa = require('koa'); // импорт библиотеки (фреймворк сервера)
const app = new Koa(); // создание нашего сервера

const public = path.join(__dirname, '/public');
app.use(koaStatic(public)); // Дает возможность раздавать файлы

const koaBody = require('koa-body'); // нужен для обработки тела запроса
app.use(koaBody({ // чтобы обработать тело запроса (обязательно объявить до Middleware где работаем с body)
  urlencoded: true, // иначе тело будет undefined (тело будет строкой)
  multipart: true, // если тело запроса закодировано через FormData
}));

const cors = require('@koa/cors');
app.use(cors());

app.use((ctx, next) => {
  // Добавление новых файлов
  const { method } = ctx.request.query;
  if ((ctx.request.method !== 'POST') || (method !== 'addImages')) {
    next();
    return;
  }
  // console.log('ctx.request.files', ctx.request.files); // Получение списка файлов по имени поля FormData
  // file - имя поля input
  const { file } = ctx.request.files;
  const public = path.join(__dirname, '/public');
  let listImages = {};
  if (file.length > 1) {
    for (const item of file) {
      const obj = dataBase.addImage(item);
      fs.copyFileSync(item.path, public + obj.value.path);
      listImages[obj.id] = obj.value;
    }
  } else {
    const obj = dataBase.addImage(file);
    fs.copyFileSync(file.path, public + obj.value.path);
    listImages[obj.id] = obj.value;
  }
  console.log('добавлен ------------', dataBase);
  ctx.response.body = listImages;
  ctx.response.status = 202;
  next();
});

app.use((ctx, next) => {
  // Получение всех файлов
  const { method } = ctx.request.query;
  if ((ctx.request.method !== 'GET') || (method !== 'getImages')) {
    next();
    return;
  }
  console.log('dataBase.images', dataBase.images)
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
  const path = './public' + dataBase.images[id].path;
  fs.unlinkSync(path);
  delete dataBase.images[id];
  ctx.response.body = 'ok';
  ctx.response.status = 200;
  next();
});

app.use((ctx) => {
  // DROP фото 
  const { method } = ctx.request.query;
  if ((ctx.request.method !== 'POST') || (method !== 'dropImages')) {
    return;
  }
  const { file } = ctx.request.files;
  const public = path.join(__dirname, '/public');
  const listImages = {};
  if (file.length > 1) {
    for (const item of file) {
      const obj = dataBase.addImage(item);
      fs.copyFileSync(item.path, public + obj.value.path);
      listImages[obj.id] = obj.value;
    }
  } else {
    const obj = dataBase.addImage(file);
    fs.copyFileSync(file.path, public + obj.value.path);
    listImages[obj.id] = obj.value;
  }
  console.log('добавлен ------------', dataBase);
  ctx.response.body = listImages;
  ctx.response.status = 202; 
});

app.listen('9000', (err) => { // два аргумента (1-й это порт, 2-й это callback по результатам запуска сервера)
  if(err) { // в callback может быть передана ошибка (выводим её в консоль для примера, если она появится)
    console.log(err);
    return;
  }
  console.log('Server is listening to ' + '9000');
});
