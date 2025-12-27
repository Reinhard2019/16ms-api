import { Element } from 'antd-solid';
import { type Component } from 'solid-js';
import ConfigProvider from 'src/components/ConfigProvider';

const Index: Component = () => {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        'flex-direction': 'column',
        'justify-content': 'center',
        'align-items': 'center',
        'font-size': '28px'
      }}
    >
      <div>您好！我们的服务已搬到新家啦～</div>
      <div>
        请访问新网站：
        <a href="https://16ms.ai">
          <button style={{'font-size': '28px'}}>16ms.ai</button>
        </a>
      </div>
      <div>谢谢您的关注与支持！</div>
    </div>
  );
};

export default Index;
