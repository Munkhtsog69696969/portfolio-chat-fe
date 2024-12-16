// Header.tsx
'use client';
import React, { useState } from 'react';
// import { useUser } from '@/context/UserContext';
import { FaSearch, FaUsers } from 'react-icons/fa';
import { MdOutlineSettings } from "react-icons/md";
import { IoPersonAddSharp } from "react-icons/io5";
import { useParams } from 'next/navigation';
import Image from 'next/image';
// import DrawerProfile from './DrawerProfile';
import ModalFindPeople from './Header/ModalFindPeople';
import NotificationDropdown from './Header/NotificationDropdown';
import ModalServerInfo from './Header/ModalServerInfo';

export default function Header() {
  // const { user } = useUser();
  const [isModalFindPeopleOpen, setModalFindPeopleOpen] = useState(false);
  const [isModalServerInfoOpen,setModalServerInfoOpen]=useState(false)

  const {serverId}=useParams()

  // Function to toggle the drawer
  const toggleDrawer = () => {
    const drawerToggle = document.getElementById('my-drawer-4') as HTMLInputElement;
    if (drawerToggle) {
      drawerToggle.checked = !drawerToggle.checked; // Toggle the checked state
    }
  };

  return (
    <div className='bg-black py-2 flex flex-row items-center justify-between px-4 relative'>
      {/* <DrawerProfile user={user} /> */}

      {
        serverId && (
          <div className='absolute left-0'>
            <button className='bg-[rgb(26,26,26)] rounded-full p-3' onClick={()=>setModalServerInfoOpen(true)}>
              <FaUsers className='text-xl text-white' />
            </button>
          </div>
        )
      }

      <div className="flex items-center flex-row gap-x-2 w-1/2">
        <button className='bg-[rgb(26,26,26)] rounded-full p-3' onClick={() => setModalFindPeopleOpen(true)}>
          <IoPersonAddSharp className='text-xl text-white' />
        </button>

        <div className="bg-[rgb(26,26,26)] relative w-full max-w-md rounded-2xl">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-lg" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-[rgb(26,26,26)] w-full pl-10 pr-4 py-2 text-white placeholder-white border-none rounded-xl"
          />
        </div>

        <button className='bg-[rgb(26,26,26)] rounded-full p-3'>
          <MdOutlineSettings className='text-xl text-white' />
        </button>

        {/* Use the NotificationDropdown component */}
        <NotificationDropdown />

        {/* Button to toggle the drawer */}
        <button onClick={toggleDrawer} className='bg-blue-100 rounded-full flex justify-center items-center p-2'>
          <Image
            width={40}
            height={40}
            src="/avatar.png"
            alt='avatar'
            className='rounded-full'
          />
        </button>
      </div>

      {/* Find People Modal */}
      {/* // In Header.tsx */}
      {isModalFindPeopleOpen && (
        <ModalFindPeople 
          isOpen={true} 
          onClose={() => setModalFindPeopleOpen(false)} 
        />
      )}

      {isModalServerInfoOpen && (
        <ModalServerInfo 
          isOpen={true} 
          onClose={() => setModalServerInfoOpen(false)} 
        />
      )}
    </div>
  );
}
