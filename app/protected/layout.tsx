import { ReactNode } from 'react';

import { UserProvider } from '@/context/UserContext';
import { ServerProvider } from '@/context/ServerContext';
import { SocketProvider } from '@/context/SocketContext';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps): Promise<JSX.Element> {
  return (
    <SocketProvider>
      <ServerProvider>
        <UserProvider>

          <div className="w-screen h-screen flex flex-row">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex flex-col w-full h-full">
              {/* Header */}
              <Header />

              {/* Content and Chat Info */}
              <div className="flex-grow flex overflow-hidden">
                <div className="flex-grow overflow-auto">{children}</div>
              </div>
            </div>

          </div>
          
        </UserProvider>
      </ServerProvider>
    </SocketProvider>
  );
}
