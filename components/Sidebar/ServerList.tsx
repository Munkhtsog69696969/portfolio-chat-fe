// ServerList.tsx
import React from 'react';
import { useUser } from '@/context/UserContext';
import { FaCompass } from "react-icons/fa";
import { FaPlus } from "react-icons/fa6";
import { useRouter } from 'next/navigation';

const ServerList: React.FC<{ onOpenModal: () => void }> = ({ onOpenModal }) => {
  const { user } = useUser();
  const router=useRouter()

  return (
    <div className='bg-[rgb(26,26,26)] h-full w-[35%] rounded-xl flex flex-col items-center py-4 gap-y-2'>
      {/* Create Server Button */}
      <div className="tooltip tooltip-right tooltip-custom" data-tip="Create a new Server">
        <button
          className='btn btn rounded-full flex justify-center items-center bg-[rgb(48,48,48)] w-14 h-14'
          onClick={onOpenModal}
        >
          <FaPlus className='text-white text-2xl' />
        </button>
      </div>

      {/* Discover Servers Button */}
      <div className="tooltip tooltip-right tooltip-custom pb-5" data-tip="Discover new Servers">
        <button className='btn btn rounded-full flex justify-center items-center bg-[rgb(48,48,48)] w-14 h-14'>
          <FaCompass className='text-white text-2xl' />
        </button>
      </div>

      {/* User Servers */}
      {user?.servers?.map((server, i) => {
        const array = server.server_name.split(" ");
        const shortName = array.length > 1 ? array[0][0] + array[1][0] : array[0][0];

        return (
          <div key={i} className="tooltip tooltip-right tooltip-custom" data-tip={server?.server_name}>
            <button className='btn btn rounded-full flex justify-center items-center bg-[rgb(48,48,48)] w-14 h-14'
                onClick={()=>router.push(`/protected/server/${server._id}`)}
            >
              <p className='text-white'>{shortName}</p>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ServerList;
