const http = require('http');
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const WebSocket = require('ws');
const axios = require('axios');

var token_;
var bot_;

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
function getCurrentDateTime() {
  const now = new Date();

  // 获取年、月、日
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // 月份从 0 开始，所以需要 +1，并确保两位数格式
  const day = String(now.getDate()).padStart(2, '0'); // 确保两位数格式

  // 获取小时、分钟
  const hours = String(now.getHours()).padStart(2, '0'); // 确保两位数格式
  const minutes = String(now.getMinutes()).padStart(2, '0'); // 确保两位数格式

  // 组合成 YYYY-MM-DD HH:mm 格式
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}`;

  return formattedDateTime;
}
var result_qun = "NONE";
const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const postData = JSON.parse(body);

      if ('type' in postData && postData['type'] === 'runtg' && 'token' in postData) {
        const { token } = postData;
        fs.writeFile('./Config/NOWBOT.dat', token, err => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('写入文件出错');
            return console.error('写入文件出错:', err);
          }
          res.writeHead(200, { 'Content-Type': 'text/plain' });
          res.end('已写入 NOWBOT.dat');
          console.log('已写入 NOWBOT.dat');
        });
      } else {
        if('type' in postData && postData['type'] === 'clearbot_'){
          fs.writeFileSync('./Config/NOWBOT.dat',"1")
        }else{
          if('type' in postData && postData['type'] === 'runtg_'&& 'token' in postData){
            RunBot(postData['token']);
          }else {
            if('type' in postData && postData['type'] === 'newbot'&& 'token' in postData&& 'name' in postData){
              fs.appendFileSync("./Config/Bots.txt","\n"+postData['name']+"|"+postData['token']+"|"+getCurrentDateTime())
            }else{
              if (postData && postData.type === 'get' && postData.url) {
                axios.get(postData.url)
                  .then(response => {
                    res.writeHead(200, { 'Content-Type': 'text/plain' });
                    res.end(response.data);
                  })
                  .catch(error => {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('请求出错');
                  });
              } else {
                if('type' in postData && postData['type'] === 'sendmsg'&& 'id' in postData&& 'text' in postData){
                  bot_.sendMessage(postData['id'],postData['text']);
                }else{
                  res.writeHead(400, { 'Content-Type': 'text/plain' });
                  res.end('无效的参数或参数类型');
                }
              }
            }
          }
        }

      }
    });
  }else{
    let content = '';
  
    if (req.url === '/' || req.url === '/Home') {
      content = fs.readFileSync("./Page/home.html", 'utf8');
    } else if (req.url === '/Bots') {
      content = fs.readFileSync("./Page/bots.html", 'utf8');
    } else if (req.url === '/Messages') {
      content = fs.readFileSync("./Page/messages.html", 'utf8');
    } else if (req.url === '/Contact') {
      if(fs.readFileSync("./Config/NOWBOT.dat").length > 18 && token_ != null){
        content = fs.readFileSync("./Page/contact.html", 'utf8').replace("{GROUPS}",result_qun);
      }else{
        content = "请先连接一个机器人.";
      }
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
  }

  });
const PORT = 8866;
server.listen(PORT, () => {console.log('Server running at http://localhost:' + PORT + '/');});
function RunBot(token){

  const bot = new TelegramBot(token, {
    polling: true,
    request: {
      proxy: 'http://127.0.0.1:7890',
    },
  });
  token_ = token;
  bot_ = bot;
  console.log("监听TelegramBot MSG "+token);
  let lastMessage = {
    userId: null,
    chatId: null,
    text: null
  };
  
  bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const nickname = msg.from.first_name + msg.from.last_name;
    const username = msg.from.username || "Unknown";
    const chatName = msg.chat.username;
    const chatNick = msg.chat.title;
    const msgText = msg.text;
    let logoLink = "";
    getGroupAvatarLink(chatId)
      .then(avatarLink => {
        logoLink = avatarLink;
        console.log(logoLink);
    
        if (msg.chat.type === 'private') {
          handlePrivateMessage(userId, nickname, username, logoLink);
        } else if (msg.chat.type === 'group' || msg.chat.type === 'supergroup') {
          handleGroupMessage(chatId, chatNick, chatName, logoLink);
        }
      })
      .catch(error => {
        console.error("Error:", error);
      });
    

    let result = "";

    if (lastMessage.userId === userId && lastMessage.chatId === chatId) {
      result = msgText + "<br>";
    } else {
      const chatName = msg.chat.chatName || "Unknown";
      const userName = msg.from.username || "Unknown";
      result = "<a href='http://t.me/"+userName+"/'>@"+userName+"</a>["+userId+"|"+chatId+"]:"+msgText+"<br>";
    }
    lastMessage = {
      userId: userId,
      chatId: chatId,
      text: msgText
    };
    fs.appendFileSync("./Config/Log.txt", result + "\n");
    bot.sendMessage(chatId, "Node.JS\n" + result);
  });


  function handlePrivateMessage(userId, nickname, username,logoLink) {
    console.log(logoLink);
    const contactPath = './Config/Contact.txt';
    let contactsData = fs.readFileSync(contactPath, 'utf8');

    if (!contactsData.includes(userId)) {
      const newData = `${userId}|${nickname}|${username}|${logoLink}\n`;
      console.log(newData);
      fs.appendFileSync(contactPath, newData);
      console.log(`User ${userId} added to contacts.`);
      // 在这里执行其他操作，比如提醒用户已添加
    }
}
  function handleGroupMessage(chatId, nickname, username,logoLink) {
    console.log(logoLink);
      const groupPath = './Config/Groups.txt';
      let groupsData = fs.readFileSync(groupPath, 'utf8');

      if (!groupsData.includes(chatId)) {
        const newData = `${chatId}|${nickname}|${username}|${logoLink}\n`;
        console.log(newData);
        fs.appendFileSync(groupPath, newData);
        console.log(`Group ${chatId} added to groups.`);
      }
  }
  function getGroupAvatarLink(chatId) {
    return new Promise((resolve, reject) => {
      bot.getChat(chatId)
        .then(chat => {
          if (chat.photo && chat.photo.big_file_id) {
            bot.getFile(chat.photo.big_file_id)
              .then(fileInfo => {
                const fileLink = `https://api.telegram.org/file/bot${token_}/${fileInfo.file_path}`;
                resolve(fileLink);
              })
              .catch(err => {
                reject("Error fetching group avatar file: " + err);
              });
          } else {
            reject("Group does not have a photo.");
          }
        })
        .catch(err => {
          reject("Error fetching group information: " + err);
        });
    });
  }
}