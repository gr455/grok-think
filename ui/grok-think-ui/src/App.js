import logo from './logo.svg';
import './App.css';

import ChatArea from './components/ChatArea/ChatArea.js'


function App() {
  return (
    <div className="container">
      <div className="logo-full" onClick={() => window.location.reload()}><img src="/logo_full.png" /></div>
      <div className="logo-small" onClick={() => window.location.reload()}><img src="/logo.png" /></div>
      <ChatArea className="chat-area"/>
    </div>
  );
}

export default App;
