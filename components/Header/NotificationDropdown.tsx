import React, { useEffect } from 'react';
import { Dropdown, Button, message } from 'antd';
import { FaRegBell } from 'react-icons/fa';
import { useUser } from '@/context/UserContext';
import { useSocket } from '@/context/SocketContext';
import { showSuccessToast } from '@/utils/toast';

interface Friend {
  _id: string;
  name: string;
  email: string;
}

const NotificationDropdown: React.FC = () => {
  const socket = useSocket();
  const { user, acceptFriendRequest, fetchUser } = useUser();

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming friend requests
    socket.on("receive-friend-request", () => {
      fetchUser(); // Fetch updated user info
      showSuccessToast("Someone sent you a friend request! Check your notification");
    });

    socket.on("receive-add-to-server", () => {
      fetchUser(); // Fetch updated user info
      showSuccessToast("Someone added you to server");
    });

    return () => {
      socket.off("receive-friend-request"); // Clean up the listener
    };
  }, [socket, fetchUser]);

  const createMenuItems = () => {
    return user?.friendRequests.map((friend, index) => ({
      key: index.toString(),
      label: (
        <div className="flex items-center justify-between gap-2 p-2">
          <div className="flex items-center gap-2">
            <img src={"/avatar.png"} alt={friend.name || 'User'} className="w-10 h-10 rounded-full" />
            <div>
              <div>{friend.name || 'Unnamed User'}</div>
              <div className="text-gray-500">{friend.email}</div>
            </div>
          </div>
          <Button
            type="primary"
            size="small"
            onClick={() => handleAccept({
              _id: friend._id,
              name: friend.name || 'Unnamed User',
              email: friend.email
            })}
          >
            Accept
          </Button>
        </div>
      ),
    }));
  };

  const handleAccept = async (friend: Friend) => {
    try {
      await acceptFriendRequest(friend._id);
      message.success(`You accepted the friend request from ${friend.name}`);
    } catch (error) {
      console.log('Error accepting friend:', error);
      message.error('Failed to accept friend request.');
    }
  };

  const items = createMenuItems();
  const showItems = items;

  return (
    <Dropdown 
      menu={{ items: showItems }} 
      trigger={['click']} 
      placement="bottomRight"
    >
      <Button 
        className='bg-[rgb(26,26,26)] rounded-full p-3 w-10 h-10 flex items-center justify-center border-none'
      >
        <FaRegBell className='text-xl text-white' />
      </Button>
    </Dropdown>
  );
};

export default NotificationDropdown;