import React, { useState } from "react";

function UserChat() {
  const [messages, setMessages] = useState([
    { sender: "user", text: "عايز اعرف ازاي انقل بين الصفحات" },
    { sender: "user", text: "عايز اعرف ازاي انقل بين الصفحات" },
    { sender: "admin", text: "Yes" },
    { sender: "admin", text: "Yes" },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([...messages, { sender: "user", text: newMessage }]);
      setNewMessage("");
      simulateAdminResponse(); 
    }
  };

  const simulateAdminResponse = () => {
    setIsAdminTyping(true); 
    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: "admin", text: "جاري الرد على استفسارك قريبًا" },
      ]);
      setIsAdminTyping(false); // المحاضر يتوقف عن الكتابة
    }, 2000); // زمن المحاكاة
  };

  return (
    <div className="card p-3 mb-3 container">
      <h1 className="text-center">Chat With Instructor</h1>

      {/* منطقة المحادثة */}
      <div
        className="card p-3 mb-3"
        style={{ maxHeight: "400px", overflowY: "auto", overflowX: "hidden" }}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 ${
              message.sender === "user" ? "text-start" : "text-end"
            }`}
          >
            <span
              className={`badge ${
                message.sender === "user" ? "bg-primary" : "bg-success"
              }`}
            >
              {message.sender === "user" ? "You" : "Admin"}:
            </span>{" "}
            {message.text}
          </div>
        ))}
    
        {/* {isTyping && <div className="text-start text-muted">You are typing...</div>} */}
        {isAdminTyping && <div className="text-end text-muted">Admin is typing...</div>}
      </div>

 
      <div className="d-flex">
        <input
          type="text"
          placeholder="Type your message..."
          className="form-control m-2"
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            setIsTyping(e.target.value.trim() !== "");
          }}
        />
        <button
          className="btn btn-success m-2"
          onClick={(e) => {
            handleSendMessage(e);
            setIsTyping(false);
          }}
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default UserChat;
