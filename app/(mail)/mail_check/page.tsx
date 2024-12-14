"use client";

import React from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import Particles from 'react-tsparticles';
import { loadSlim } from "tsparticles-slim";
import type { Engine } from "tsparticles-engine";

export default function Mail_Check() {
  const searchParams = useSearchParams();
  const mail = searchParams.get('mail');

  const particlesInit = async (engine: Engine) => {
    await loadSlim(engine);
  };

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center bg-gray-100 p-4 relative">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fpsLimit: 120,
          particles: {
            color: { value: ["#00ff87", "#60efff", "#ff6b6b"] },
            move: {
              direction: "top",
              enable: true,
              speed: 3,
            },
            number: {
              value: 100,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            opacity: {
              value: 0.7,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: 3,
              random: true,
            },
          },
          detectRetina: true,
          background: {
            color: "transparent",
          },
        }}
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          zIndex: 1,
        }}
      />
      <div className="max-w-2xl bg-white p-6 rounded shadow-lg text-center flex flex-col items-center relative z-10">
        <Image
          width={150}
          height={150}
          src="/mail_sent.png"
          alt="mail_sent"
        />
        <p className="text-4xl font-bold mb-4">Verify Your Email Address</p>
        <p className="text-lg mb-2">
          A verification email has been sent to{' '}
          <a 
            href={`mailto:${mail}`} 
            className="text-blue-500 hover:underline hover:text-blue-700"
          >
            {mail}
          </a>
        </p>
        <p className="text-md mb-2">
          Please check your email and click the link provided to complete your account registration.
        </p>
        <p className="text-md text-gray-600">
          If you do not see the email, check your spam or junk folder.
        </p>
        <p className="text-sm font-light text-gray-500">
          Didn&apos;t receive the confirmation mail?{' '}
          <a
            href="/resend_confirmation_mail"
            className="font-medium text-blue-600 hover:underline"
          >
            Click here!
          </a>
        </p>
      </div>
    </div>
  );
}
