import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Scenario } from "./components/Scenario";
import { ChatInterface } from "./components/ChatInterface";
import { SpeechProvider } from "./hooks/useSpeech";
import { LanguageSelector } from "./components/LanguageSelector";
import { ChatHistory } from "./components/ChatHistory";

function App() {
  return (
    <SpeechProvider>
      <Loader />
      <Leva collapsed hidden />
      <ChatInterface />
      <Canvas shadows camera={{ position: [0, 0, 0], fov: 10 }}>
        <Scenario />
      </Canvas>
      <LanguageSelector />
      <ChatHistory />
    </SpeechProvider>
  );
}

export default App;
