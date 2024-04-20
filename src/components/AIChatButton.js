"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Bot } from "lucide-react";
import AIChatBox from "./AIChatBox";

const AIChatButton = () => {
  const [chatBoxOpen, setChatBoxOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setChatBoxOpen(true)}>
        <Bot size={20} className="mr-2" />
        AI Chat
      </Button>
      <AIChatBox open={chatBoxOpen} onClose={() => setChatBoxOpen(false)} />
    </>
  );
};

export default AIChatButton;
