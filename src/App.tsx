import { ThemeProvider } from "@/components/theme-provider";
import { HashRouter, Routes, Route } from "react-router-dom";
import Chat from "@/pages/Chat";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <HashRouter>
        <Routes>
          <Route path="/" element={<Chat />} />
        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
}

export default App;
