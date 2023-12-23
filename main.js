const http = require('http');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const token = '6662950137:AAH2w1Fe58rEo3jtOYa_gPz4uZbf9mruYu0';

function getContentType(filePath) {
  const extname = filePath.split('.').pop().toLowerCase();
  switch (extname) {
    case 'html':
      return 'text/html';
    case 'css':
      return 'text/css';
    case 'js':
      return 'text/javascript';
    case 'png':
      return 'image/png';
    case 'svg':
      return 'image/svg+xml';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'bmp':
      return 'image/bmp';
    case 'ico':
      return 'image/x-icon';
    case 'txt':
      return 'text/plain';
    case 'ts':
      return 'text/typescript';
    case 'json':
      return 'application/json';
    default:
      return 'application/octet-stream';
  }
}

const bot = new TelegramBot(token, {
  polling: true,
  request: {
    proxy: 'http://127.0.0.1:7890',
  },
});

const server = http.createServer((req, res) => {
    let content = '';
  
    if (req.url === '/' || req.url === '/Home') {
      content = fs.readFileSync("./Page/home.html", 'utf8');
    } else if (req.url === '/Bots') {
      content = fs.readFileSync("./Page/bots.html", 'utf8');
    } else if (req.url === '/Messages') {
      content = fs.readFileSync("./Page/messages.html", 'utf8');
    } else if (req.url === '/Groups') {
      content = fs.readFileSync("./Page/groups.html", 'utf8');
    } else {
      let filePath = '.' + req.url;
  
      try {
        if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile()) {
          throw new Error('File not found');
        }
        const fileContent = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': getContentType(filePath) });
        res.end(fileContent);
        return;
      } catch (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 - Not Found');
        return;
      }
    }
  
    const mainContent = fs.readFileSync("./Page/main.html", 'utf8');
    const modifiedMainContent = mainContent.replace('{MAINAPP}', content);
  
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(modifiedMainContent);
  });
  

  
server.listen(8888, () => {
  console.log('Server running at http://localhost:8888/');
});

// 监听 Telegram 消息
bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  // 发送收到消息的回复
  bot.sendMessage(chatId, '已经收到消息.Node.JS');
});
