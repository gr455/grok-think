import logo from './logo.svg';
import './App.css';
import PromptBox from './components/PromptBox/PromptBox.js'

const handleSend = (sn) => {}

function App() {
  return (
    <PromptBox handleSend={handleSend}/>
  );
}

export default App;
