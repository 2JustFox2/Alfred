import './styles/App.css'
import { Microphone_button } from '../features/speech-recognition'
import { VoiceButton } from '../widgets'

// console.log(microphone_button())

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <Microphone_button/>
      <VoiceButton/>
    </>
  )
}

export default App
