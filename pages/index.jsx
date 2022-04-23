/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-new-wrappers */
/* eslint-disable no-bitwise */
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import publicIp from 'public-ip';
import moment from 'moment';
import { Icon } from '@iconify/react';
import Head from 'next/head';
import alertSound from '../public/alert.mp3';

const colors = [
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'volet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
];

const _ = [
  [
    'text-red-500',
    'bg-red-500',
    'border-red-500',
    'placeholder-red-500',
    'selection:text-red-500',
    'selection:bg-red-500',
  ],
  [
    'text-orange-500',
    'bg-orange-500',
    'border-orange-500',
    'placeholder-orange-500',
    'selection:text-orange-500',
    'selection:bg-orange-500',
  ],
  [
    'text-amber-500',
    'bg-amber-500',
    'border-amber-500',
    'placeholder-amber-500',
    'selection:text-amber-500',
    'selection:bg-amber-500',
  ],
  [
    'text-yellow-500',
    'bg-yellow-500',
    'border-yellow-500',
    'placeholder-yellow-500',
    'selection:text-yellow-500',
    'selection:bg-yellow-500',
  ],
  [
    'text-lime-500',
    'bg-lime-500',
    'border-lime-500',
    'placeholder-lime-500',
    'selection:text-lime-500',
    'selection:bg-lime-500',
  ],
  [
    'text-green-500',
    'bg-green-500',
    'border-green-500',
    'placeholder-green-500',
    'selection:text-green-500',
    'selection:bg-green-500',
  ],
  [
    'text-emerald-500',
    'bg-emerald-500',
    'border-emerald-500',
    'placeholder-emerald-500',
    'selection:text-emerald-500',
    'selection:bg-emerald-500',
  ],
  [
    'text-teal-500',
    'bg-teal-500',
    'border-teal-500',
    'placeholder-teal-500',
    'selection:text-teal-500',
    'selection:bg-teal-500',
  ],
  [
    'text-cyan-500',
    'bg-cyan-500',
    'border-cyan-500',
    'placeholder-cyan-500',
    'selection:text-cyan-500',
    'selection:bg-cyan-500',
  ],
  [
    'text-sky-500',
    'bg-sky-500',
    'border-sky-500',
    'placeholder-sky-500',
    'selection:text-sky-500',
    'selection:bg-sky-500',
  ],
  [
    'text-blue-500',
    'bg-blue-500',
    'border-blue-500',
    'placeholder-blue-500',
    'selection:text-blue-500',
    'selection:bg-blue-500',
  ],
  [
    'text-indigo-500',
    'bg-indigo-500',
    'border-indigo-500',
    'placeholder-indigo-500',
    'selection:text-indigo-500',
    'selection:bg-indigo-500',
  ],
  [
    'text-volet-500',
    'bg-volet-500',
    'border-volet-500',
    'placeholder-volet-500',
    'selection:text-volet-500',
    'selection:bg-volet-500',
  ],
  [
    'text-purple-500',
    'bg-purple-500',
    'border-purple-500',
    'placeholder-purple-500',
    'selection:text-purple-500',
    'selection:bg-purple-500',
  ],
  [
    'text-fuchsia-500',
    'bg-fuchsia-500',
    'border-fuchsia-500',
    'placeholder-fuchsia-500',
    'selection:text-fuchsia-500',
    'selection:bg-fuchsia-500',
  ],
  [
    'text-pink-500',
    'bg-pink-500',
    'border-pink-500',
    'placeholder-pink-500',
    'selection:text-pink-500',
    'selection:bg-pink-500',
  ],
  [
    'text-rose-500',
    'bg-rose-500',
    'border-rose-500',
    'placeholder-rose-500',
    'selection:text-rose-500',
    'selection:bg-rose-500',
  ],
];

console.log(_);

