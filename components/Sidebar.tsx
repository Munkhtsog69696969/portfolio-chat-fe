// Sidebar.tsx
'use client';
import React, { useState } from 'react';
import ModalServer from './Sidebar/ModalServer';
import ServerList from './Sidebar/ServerList';
import FriendList from './Sidebar/FriendList';

export default function Sidebar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className='bg-black flex-shrink-0 h-full w-[25%] p-4 flex flex-row gap-x-3'>
      <ServerList onOpenModal={handleOpenModal} />
      <FriendList />
      <ModalServer isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
}
