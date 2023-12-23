
getData();
function getData() {
  fetch('../Config/Bots.txt')
    .then(response => response.text())
    .then(data => {
      const lines = data.split('\n');

      const list = document.querySelector('#tokens');
      list.innerHTML = "";

      for (const line of lines) {
        const dataArray = line.split('|');
        const listItem = document.createElement('li');
        
        for (const item of dataArray) {
          const itemText = document.createElement('span');
          itemText.textContent = item.trim();
          listItem.appendChild(itemText);
        }

        const InfoButton = document.createElement('button');
        InfoButton.textContent = 'Info';
        InfoButton.id = dataArray[0];
        InfoButton.addEventListener('click', function() {
          ShowInfo(this);
        });

        const RemoveButton = document.createElement('button');
        RemoveButton.textContent = 'Remove';
        RemoveButton.id = dataArray[0];
        RemoveButton.addEventListener('click', function() {
          RemoveInfo(this);
        });

        const buttonDiv = document.createElement('div');
        buttonDiv.style.margin = '10px 0';
        buttonDiv.appendChild(InfoButton);
        buttonDiv.appendChild(RemoveButton);
        listItem.appendChild(buttonDiv);

        list.appendChild(listItem);
      }
    })
    .catch(error => console.error('Error fetching data:', error));
}

var token1 = "";
function ShowInfo(btn) {
    const row = btn.closest('tr');
    const tds = row.querySelectorAll('td');
    const infoWindow = document.querySelector('.info-window');
    infoWindow.className = 'info-window';

    infoWindow.classList.add('animate__animated', 'animate__fadeInDown');

    const botName = tds[0].textContent;
    const token = tds[1].textContent;
    token1 = token;
    const time = tds[2].textContent;
    console.log('<p style="font-size:20px;">'+'Bot Name:'+botName+"\n"+'Token:'+token+"\n"+'Time:'+time+"\n"+'</p>');
    var p_t = document.getElementById("TEXT");
    p_t.innerHTML = innerHtml = '<p style="font-size:20px;word-wrap: break-word;"><br><br><br>Bot Name:'+botName+'<br><br>Token:'+token+'<br><br>Time:'+time+'<br></p>';
      
    document.getElementById('infoWindow').style.display = 'block';
  }
  
  function CloseInfo() {
    const infoWindow = document.querySelector('.info-window');
    infoWindow.classList.remove('animate__fadeInDown');
    infoWindow.classList.add('animate__flipOutX');
  }
  
  function jump_(){
    fetch(window.location, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'runtg',
        token: token1,
      }),
    })
      .then(response => {
        // 处理响应
        console.log('Request sent');
      })
      .catch(error => console.error('Error:', error));
    
  }
  function addbot(){
    Swal.fire({
      title: '填写Bot信息',
      html:
        `<input id="botname" class="swal2-input" placeholder="Bot Name" pattern="[a-zA-Z0-9_.-]+" required>
         <input id="token" class="swal2-input" placeholder="Token" required>`,
      focusConfirm: false,
      preConfirm: () => {
        const botName = Swal.getPopup().querySelector('#botname').value;
        const token = Swal.getPopup().querySelector('#token').value;

        if (!botName || !token) {
          Swal.showValidationMessage('Bot Name和Token为必填项');
        } else {
          const data = {
            type: 'newbot',
            name: botName,
            token: token
          };

          // 发送 POST 请求
          fetch(window.location, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          })
          .then(response => {
            console.log('请求已发送');
          })
          .catch(error => {
            console.error('发生错误:', error);
          });

        }
      }
    });
  }