function uuidv4() {
  // Public Domain/MIT
  let d = new Date().getTime(); // Timestamp
  let d2 = (typeof performance !== 'undefined'
      && performance.now
      && performance.now() * 1000)
    || 0; // Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16; // random number between 0 and 16
    if (d > 0) {
      // Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      // Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function App() {
  const [_messageList, _setMessageList] = useState([]);
  const [_isTypingList, _setIsTypingList] = useState([]);
  const [_socket, _setSocket] = useState();
  const [onlineUser, setOnlineUser] = useState([]);
  const messageList = useRef(_messageList);
  const isTypingList = useRef(_isTypingList);
  const socket = useRef(_socket);
  const [message, setMessage] = useState('');
  const [ip, setIP] = useState('');
  const [uuid] = useState(uuidv4());
  const [nickname, setNickname] = useState();
  const [currentColor, setCurrentColor] = useState();
  const [tagListOpen, setTagListOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  const [typingTimer, setTypingTimer] = useState();
  const doneTypingInterval = 2000;

  function doneTyping() {
    socket.current.emit('stopTyping', ip);
  }

  const setMessageList = (msgl) => {
    messageList.current = msgl;
    _setMessageList(msgl);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      if (message.startsWith('/')) {
        if (message.startsWith('/clear')) {
          setMessageList([
            {
              message: ['Messages have been cleared'],
              _ip: 'SYSTEM',
              date: new Number(new Date()) / 1000,
            },
          ]);
        } else if (message.startsWith('/nick')) {
          const newNickname = message
            .split(' ')[1]
            .replace(/[^A-Za-z0-9]/g, '');
          if (newNickname) {
            localStorage.setItem('nickname', newNickname);
            setNickname(newNickname);
            socket.current.emit('nickname', newNickname);
          }
        } else if (message.startsWith('/color')) {
          const newColor = message.split(' ')[1];
          if (newColor && colors.includes(newColor)) {
            localStorage.setItem('color', newColor);
            setCurrentColor(newColor);
            setMessageList([
              ...messageList.current,
              {
                message: [`You changed your color to ${newColor}`],
                _ip: 'SYSTEM',
                date: new Number(new Date()) / 1000,
              },
            ]);
          }
        }
      } else {
        socket.current.emit(
          'message',
          message.trim(),
          ip,
          new Number(new Date()) / 1000,
        );
      }

      setTimeout(() => {
        document.getElementById('messagebox').scrollTop = document.getElementById('messagebox').scrollHeight;
      }, 100);

      setMessage('');
      doneTyping();
    }
  };

  const onMessageKeyUp = () => {
    clearTimeout(typingTimer);
    setTypingTimer(setTimeout(doneTyping, doneTypingInterval));
  };

  const onMessageKeyDown = (e) => {
    clearTimeout(typingTimer);
    socket.current.emit('typing', ip, nickname);

    if (e.code === 'Enter') {
      if (tagListOpen) {
        setTagListOpen(false);
        setMessage(
          `${`${message
            .split(' ')
            .slice(0, message.split(' ').length - 1)
            .join(' ')} @${
            onlineUser.filter((u) => u.user !== ip)[selectedTag].username
          } `.trim()} `,
        );
        document.getElementById('messageinput').focus();
        return;
      }
      sendMessage(e);
    }
    if (tagListOpen) {
      if (e.code === 'ArrowUp') {
        e.preventDefault();
        if (selectedTag > 0) {
          setSelectedTag(selectedTag - 1);
        }
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        if (selectedTag < onlineUser.filter((u) => u.user !== ip).length - 1) {
          setSelectedTag(selectedTag + 1);
        }
      }
    }
  };

  const setIsTypingList = (istyping) => {
    isTypingList.current = istyping;
    _setIsTypingList(istyping);
  };

  const setSocket = (sock) => {
    socket.current = sock;
    _setSocket(sock);
  };

  const getData = async () => {
    const ipres = await publicIp.v4();
    setIP(ipres);
  };

  useEffect(() => {
    setNickname(localStorage.getItem('nickname') || 'Anonymous');
    setCurrentColor(localStorage.getItem('color') || 'green');
    getData();
  }, []);

  useEffect(() => {
    if (ip && nickname) {
      fetch('/api/socketio').finally(() => {
        const socket = io();
        setSocket(socket);

        socket.on('connect', () => {
          socket.emit('connected', ip, nickname, uuid);
        });

        socket.on('message', (message, ip, date, nickname) => {
          const newMessageList = [...messageList.current];
          if (
            (newMessageList[newMessageList.length - 1]?._ip === ip
              && date - newMessageList[newMessageList.length - 1]?.date < 60)
            || (ip === 'SYSTEM'
              && newMessageList[newMessageList.length - 1]?._ip === ip)
          ) {
            newMessageList[newMessageList.length - 1].message = [
              ...newMessageList[newMessageList.length - 1].message,
              message,
            ];
          } else {
            newMessageList.push({
              message: [message],
              _ip: ip,
              date,
              nickname,
            });
          }
          setMessageList(newMessageList);

          setTimeout(() => {
            document.getElementById('messagebox').scrollTop = document.getElementById('messagebox').scrollHeight;
          }, 100);

          new Audio(alertSound).play();
        });

        socket.on('typing', (_ip, nickname) => {
          const newIsTypingList = [...isTypingList.current];
          if (
            _ip !== ip
            && newIsTypingList.filter((e) => e.ip === _ip).length === 0
          ) {
            newIsTypingList.push({ ip: _ip, nickname });
          }
          setIsTypingList(newIsTypingList);
        });

        socket.on('stopTyping', (_ip) => {
          let newIsTypingList = [...isTypingList.current];
          newIsTypingList = newIsTypingList.filter((e) => e.ip !== _ip);
          setIsTypingList(newIsTypingList);
        });

        socket.on('onlineUser', (userList) => {
          setOnlineUser(userList);
          if (
            userList.filter((e) => e.user === ip).length > 1
            && userList.filter((e) => e.user === ip).pop().uuid === uuid
          ) {
            socket.close();
            setShowWarning(true);
          }
        });
      });
      return () => socket.current.close();
    }
    return () => {};
  }, [ip]);

  useEffect(() => {
    if (message && message.split(' ').pop().startsWith('@')) {
      setTagListOpen(true);
    } else {
      setTagListOpen(false);
    }
  }, [message]);

  return !showWarning ? (
    <div
      className={`App w-full h-full relative bg-black text-${currentColor}-500`}
    >
      <Head>
        <title>SOCKET.IO IRC v0.6</title>
      </Head>
      <Icon
        icon="simple-icons:socketdotio"
        className="w-[90%] h-[90%] opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
      />
      <div className="flex h-full relative z-50 flex-col p-8 sm:p-16 font-['Jetbrains_Mono']">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-bold text-2xl">SOCKET.IO IRC v0.5</h1>
          <p className="text-right">
            {onlineUser.length}
            {' '}
            user(s) online
          </p>
        </div>
        <div className="flex-1 overflow-y-auto" id="messagebox">
          {_messageList.map(({
            _ip, message, date, nickname,
          }) => (
            <div
              className={`w-full flex ${
                ip === 'SYSTEM'
                  ? 'justify-center'
                  : ip === _ip
                    ? 'justify-end'
                    : 'justify-start'
              }`}
            >
              {_ip === 'SYSTEM' ? (
                <div className="w-full">
                  {message.map((e) => (
                    <div className="!text-[15px] w-full text-center my-1">
                      {e.replace(new RegExp(`^\\[${ip}\\]`), 'You')}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`my-4 selection:bg-neutral-900 selection:text-${currentColor}-500 relative animate__animated flex flex-col w-auto md:max-w-[50%]`}
                >
                  <div
                    className={`inline-flex items-end mt-1 ${
                      ip === _ip ? ' flex-row-reverse' : ' flex-row'
                    }`}
                  >
                    <span
                      className={`min-w-[8rem] inline-flex justify-center text-black pl-4 pr-4 text-xs font-medium bg-${currentColor}-500 py-1 pt-1.5`}
                      style={{
                        letterSpacing: '1px',
                        transform:
                          `translateY(1px) ${ip === _ip && 'scaleX(-1)'}`,
                        clipPath:
                          'polygon(calc(100% - 8px) 0px, 100% 8px, 100% 100%, 0px 100%, 0px 0px)',
                      }}
                    >
                      <span className={ip === _ip && 'scale-x-[-1]'}>
                        {nickname}
                        {' '}
                        [
                        {_ip}
                        ]
                      </span>
                    </span>
                  </div>
                  <div
                    className={`border-2 relative min-w-[24vw] border-${currentColor}-500 flex flex-col`}
                  >
                    <div
                      className={`text-${currentColor}-500 p-4 flex flex-col gap-4`}
                    >
                      {message.map((e) => (
                        <p
                          className={`block break-all selection:text-neutral-900 selection:bg-${currentColor}-500`}
                        >
                          {e}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div
                    className={`text-xs mt-1 ${ip === _ip ? 'text-right' : ''}`}
                  >
                    {moment(date * 1000).format('lll')}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div>
          {_isTypingList.map(({ nickname }) => (
            <div className="flex items-center">
              <span className="text-xs">
                {nickname}
                {' '}
                is typing...
              </span>
            </div>
          ))}
        </div>
        <div
          className={`flex items-center relative gap-6 w-full mt-4 border-2 border-${currentColor}-500`}
        >
          <div
            className={`absolute top-0 left-0 -translate-y-full w-full overflow-hidden flex flex-col ${
              tagListOpen ? 'border-2 max-h-96' : 'border-0 max-h-0'
            } border-${currentColor}-500 bg-black`}
          >
            {onlineUser
              .filter(
                (e) => e.user !== ip
                  && e.username.startsWith(message.split(' ').pop().slice(1)),
              )
              .map(({ user, username }, i) => (
                <button
                  type="button"
                  tabIndex="0"
                  onClick={() => {
                    setMessage(`${message}${username} `);
                    document.getElementById('messageinput').focus();
                  }}
                  className={`p-4 w-full flex items-center justify-between ${
                    i === selectedTag
                      ? `bg-${currentColor}-500 text-black`
                      : 'hover:bg-zinc-900'
                  } ${
                    i !== onlineUser.filter((e) => e.user !== ip).length - 1
                    && 'border-b-2'
                  } border-${currentColor}-500`}
                >
                  <span className="block">
                    @
                    {username}
                  </span>
                  <span className="block">{user}</span>
                </button>
              ))}
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex-1"
            id="message"
          >
            <input
              id="messageinput"
              type="text"
              value={message}
              placeholder="Please enter your message"
              onKeyUp={onMessageKeyUp}
              onKeyDown={onMessageKeyDown}
              onChange={(e) => setMessage(e.target.value)}
              className={`placeholder-${currentColor}-500 focus:outline-none bg-transparent w-full p-4 pl-5 [caret-shape:underscore]`}
            />
          </form>
          <button
            type="submit"
            form="message"
            onTouchEnd={(e) => {
              sendMessage(e);
            }}
          >
            <Icon icon="ic:round-send" className="w-8 h-8 mr-3" />
          </button>
        </div>
      </div>
    </div>
  ) : (
    <div
      className={`App font-["Jetbrains_Mono"] w-full h-full flex items-center justify-center relative bg-black text-${currentColor}-500`}
    >
      <p className="text-center p-8">
        You&apos;re not allowed to join the chat with the same IP multiple times.
      </p>
    </div>
  );
}

export default App;
