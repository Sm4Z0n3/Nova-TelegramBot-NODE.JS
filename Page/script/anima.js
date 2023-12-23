  const boxes = document.querySelectorAll('.box, .box1');

  // 遍历每个 div 元素
  boxes.forEach(box => {
    // 添加鼠标经过事件监听器
    box.addEventListener('mouseover', (event) => {
      // 检查当前鼠标经过的元素是否是 <a> 标签
      if (event.target.tagName === 'A') {
        // 添加类名以应用动画效果
        event.target.classList.add('animate__animated', 'animate__headShake');

        // 在一定时间后移除动画类名，可根据需要调整时间
        setTimeout(() => {
          event.target.classList.remove('animate__animated', 'animate__headShake');
        }, 1000); // 在这里设置动画持续时间，单位是毫秒
      }
    });
  });

  async function postData(url, jsonData) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonData)
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok.');
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }
  