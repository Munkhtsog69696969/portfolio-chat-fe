'use client';

import { useServer } from '@/context/ServerContext';
import { useUser } from '@/context/UserContext';
import { useParams } from 'next/navigation';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Empty } from 'antd';
import { FaSearch, FaUserFriends, FaPlus, FaArrowRight } from 'react-icons/fa';
import { useSocket } from '@/context/SocketContext';

interface ModalServerInfoProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Server {
  server_name: string;
  owners: { name: string; email: string; _id?: string }[];
  members: { name: string; email: string; _id?: string }[];
  messages: string[];
  createdAt: string; // ISO string
}
interface Result {
  _id: string;
  email: string;
  name: string;
  isVerified: boolean;
  friends: boolean;
  pending: boolean;
  mail_verification_token: string;
  createdAt: string;
}

const ModalServerInfo: React.FC<ModalServerInfoProps> = ({ isOpen, onClose }) => {
  const socket = useSocket()
  const { user } = useUser()
  const { getServerInfo, addPeopleToServer, promoteToAdmin, kickUser } = useServer();
  const { searchPeople, sendFriendRequest } = useUser();
  const { serverId } = useParams();
  const [server, setServer] = useState<Server | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('server');
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [isOwner, setIsOwner] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (serverId) {
      setIsLoading(true);
      const fetchServerInfo = async () => {
        try {
          // Convert serverId to string if it's an array
          const serverIdString = Array.isArray(serverId) ? serverId[0] : serverId;
          const serverInfo = await getServerInfo(serverIdString);
          setServer(serverInfo);
        } catch (err) {
          console.error(err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchServerInfo();
    }
  }, [serverId, getServerInfo]);

  useEffect(() => {
    const owner = server?.owners?.some(owner => owner.email === user?.email) ?? false;
    setIsOwner(owner)
  }, [server, user]);

  // Use useCallback to memoize the handleOutsideClick function
  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [handleOutsideClick]);

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value) {
      try {
        const searchResults: Result[] | null = await searchPeople(value);
        if (searchResults) {
          setResults(searchResults);
        }
      } catch (error) {
        console.log('Error fetching data:', error);
      }
    } else {
      setResults([]);
    }
  };

  const addFriend = async (id: string) => {
    try {
      if(socket && id){
        await sendFriendRequest(id);

        socket.emit("send-friend-request",{
          toUserId:id
        })
  
        const searchResults: Result[] | null = await searchPeople(searchTerm);
  
        if (searchResults) {
          setResults(searchResults);
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const addToServer = async (userId: string) => {
    try {
      if(socket && userId){
        if (serverId) {
          const serverIdString = Array.isArray(serverId) ? serverId[0] : serverId;
          const updatedServer = await addPeopleToServer({serverId: serverIdString, userId: userId})
  
          socket.emit("add-people-to-server", {
            toUserId: userId
          })
  
          setServer(updatedServer)
        }
      }
    } catch(err) {
      console.log(err)
    }
  }

  const promoteUserToAdmin = async (userId: string) => {
    try {
      if (serverId) {
        const serverIdString = Array.isArray(serverId) ? serverId[0] : serverId;
        const updatedServer = await promoteToAdmin({serverId: serverIdString, userId: userId})

        setServer(updatedServer)
      }
    } catch(err) {
      console.log(err)
    }
  }

  const kickUserFromServer = async (userId: string) => {
    try {
      if (serverId) {
        const serverIdString = Array.isArray(serverId) ? serverId[0] : serverId;
        const updatedServer = await kickUser({serverId: serverIdString, userId: userId})

        setServer(updatedServer)
      }
    } catch(err) {
      console.log(err)
    }
  }

  if (!isOpen) return null;

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  const tabItems = [
    {
      key: 'server',
      label: 'Server',
      children: (
        <div className="w-full flex-grow p-4 text-white text-center flex-col gap-y-2">
          <div className="flex flex-row">
            <div>Name:</div>
            <div>{server?.server_name || 'N/A'}</div>
          </div>
          <div className="flex flex-row">
            <div>Owners:</div>
            <div>{server?.owners?.length || 0}</div>
          </div>
          <div className="flex flex-row">
            <div>Members:</div>
            <div>{server?.members?.length || 0}</div>
          </div>
          <div className="flex flex-row">
            <div>Messages:</div>
            <div>{server?.messages?.length || 0}</div>
          </div>
          <div className="flex flex-row">
            <div>Created:</div>
            <div>{server ? new Date(server.createdAt).toLocaleString('en-US', { timeZone: 'UTC' }) : 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'members',
      label: 'Server Members',
      children: (
        <div className="w-full flex-grow p-4 text-white">
          <div>
            <div>Owners:</div>
            <div>
              {server?.owners?.length ? (
                server.owners.map((owner, i) => (
                  <div
                    key={i}
                    className="bg-[rgb(48,48,48)] w-full h-15 rounded-xl flex items-center p-2 mb-2"
                  >
                    <Image
                      src={'/avatar.png'}
                      alt={owner.name || 'owner-alt'}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                    <div className="ml-4">
                      <p className="text-white">{owner.name}</p>
                      <p className="text-grey-400">{owner.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<span style={{ color: 'rgb(200,200,200)' }}>No owners found</span>}
                />
              )}
            </div>
          </div>

          <div>
            <div>Members:</div>
            <div>
              {server?.members?.length ? (
                server.members.map((member, i) => (
                  <div
                    key={i}
                    className="bg-[rgb(48,48,48)] w-full h-15 rounded-xl flex items-center p-2 mb-2 relative"
                  >
                    <Image
                      src={'/avatar.png'}
                      alt={member.name || 'member-alt'}
                      width={50}
                      height={50}
                      className="rounded-full"
                    />
                    <div className="ml-4">
                      <p className="text-white">{member.name}</p>
                      <p className="text-grey-400">{member.email}</p>
                    </div>
                    {
                        isOwner ?
                            <div className='flex flex-row absolute right-5 gap-2'>
                                <div>
                                  <button 
                                    className='bg-green-500 p-2 rounded' 
                                    onClick={() => {
                                      // Find the user's ID from another source or modify your data structure
                                      const userId = server?.members.find(m => m.email === member.email)?._id;
                                      if (userId) {
                                        promoteUserToAdmin(userId);
                                      }
                                    }}
                                  >
                                    Promote to Admin
                                  </button>
                                </div>
                                <div>
                                  <button 
                                    className='bg-red-500 p-2 rounded' 
                                    onClick={() => {
                                      const userId = server?.members.find(m => m.email === member.email)?._id;
                                      if (userId) {
                                        kickUserFromServer(userId);
                                      }
                                    }}
                                  >
                                    Kick user
                                  </button>
                                </div>
                            </div>
                        :
                        ""
                    }
                  </div>
                ))
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={<span style={{ color: 'rgb(200,200,200)' }}>No Members found</span>}
                />
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'find',
      label: 'Find People',
      children: (
        <div className="w-full flex-grow p-4 text-white">
          <div className="bg-[rgb(26,26,26)] relative w-full mb-4 rounded-2xl">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-lg" />
            <input
              type="text"
              placeholder="Search for people..."
              value={searchTerm}
              onChange={handleInputChange}
              className="bg-[rgb(26,26,26)] w-full pl-10 pr-4 py-2 text-white placeholder-white border-none rounded-xl"
            />
          </div>
          <div className="w-full flex-grow mb-4 p-4 overflow-auto">
          {
            results.map((result, index) => {
                // Check if the user is already a member
                const isMember = server?.members?.some(member => member.email === result.email);
                

                return (
                <div
                    key={index}
                    className="w-full text-white my-2 p-2 flex flex-row rounded items-center gap-4 bg-[rgb(48,48,48)] hover:bg-gray-800 transition duration-300"
                >
                    <div className="relative w-10 h-10 overflow-hidden rounded-full">
                    <Image src="/avatar.png" alt="user avatar" width={40} height={40} className="rounded-full" />
                    </div>
                    <div className="flex flex-col">
                    <p className="font-semibold">{result?.name}</p>
                    <p className="text-gray-400">{result?.email}</p>
                    </div>
                    <div className="ml-auto">
                    <button
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 transition duration-300"
                        onClick={() => addFriend(result?._id)}
                    >
                        {result.friends ? (
                        <FaUserFriends className="text-white text-lg" />
                        ) : result.pending ? (
                        <FaArrowRight className="text-white text-lg" />
                        ) : (
                        <FaPlus className="text-white text-lg" />
                        )}
                    </button>
                    </div>
                    { isMember ? 
                        <div>
                            <button className='bg-blue-500 p-2 rounded'>
                                Already a member
                            </button>
                        </div>
                        :
                        <div>
                            <button className='bg-blue-500 p-2 rounded' onClick={() => addToServer(result._id)}>
                                Add person to Server
                            </button>
                        </div>
                    }
                </div>
                );
            })
            }
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div ref={modalRef} className="bg-[rgb(26,26,26)] rounded-lg p-6 w-[80%] h-[90%] flex flex-col">
        <h2 className="text-white text-lg mb-4">Server Details</h2>
        <div className="flex border-b border-gray-700 mb-4">
          {tabItems.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 text-white ${
                activeTab === tab.key ? 'border-b-2 border-blue-500 font-semibold' : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-grow">{tabItems.find((tab) => tab.key === activeTab)?.children}</div>
        <button
          onClick={onClose}
          className="mt-4 bg-blue-500 text-white rounded-full px-4 py-2 self-end hover:bg-blue-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ModalServerInfo;