"use client"
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import Confetti from "react-confetti";

export default function Mail_Check() {
  const router = useRouter();

  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }
    window.addEventListener("resize", handleResize);
    
    handleResize();
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative w-screen h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
      <Confetti width={windowSize.width} height={windowSize.height} recycle={true} />
      <div className="relative z-10 max-w-2xl bg-white p-6 rounded shadow-lg text-center flex flex-col items-center">
        <Image
          width={150}
          height={150}
          src="/mail_verified.png"
          alt='mail_verified'
        />
        <p className="text-4xl font-bold mb-4 text-green-600">Email Verified!</p>
        <p className="text-2xl mb-4 text-gray-700">Congratulations</p>
        <p className="text-md mb-2 text-gray-600">Your email has been successfully verified.</p>
        <p className="text-md mb-4 text-gray-600">You can now access all features of your account.</p>
        <button
          className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition-colors"
          onClick={() => router.push("/")}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}