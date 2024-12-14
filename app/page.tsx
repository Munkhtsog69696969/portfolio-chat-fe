"use client"
import { useRouter } from 'next/navigation'
import { useEffect } from 'react';
import Cookies from 'js-cookie';


export default function Home() {
  const router=useRouter()

  useEffect(() => {
    // Check if the 'authToken' cookie exists on component mount
    const token = Cookies.get('authToken');
    if (token) {
      console.log('authToken cookie exists');
    } else {
      router.push("/signin")
    }
  }, []);
  return (
    <div>

    </div>
  );
}
