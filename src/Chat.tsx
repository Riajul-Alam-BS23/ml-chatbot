import { useState, useEffect } from "react";
import "./Chat.css";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
  ConversationHeader,
  Avatar,
} from "@chatscope/chat-ui-kit-react";

type MessageDirection = "incoming" | "outgoing";

function Chat() {

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      message: "Hello my friend",
      sentTime: "just now",
      sender: "Joe",
      direction: "incoming" as MessageDirection,
    },
  ]);

  const [faqs, setFaqs] = useState<{ [key: string]: string }>({});
  const [bs23, setBS23] = useState<any>();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChatOpen(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetch("http://localhost:3000/BS23")
      .then((response) => response.json())
      .then((data) => {
        setFaqs(data.faqs);
        setBS23(data);
      })
      .catch((error) => console.error("Error fetching FAQ data:", error));
  }, []);


  const handleSend = (messageText: string) => {
    const newMessage = {
      message: messageText,
      sentTime: "just now",
      sender: "Me",
      direction: "outgoing" as MessageDirection,
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    setTimeout(() => {
      let replyMessage:any;
      const upperCaseMessage = messageText.toUpperCase();

      if (faqs[upperCaseMessage]) {
        replyMessage = {
          message: faqs[upperCaseMessage],
          sentTime: "just now",
          sender: "Joe",
          direction: "incoming" as MessageDirection,
        };
      } else {

        replyMessage = {
          message:
            "I'm sorry, I didn't understand that. Can you please rephrase?",
          sentTime: "just now",
          sender: "Joe",
          direction: "incoming" as MessageDirection,
        };
        if (!bs23.unknownFaqs.includes(upperCaseMessage)) {
          setBS23((prevBS23: any) => {
            const updatedFaqs = [...prevBS23.unknownFaqs, upperCaseMessage];
            const newBS23 = { ...prevBS23, unknownFaqs: updatedFaqs };

            fetch("http://localhost:3000/BS23", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(newBS23),
            })
              .then((response) => response.json())
              .then((updatedData) => {
                console.log("Updated unknown FAQs:", updatedData);
              })
              .catch((error) => {
                console.error("Error posting unknown FAQ:", error);
              });

            return newBS23;
          });
        }
      }
      setMessages((prevMessages) => [...prevMessages, replyMessage]);
    }, 1000);
  };

  return (
    <div className="chatPage-div">
      <div className="chat-icon" onClick={() => setIsChatOpen(!isChatOpen)}>
        <img src="/../src/assets/chat-icon/chat-icon.png" alt="Chat Icon" />
      </div>
      {isChatOpen && 
            <MainContainer>
            <ChatContainer>
              <ConversationHeader>
                <Avatar
                  status="available"
                  name="Emily"
                  src="https://chatscope.io/storybook/react/assets/emily-xzL8sDL2.svg"
                />
                <ConversationHeader.Content
                  userName="Emily"
                />
    
              </ConversationHeader>
              <MessageList className="message-list">
                {messages.map((msg, index) => (
                  <Message
                    key={index}
                    model={{
                      message: msg.message,
                      sentTime: msg.sentTime,
                      sender: msg.sender,
                      direction: msg.direction,
                      position: "single",
                    }}
                    className={msg.direction}
                  />
                ))}
              </MessageList>
              <MessageInput placeholder="Type message here" onSend={handleSend} />
            </ChatContainer>
          </MainContainer>    
      }
    </div>
  );
}

export default Chat;
















