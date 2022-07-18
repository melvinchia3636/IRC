/* eslint-disable react/prop-types */
import React from 'react';

export default function Header({
  onlineUser,
}) {
  return (
    <div className="flex items-center justify-between p-8">
      <h1 className="font-bold text-2xl">SOCKET.IO IRC v0.10</h1>
      <p className="text-right">
        Public |
        {' '}
        {onlineUser.length}
        {' '}
        user(s) online
      </p>
    </div>
  );
}
