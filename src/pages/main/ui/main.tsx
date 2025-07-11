import { Chat } from "../../../widgets/chat/";
import { VoiceButton } from "../../../widgets/voice-button/";

export default function MainPage() {
  const voiceButton = VoiceButton(handleClap);
  const chat = Chat();
  
  function handleClap() {
    console.log("Хлопок обнаружен! 👏");
  }

  return (
    <>
      {chat.ui}
      {voiceButton.ui}
    </>
  );
}
