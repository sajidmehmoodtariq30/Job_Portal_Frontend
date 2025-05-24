import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/UI/card";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Badge } from "@/components/UI/badge";
import { Avatar } from "@/components/UI/avatar";
import { SendHorizontal, RefreshCw, MessageSquare } from 'lucide-react';
import axios from 'axios';
import API_ENDPOINTS from '@/lib/apiConfig';

const ChatRoom = ({ jobId }) => {
  // State for messages and new message input
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState(null);

  // Ref for auto-scrolling to most recent message
  const messagesEndRef = useRef(null);

  // Get currently logged in user info from localStorage
  const getUserInfo = () => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    return {
      name: userInfo.name || 'Client',
      id: userInfo.id || userInfo.uuid || '',
      type: 'client' // Since this is the client side component
    };
  };

  // Fetch messages
  const fetchMessages = async () => {
    if (!jobId) return;
    
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.CHAT.GET_MESSAGES(jobId));
      
      if (response.data.success) {
        setMessages(response.data.data.reverse()); // Reverse to show newest at the bottom
        setError(null);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load chat messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread message count
  const fetchUnreadCount = async () => {
    if (!jobId) return;
    
    try {
      const user = getUserInfo();
      const response = await axios.get(API_ENDPOINTS.CHAT.GET_UNREAD(jobId, user.type));
      
      if (response.data.success) {
        setUnreadCount(response.data.data.unreadCount);
      }
    } catch (err) {
      console.error('Failed to fetch unread count:', err);
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async () => {
    if (!jobId) return;
    
    try {
      const user = getUserInfo();
      await axios.post(API_ENDPOINTS.CHAT.MARK_READ, {
        jobId,
        userType: user.type
      });
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark messages as read:', err);
    }
  };

  // Send message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !jobId) return;
    
    try {
      setSending(true);
      const user = getUserInfo();
      
      const messageData = {
        jobId,
        sender: user.name,
        senderType: user.type,
        message: newMessage.trim()
      };
      
      const response = await axios.post(API_ENDPOINTS.CHAT.SEND_MESSAGE, messageData);
      
      if (response.data.success) {
        // Add to our messages list
        setMessages(prev => [...prev, response.data.data]);
        setNewMessage(''); // Clear input
        setError(null);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (jobId) {
      fetchMessages();
      fetchUnreadCount();
      
      // Set up polling at intervals (every 10 seconds)
      const intervalId = setInterval(() => {
        fetchMessages();
        fetchUnreadCount();
      }, 10000);
      
      // Clean up on unmount
      return () => clearInterval(intervalId);
    }
  }, [jobId]);

  // Mark messages as read when the component mounts or when messages change
  useEffect(() => {
    if (messages.length > 0 && unreadCount > 0) {
      markMessagesAsRead();
    }
  }, [messages, unreadCount]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Format timestamp for message display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format date for message display
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString();
  };

  return (
    <Card className="w-full h-[550px] flex flex-col">      <CardHeader className="pb-3 bg-green-50">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-green-600" />
            Client Chat {jobId && <span className="text-sm font-normal text-gray-500 ml-1">#{jobId.substring(0, 8)}</span>}
          </CardTitle>
          
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} unread
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchMessages}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Your messages will appear on the right, admin messages on the left
        </p>
      </CardHeader>

      <CardContent className="flex-grow overflow-y-auto pb-2">
        {loading && messages.length === 0 ? (
          <div className="flex h-full justify-center items-center">
            <div className="animate-pulse text-gray-500">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full justify-center items-center">
            <div className="text-gray-500">No messages yet. Start the conversation!</div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg, idx) => {              const isClient = msg.senderType === 'client';
              const isAdmin = msg.senderType === 'admin';
              const user = getUserInfo();
              const isCurrentUser = user.type === msg.senderType;
              
              // Show date if first message or date changes from previous message
              const showDate = idx === 0 || 
                formatDate(msg.timestamp) !== formatDate(messages[idx - 1].timestamp);
              
              return (
                <React.Fragment key={msg.id}>
                  {showDate && (
                    <div className="text-xs text-center text-gray-500 my-2">
                      {formatDate(msg.timestamp)}
                    </div>
                  )}
                  
                  {/* Client messages on right, admin messages on left */}
                  <div className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[80%] ${isClient ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
                      <Avatar className={`h-8 w-8 ${isClient ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}`}>
                        <span className="text-xs">
                          {isClient ? 'C' : 'A'}
                        </span>
                      </Avatar>
                      
                      <div className={`flex flex-col ${isClient ? 'items-end' : 'items-start'}`}>
                        <div className="text-xs text-gray-500 mb-1">
                          {msg.sender} • {formatTime(msg.timestamp)}
                        </div>
                        
                        <div className={`rounded-lg py-2 px-3 ${
                          isClient 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {msg.message}
                        </div>
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-500 mt-2">
            {error}
          </div>
        )}
      </CardContent>

      <CardFooter className="border-t p-3">
        <form onSubmit={sendMessage} className="flex w-full gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-grow"
            disabled={sending || loading}
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim() || sending || loading}
          >
            <SendHorizontal className={`h-4 w-4 ${sending ? 'animate-spin' : ''}`} />
            <span className="ml-1">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default ChatRoom;
