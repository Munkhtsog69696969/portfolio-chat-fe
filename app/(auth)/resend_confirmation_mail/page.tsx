"use client"
import React, { useState } from 'react';

import { useRouter } from 'next/navigation';

import { showErrorToast } from '@/utils/toast';

export default function Resend_confirmation_mail() {
  const router=useRouter()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleResendConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ADDRESS}/resend_confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      
      if(!response.ok){
        showErrorToast(data.message)
        return
      }

      // console.log(data)

      router.push(data.redirectUrl)

    } catch (error) {
      console.log('log', error);
      setMessage('Server error. Please try again later.');
    }finally{
        setLoading(false);
    }

  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <form
        onSubmit={handleResendConfirmation}
        style={{
          width: '300px',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          backgroundColor: '#f9f9f9',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Resend Confirmation</h2>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {loading ? 'Sending...' : 'Resend Confirmation'}
        </button>

        {message && (
          <p
            style={{
              marginTop: '15px',
              textAlign: 'center',
              color: message.includes('success') ? 'green' : 'red',
            }}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
}
