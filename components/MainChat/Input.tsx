import React, { useState } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

const MessageInput: React.FC<{ onSend: (message: string) => void }> = ({ onSend }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim()) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="flex w-full items-center bg-gray-800 p-3 rounded-lg shadow-md">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type your message..."
        className="flex-grow bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        onClick={handleSend}
        className="ml-3 p-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-transform duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        aria-label="Send message"
      >
        <FaPaperPlane className="text-white text-xl" />
      </button>
    </div>
  );
};

export default MessageInput;
