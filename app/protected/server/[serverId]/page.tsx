"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { useSocket } from '@/context/SocketContext';
import axios from 'axios';

import MessageInput from '@/components/MainChat/Input';

interface Message {
  _id?: string;
  message: string;
  serverId?: string;
  senderId?: string;
  senderName?: string;
  timestamp?: string;
  createdAt?: string;
  timeStamp?: number;
}

export default function Page() {
  const { accessToken } = useAuth();
  const { user } = useUser();
  const socket = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const params = useParams();
  const serverId = Array.isArray(params.serverId) ? params.serverId[0] : params.serverId;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Comprehensive fetch chat history
  const fetchChatHistory = async (currentPage: number) => {
    if (!accessToken || !serverId || !hasMore || loading) return;
    setLoading(true);

    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_SERVER_ADDRESS}/messages/server/get_message`, {
        params: { 
          serverId: serverId, 
          limit: 20, 
          page: currentPage 
        },
        headers: { 
          Authorization: `Bearer ${accessToken}` 
        },
      });

      if (response.data.length > 0) {
        setMessages(prev => {
          // Create a Set of existing message IDs to prevent duplicates
          const existingMessageIds = new Set(prev.map(m => m._id));
          
          // Filter out duplicates from new messages
          const newUniqueMessages = response.data.filter(
            (message: Message) => !existingMessageIds.has(message._id)
          );

          // Combine and sort messages by timestamp
          return [...newUniqueMessages, ...prev].sort(
            (a, b) => new Date(a.createdAt || a.timestamp || a.timeStamp).getTime() - 
                      new Date(b.createdAt || b.timestamp || b.timeStamp).getTime()
          );
        });

        // If fewer messages returned than limit, we've reached the end
        if (response.data.length < 20) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial and pagination message fetching
  useEffect(() => {
    if (accessToken && serverId) {
      fetchChatHistory(page);
    }
  }, [page, accessToken, serverId]);

  const handleReceiveMessage = (message: Message) => {
    setMessages(prev => {
      // Prevent duplicate messages
      const isDuplicate = prev.some(m => 
        m._id === message._id || 
        (m.message === message.message && m.senderId === message.senderId)
      );

      if (isDuplicate) return prev;

      // Add new message and sort
      return [...prev, message]
      // .sort(
      //   (a, b) => new Date(a.createdAt || a.timestamp || a.timeStamp).getTime() - 
      //             new Date(b.createdAt || b.timestamp || b.timeStamp).getTime()
      // );
    });
  };

  // Socket message listener
  useEffect(() => {
    if (!socket || !serverId) return;

    socket.on("receive-server-message", handleReceiveMessage);

    return () => {
      socket.off("receive-server-message", handleReceiveMessage);
    };
  }, [socket, serverId, user?._id]);

  // Send message handler
  const handleSend = async (message: string) => {
    if (socket && message && serverId && user) {
      const newMessage: Message = {
        message,
        serverId,
        senderName: user.name,
        senderId: user._id,
        _id: `temp-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };

      socket.emit("send-server-message", {
        serverId,
        message: newMessage
      });
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Detect scroll to top for pagination
  const handleScroll = () => {
    if (!messagesContainerRef.current || loading || !hasMore) return;

    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop === 0) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="bg-black flex w-full h-full justify-center flex-col">
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="bg-[rgb(26,26,26)] flex w-full h-full rounded-xl flex-col overflow-y-auto"
      >
        {loading && <div className="text-center text-white">Loading...</div>}
        
        {messages.map((message, i) => {
          const chatPosition = message.senderId === user?._id ? "end" : "start";
          const chatType = message.senderId === user?._id ? "primary" : "";
          return (
            <div key={message._id || `message-${i}`} className={`chat chat-${chatPosition} text-white`}>
              <div className="chat-header flex flex-row items-center">
                <p className='text-sm'>{message?.senderName}</p>
                <time className="text-xs opacity-50 ml-2">
                  {message?.timestamp || message?.timeStamp 
                    ? new Date(message.timestamp || message.timeStamp!).toLocaleString('en-US', { timeZone: 'UTC' }) 
                    : 'N/A'}
                </time>
              </div>
              <div className={`chat-bubble chat-bubble-${chatType}`}>
                {message.message}
              </div>
            </div>
          );
        })}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div>
        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}