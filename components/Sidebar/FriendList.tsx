import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useUser } from '@/context/UserContext';
import { useSocket } from '@/context/SocketContext';

interface Friend {
  _id:string
  name: string;
  email: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

const FriendList: React.FC = () => {
  const router = useRouter();
  const { user } = useUser();
  const socket = useSocket();

  const [onlineFriends, setOnlineFriends] = useState<Friend[]>([]);
  const [offlineFriends, setOfflineFriends] = useState<Friend[]>([]);

  useEffect(() => {
    if (!socket || !user) return;

    socket.emit("set-user", user);

    socket.on('show-user-friends-online', (friends: Friend[]) => {
      setOnlineFriends(friends);
      
      if (user.friends) {
              const currentOfflineFriends = user.friends
        .filter(friend => 
          // Ensure friend has a name and is not in online friends
          friend.name && !friends.some(onlineFriend => onlineFriend.email === friend.email)
        )
        .map(friend => ({
          _id: friend._id, // Include _id here
          name: friend.name!, // Use non-null assertion since we filtered for name
          email: friend.email
        }));

      setOfflineFriends(currentOfflineFriends);

      }
    });

    socket.on('friend-online', (friendData: Friend) => {
      setOnlineFriends(prev => {
        const isAlreadyOnline = prev.some(f => f.email === friendData.email);
        return isAlreadyOnline 
          ? prev 
          : [...prev, friendData];
      });
    
      setOfflineFriends(prev => 
        prev.filter(friend => friend.email !== friendData.email)
      );
    });

    socket.on('friend-offline', (friendData: Friend) => {
      setOnlineFriends(prev => 
        prev.filter(f => f.email !== friendData.email)
      );
    
      setOfflineFriends(prev => {
        const isAlreadyOffline = prev.some(f => f.email === friendData.email);
        return isAlreadyOffline 
          ? prev 
          : [...prev, friendData];
      });
    });

    return () => {
      socket.off('show-user-friends-online');
      socket.off('friend-online');
      socket.off('friend-offline');
    };
  }, [socket, user]);

  const navigateToUser = (friend: User) => {
    router.push(`/protected/dm/${friend._id}`);
  };

  return (
    <div className='flex flex-col w-full gap-y-4'>
      {/* Online Friends Section */}
      {onlineFriends.length > 0 && (
        <div>
          <h3 className='text-white text-lg mb-2'>Online Friends</h3>
          {onlineFriends.map((onlineFriend, i) => (
            <div 
              key={`online-${i}`} 
              className='bg-[rgb(26,26,26)] w-full h-15 rounded-xl flex items-center p-2 mb-2'
              onClick={() => navigateToUser({
                _id: onlineFriend._id, // Using email as a fallback for _id
                name: onlineFriend.name,
                email: onlineFriend.email
              })}
            >
              <Image 
                src={'/avatar.png'}
                alt={onlineFriend.name || "online-friend-alt"}
                width={50}
                height={50}
                className='rounded-full'
              />
              <div className='ml-4'>
                <p className='text-white'>{onlineFriend.name}</p>
                <p className='text-green-500'>Online</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offline Friends Section */}
      {offlineFriends.length > 0 && (
        <div>
          <h3 className='text-white text-lg mb-2'>Offline Friends</h3>
          {offlineFriends.map((friend, i) => (
            <div 
              key={`offline-${i}`} 
              className='bg-[rgb(26,26,26)] w-full h-15 rounded-xl flex items-center p-2 mb-2 opacity-60'
              onClick={() => navigateToUser({
                _id: friend._id, // Using email as a fallback for _id
                name: friend.name,
                email: friend.email
              })}
            >
              <Image 
                src={'/avatar.png'}
                alt={friend.name || "friend-alt"}
                width={50}
                height={50}
                className='rounded-full'
              />
              <div className='ml-4'>
                <p className='text-white'>{friend.name}</p>
                <p className='text-gray-500'>Offline</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendList;