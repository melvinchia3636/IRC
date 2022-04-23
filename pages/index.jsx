/* eslint-disable no-case-declarations */
/* eslint-disable react/prop-types */
/* eslint-disable no-shadow */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable no-new-wrappers */
/* eslint-disable no-bitwise */
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import publicIp from 'public-ip';
import { Icon } from '@iconify/react';
import Head from 'next/head';
import alertSound from '../public/alert.mp3';
import uuidv4 from '../misc/uuidv4';
import MessageInput from '../components/MessageInput';
import MessagesContainer from '../components/MessagesContainer';
import Header from '../components/Header';
import Color from '../misc/colors';

const colors = [
  'white',
  'red-500',
  'orange-500',
  'amber-500',
  'yellow-500',
  'lime-500',
  'green-500',
  'emerald-500',
  'teal-500',
  'cyan-500',
  'sky-500',
  'blue-500',
  'indigo-500',
  'volet-500',
  'purple-500',
  'fuchsia-500',
  'pink-500',
  'rose-500',
];

const commands = [
  {
    name: 'help',
    description: 'Display this help message',
  },
  {
    name: 'clear',
    description: 'Clear the chat',
  },
  {
    name: 'color',
    description: 'Change the color of your chatroom UI',
  },
  {
    name: 'nick',
    description: 'Change your nickname',
  },
  {
    name: 'notification',
    description: 'Toggle notifications',
  },
  {
    name: 'sound',
    description: 'Change notification sound',
  },
];

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
  const [selectedCommand, setSelectedCommand] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [commandListOpen, setCommandListOpen] = useState(false);

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
        const command = message.split(' ')[0];
        let args = message.trim().split(' ').slice(1).join(' ');

        switch (command) {
          case '/clear':
            setMessageList([
              {
                message: ['Messages cleared'],
                _ip: 'SYSTEM',
                date: new Number(new Date()) / 1000,
              },
            ]);
            break;

          case '/nick':
            const newNickname = args
              .replace(/[^A-Za-z0-9]/g, '');
            if (newNickname) {
              localStorage.setItem('nickname', newNickname);
              setNickname(newNickname);
              socket.current.emit('nickname', newNickname);
            } else {
              setMessageList([
                ...messageList.current,
                {
                  message: ['No nickname provided'],
                  _ip: 'SYSTEM',
                  date: new Number(new Date()) / 1000,
                },
              ]);
            }
            break;

          case '/color':
            args = args.toLowerCase();
            if (args && colors.map((e) => e.split('-').shift()).includes(args)) {
              localStorage.setItem('color', args + (args === 'white' ? '' : '-500'));
              setCurrentColor(args + (args === 'white' ? '' : '-500'));
              setMessageList([
                ...messageList.current,
                {
                  message: [`You changed your color to ${args}`],
                  _ip: 'SYSTEM',
                  date: new Number(new Date()) / 1000,
                },
              ]);
            } else {
              setMessageList([
                ...messageList.current,
                {
                  message: [args ? `Invalid color: ${args}` : 'No color specified'],
                  _ip: 'SYSTEM',
                  date: new Number(new Date()) / 1000,
                },
              ]);
            }
            break;

          default:
            setMessageList([
              ...messageList.current,
              {
                message: [`Unknown command: ${command}`],
                _ip: 'SYSTEM',
                date: new Number(new Date()) / 1000,
              },
            ]);
            break;
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
    if (e.key === 'Tab') {
      e.preventDefault();
    }

    clearTimeout(typingTimer);
    socket.current.emit('typing', ip, nickname);

    if (e.code === 'Enter') {
      if (tagListOpen && onlineUser.filter((u) => u.user !== ip
      && e.username.startsWith(message.split(' ').pop().slice(1))).length > selectedTag) {
        setTagListOpen(false);
        setMessage(
          `${`${message
            .split(' ')
            .slice(0, message.split(' ').length - 1)
            .join(' ')} @${
            onlineUser.filter((u) => u.user !== ip
            && e.username.startsWith(message.split(' ').pop().slice(1)))[selectedTag].username
          } `.trim()} `,
        );
        document.getElementById('messageinput').focus();
        return;
      }
      if (commandListOpen) {
        setCommandListOpen(false);
        setMessage(
          `/${
            commands.filter(
              (e) => e.name.startsWith(message.split(' ').pop().slice(1)),
            )[selectedCommand].name
          } `,
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
        if (selectedTag < onlineUser.filter((u) => u.user !== ip
        && e.username.startsWith(message.split(' ').pop().slice(1))).length - 1) {
          setSelectedTag(selectedTag + 1);
        }
      }
    }

    if (commandListOpen) {
      if (e.code === 'ArrowUp') {
        e.preventDefault();
        if (selectedCommand > 0) {
          setSelectedCommand(selectedCommand - 1);
        }
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        if (selectedCommand < commands.filter(
          (e) => e.name.startsWith(message.split(' ').pop().slice(1)),
        ).length - 1) {
          setSelectedCommand(selectedCommand + 1);
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
    setCurrentColor(localStorage.getItem('color') || 'green-500');
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
    setTagListOpen(message && message.split(' ').pop().startsWith('@'));
    setCommandListOpen(message.split(' ').length === 1 && message.split(' ').shift().startsWith('/'));
    setSelectedTag(0);
    setSelectedCommand(0);
  }, [message]);

  return !showWarning ? (
    <div
      className={`App w-full h-full relative bg-black text-${currentColor}`}
    >
      <Head>
        <title>SOCKET.IO IRC v0.6</title>
      </Head>
      <Icon
        icon="simple-icons:socketdotio"
        className="w-[90%] h-[90%] opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
      />
      <div className="flex h-full relative z-50 flex-col p-8 sm:p-16 font-['Jetbrains_Mono']">
        <Header
          onlineUser={onlineUser}
        />
        <MessagesContainer
          _messageList={_messageList}
          ip={ip}
          currentColor={currentColor}
        />
        <MessageInput
          currentColor={currentColor}
          tagListOpen={tagListOpen}
          commandListOpen={commandListOpen}
          onlineUser={onlineUser}
          commands={commands}
          message={message}
          setMessage={setMessage}
          sendMessage={sendMessage}
          ip={ip}
          selectedTag={selectedTag}
          selectedCommand={selectedCommand}
          onMessageKeyDown={onMessageKeyDown}
          onMessageKeyUp={onMessageKeyUp}
          _isTypingList={_isTypingList}
        />
      </div>
      <Color />
    </div>
  ) : (
    <div
      className={`App font-["Jetbrains_Mono"] w-full h-full flex items-center justify-center relative bg-black text-${currentColor}`}
    >
      <p className="text-center p-8">
        You&apos;re not allowed to join the chat with the same IP multiple times.
      </p>
      <Color />
    </div>
  );
}

export default App;
