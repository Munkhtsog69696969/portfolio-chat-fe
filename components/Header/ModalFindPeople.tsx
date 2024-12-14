// FindPeopleModal.tsx
'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useSocket } from '@/context/SocketContext';
import { FaSearch, FaUserFriends,FaPlus, FaArrowRight } from 'react-icons/fa';
import { Empty } from "antd";

import Image from 'next/image';

interface ModalFindPeopleProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Result {
    _id: string;
    email: string;
    name: string;
    isVerified: boolean;
    friends: boolean;
    pending:boolean;
    mail_verification_token: string;
    createdAt: string;
}

const ModalFindPeople: React.FC<ModalFindPeopleProps> = ({ isOpen, onClose }) => {
  const socket=useSocket()
  const {searchPeople,sendFriendRequest}=useUser()
  const modalRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [results, setResults] = useState<Result[]>([]); 

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        setSearchTerm("")
        setResults([])
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleClickOutside = (event: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
      setSearchTerm("")
      setResults([])
    }
  };

  const handleInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
  
    if (value) {
      try {
        const searchResults: Result[] | null = await searchPeople(value); 
        // console.log(searchResults);

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

  const addFriend=async(id:string)=>{
    try{
        if(socket && id){
          await sendFriendRequest(id)

          socket.emit("send-friend-request",{
            toUserId:id
          })
          
          const searchResults:Result[] | null=await searchPeople(searchTerm)
  
          if (searchResults) {
              setResults(searchResults);
          }
        }
    }catch(err){
        console.log(err)
    }
  }

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={handleClickOutside} 
    >
      <div 
        ref={modalRef} // Attach ref to the modal
        className="bg-[rgb(26,26,26)] rounded-lg p-6 w-[60%] h-[70%] flex flex-col" // Use flex column layout
      >
        <h2 className="text-white text-lg mb-4">Find People</h2>
        <div className="bg-[rgb(26,26,26)] relative w-full mb-4 rounded-2xl">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-lg" />
          <input
            type="text"
            placeholder="Search for people..."
            value={searchTerm}
            onChange={handleInputChange} // Call API on input change
            className="bg-[rgb(26,26,26)] w-full pl-10 pr-4 py-2 text-white placeholder-white border-none rounded-xl"
          />
        </div>

        <div className='w-full flex-grow mb-4 p-4 overflow-auto'>
            {results.length > 0 ? (
                results.map((result, index) => (
                    <div
                        key={index}
                        className="w-full text-white my-2 p-2 flex flex-row rounded items-center gap-4 bg-[rgb(48,48,48)] hover:bg-gray-800 transition duration-300"
                    >
                    {/* Image */}
                        <div className="relative w-10 h-10 overflow-hidden rounded-full">
                            <Image
                            src="/avatar.png"
                            alt="user avatar"
                            layout="fill" // Use layout fill to cover the container
                            objectFit="cover" // Maintain aspect ratio and cover the area
                            />
                        </div>
                        
                        {/* Infos */}
                        <div className="flex flex-col">
                            <p className="font-semibold">{result?.name}</p>
                            <p className="text-gray-400">{result?.email}</p>
                        </div>
                        
                        {/* Plus Icon */}
                        <div className="ml-auto">
                            <button 
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-600 transition duration-300"
                                aria-label="Add Friend"
                                onClick={()=>{addFriend(result?._id)}}
                                >
                                {
                                    result.friends ? (
                                      <FaUserFriends className='text-white text-lg' />
                                    ) : result.pending ? (
                                        <FaArrowRight className='text-white text-lg' />
                                    ) : (
                                        <FaPlus className='text-white text-lg' />
                                    )
                                }
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <Empty className="text-white" image={Empty.PRESENTED_IMAGE_SIMPLE} description={<span className="text-white">User doesn&apos;t exist</span>} />
            )}
        </div>

        <button onClick={onClose} className="bg-blue-500 text-white rounded-full px-4 py-2 self-end">
          Close
        </button>
      </div>
    </div>
  );
};

export default ModalFindPeople;