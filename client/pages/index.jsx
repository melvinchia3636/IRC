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
import Compress from 'compress.js';
import alertSound from '../public/alert.mp3';
import uuidv4 from '../misc/uuidv4';
import MessageInput from '../components/MessageInput';
import MessagesContainer from '../components/MessagesContainer';
import Header from '../components/Header';
import Color from '../misc/colors';
import createMessage from '../misc/createMessage';
import * as commands from '../misc/command';
import commandList from '../misc/commandList';

const compress = new Compress();

async function resizeImageFn(file) {
  const resizedImage = await compress.compress([file], {
    size: 10, // the max size in MB, defaults to 2MB
    quality: 1, // the quality of the image, max is 1,
    maxWidth: 500, // the max width of the output image, defaults to 1920px
    maxHeight: 500, // the max height of the output image, defaults to 1920px
    resize: true,
  });
  const img = resizedImage[0];
  const base64str = img.prefix + img.data;
  return base64str;
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
  const [replyTo, setReplyTo] = useState('');

  const [ip, setIP] = useState('');
  const [uuid] = useState(uuidv4());
  const [nickname, setNickname] = useState();
  const [currentColor, setCurrentColor] = useState();

  const [selectedTag, setSelectedTag] = useState(0);
  const [selectedCommand, setSelectedCommand] = useState(0);
  const [selectedColor, setSelectedColor] = useState(0);

  const [showWarning, setShowWarning] = useState(false);

  const [tagListOpen, setTagListOpen] = useState(false);
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
        const args = message.trim().split(' ').slice(1).join(' ');

        switch (command) {
          case '/clear':
            commands.clearMessage(setMessageList);
            break;

          case '/nick':
            commands.changeNickname(args, setNickname, socket, setMessageList, messageList);
            break;

          case '/color':
            commands.changeColor(args, setCurrentColor, setMessageList, messageList, createMessage);
            break;

          case '/export':
            commands.exportChat(messageList, setMessageList, createMessage);
            break;

          default:
            setMessageList([
              ...messageList.current,
              createMessage({
                id: uuidv4(),
                message: `Unknown command: ${command}`,
              }, 'SYSTEM'),
            ]);
            break;
        }
      } else {
        socket.current.emit(
          'message',
          message.trim(),
          uuidv4(),
          ip,
          new Number(new Date()) / 1000,
          nickname,
          replyTo,
        );
      }

      setTimeout(() => {
        document.getElementById('messagebox').scrollTop = document.getElementById('messagebox').scrollHeight;
      }, 100);

      setReplyTo(undefined);
      setMessage('');
      doneTyping();
    }
  };

  const sendImage = () => {
    // create and open file dialog
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.click();

    fileInput.onchange = () => {
      const file = fileInput.files[0];

      resizeImageFn(file).then((base64str) => {
        socket.current.emit(
          'imageMessage',
          base64str,
          uuidv4(),
          ip,
          new Number(new Date()) / 1000,
          nickname,
          replyTo,
        );
      });
    };
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
    socket.current.emit('typing', uuid);

    if (e.code === 'Enter') {
      if (tagListOpen && onlineUser.filter((u) => u.user !== ip
      && u.username.startsWith(message.split(' ').pop().slice(1))).length > selectedTag) {
        setTagListOpen(false);
        setMessage(
          `${`${message
            .split(' ')
            .slice(0, message.split(' ').length - 1)
            .join(' ')} @${
            onlineUser.filter((u) => u.user !== ip
            && u.username.startsWith(message.split(' ').pop().slice(1)))[selectedTag].username
          } `.trim()} `,
        );
        document.getElementById('messageinput').focus();
        return;
      }
      if (commandListOpen) {
        setCommandListOpen(false);
        setMessage(
          `/${
            commandList.filter(
              (e) => e.name.startsWith(message.split(' ').pop().slice(1)),
            )[selectedCommand].name
          } `,
        );
        document.getElementById('messageinput').focus();
        return;
      }
      if (message.split(' ').shift().startsWith('/color') && message.split(' ').length <= 2) {
        setMessage(
          `/color ${
            commands.colors.filter(
              (c) => c.startsWith(message.split(' ').pop().trim()),
            )[selectedColor].split('-')[0]
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
        if (selectedCommand < commandList.filter(
          (e) => e.name.startsWith(message.split(' ').pop().slice(1)),
        ).length - 1) {
          setSelectedCommand(selectedCommand + 1);
        }
      }
    }

    if (message.split(' ').shift().startsWith('/color')) {
      if (e.code === 'ArrowUp') {
        e.preventDefault();
        if (selectedColor > 0) {
          setSelectedColor(selectedColor - 1);
        }
      }
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        if (selectedColor < commands.colors.filter(
          (e) => e.startsWith(message.split(' ').pop().trim()),
        ).length - 1) {
          setSelectedColor(selectedColor + 1);
        }
      }
      document.getElementById(`color-select-${commands.colors.filter(
        (c) => c.startsWith(message.split(' ').pop().trim()),
      )[selectedColor]}`)?.scrollIntoView({
        block: 'center',
        inline: 'center',
      });
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
      const socket = io('http://147.158.215.79:3001');
      setSocket(socket);

      socket.on('connect', () => {
        socket.emit('connected', ip, nickname, uuid);
      });

      socket.on('message', (message, id, ip, date, nickname, replyTo, type) => {
        const newMessageList = [...messageList.current];
        if (
          (newMessageList[newMessageList.length - 1]?._ip === ip
              && date - newMessageList[newMessageList.length - 1]?.date < 60)
            || (ip === 'SYSTEM'
              && newMessageList[newMessageList.length - 1]?._ip === ip)
        ) {
          newMessageList[newMessageList.length - 1].message = [
            ...newMessageList[newMessageList.length - 1].message,
            {
              id,
              message,
              replyTo,
              type,
            },
          ];
        } else {
          newMessageList.push(createMessage(
            {
              id,
              message,
              replyTo,
              type,
            },
            ip,
            nickname,
          ));
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
      return () => socket.close();
    }
    return () => {};
  }, [ip]);

  useEffect(() => {
    setTagListOpen(message && message.split(' ').pop().startsWith('@'));
    setCommandListOpen(message.split(' ').length === 1 && message.split(' ').shift().startsWith('/'));
    setSelectedTag(0);
    setSelectedCommand(0);
    setSelectedColor(0);
  }, [message]);

  return !showWarning ? (
    <div
      className={`App w-full h-full relative bg-black text-${currentColor}`}
    >
      <Head>
        <title>SOCKET.IO IRC v0.8</title>
      </Head>
      <Icon
        icon="simple-icons:socketdotio"
        className="w-[90%] h-[90%] opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
      />
      <div className="flex h-full relative z-50 flex-col p-8 sm:p-16 font-['Fira_Code']">
        <Header
          onlineUser={onlineUser}
        />
        <MessagesContainer
          _messageList={_messageList}
          ip={ip}
          currentColor={currentColor}
          setReplyTo={setReplyTo}
        />
        <MessageInput
          currentColor={currentColor}
          tagListOpen={tagListOpen}
          commandListOpen={commandListOpen}
          onlineUser={onlineUser}
          commands={commandList}
          message={message}
          setMessage={setMessage}
          replyTo={_messageList.map((e) => e.message.map((m) => ({
            ...m,
            _ip: e._ip,
            nickname: e.nickname,
          }))).flat().filter((e) => e.id === replyTo)?.pop()}
          setReplyTo={setReplyTo}
          sendMessage={sendMessage}
          sendImage={sendImage}
          ip={ip}
          selectedTag={selectedTag}
          selectedCommand={selectedCommand}
          selectedColor={selectedColor}
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
