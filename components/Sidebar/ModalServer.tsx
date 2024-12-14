// Modal.tsx
'use client';
import React, { useEffect, useState } from 'react';
import { useServer } from '@/context/ServerContext';
import { useUser } from '@/context/UserContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalServer: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { createServer } = useServer();
  const {fetchUser}=useUser()
  const [serverName, setServerName] = useState('');

  // Close modal when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (isOpen && !target.closest('.modal-content')) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const createNewServer = async () => {
    try {
      await createServer({ server_name: serverName });
      await fetchUser()
      onClose(); // Close the modal after creating the server
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
          <div className="modal-content z-20 bg-[rgb(26,26,26)] text-white rounded-lg w-[50%] h-[70%] p-6 flex flex-col items-center justify-center relative">
            <h2 className="text-lg font-bold mb-4">Create a New Server</h2>
            <input
              type="text"
              placeholder="Enter server name"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              className="bg-[rgb(26,26,26)] text-white placeholder-white border-none rounded-xl w-full p-2 mt-4"
            />
            <div className="flex gap-4 mt-4">
              <button className="bg-blue-500 text-white rounded-full px-4 py-2" onClick={createNewServer}>
                Create
              </button>
              <button className="bg-gray-500 text-white rounded-full px-4 py-2" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ModalServer;
