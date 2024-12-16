// // Drawer.tsx
// 'use client';
// import React from 'react';


// interface DrawerProps {
//   // user: {
//     id?: string | undefined;
//     email?: string | undefined;
//     name?: string | undefined;
//   // }
// }

// const DrawerProfile: React.FC<DrawerProps> = ({ user }) => {
//   // console.log(user);

//   return (
//     <div className="drawer drawer-end">
//       <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
//       <div className="drawer-side z-50"> {/* Adjusted z-index here */}
//         <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
//         <div className="menu bg-base-200 text-base-content min-h-full w-[40%] p-4 z-50"> {/* Adjusted z-index here */}
          
//           <div className="user-name">{user?.name}</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DrawerProfile;
