import React from 'react';
import { useRouter } from 'next/router';

const SignOut = () => {
  const router = useRouter();

  const handleSignOut = async () => {
    // Call sign-out API here
    const res = await fetch('/api/auth/signout', {
      method: 'POST',
    });

    if (res.ok) {
      router.push('/');
    } else {
      alert('Failed to sign out');
    }
  };

  return (
    <div>
      <h1>Sign Out</h1>
      <button onClick={handleSignOut}>Sign Out</button>
    </div>
  );
};

export default SignOut;
