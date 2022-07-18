/* eslint-disable no-use-before-define */
/* eslint-disable no-param-reassign */
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
import uuidv4 from '../misc/uuidv4';
import MessageInput from '../components/MessageInput';
import MessagesContainer from '../components/MessagesContainer';
import Header from '../components/Header';

const compress = new Compress();

async function resizeImageFn(file) {
  const resizedImage = await compress.compress([file], {
    size: 10, // the max size in MB, defaults to 2MB
    quality: 1, // the quality of the image, max is 1,
    maxWidth: 300, // the max width of the output image, defaults to 1920px
    maxHeight: 300, // the max height of the output image, defaults to 1920px
    resize: true,
  });
  const img = resizedImage[0];
  const base64str = img.prefix + img.data;
  return base64str;
}

function App() {
  const [_messageList, _setMessageList] = useState({});
  const [_isTypingList, _setIsTypingList] = useState([]);
  const [_socket, _setSocket] = useState();

  const [onlineUser, setOnlineUser] = useState([]);
  const [_channels, _setChannels] = useState([]);
  const [_hasNewMessageChannels, _setHasNewMessageChannels] = useState([]);
  const channels = useRef(_channels);
  const hasNewMessageChannels = useRef(_hasNewMessageChannels);
  const messageList = useRef(_messageList);
  const isTypingList = useRef(_isTypingList);
  const socket = useRef(_socket);

  const [message, setMessage] = useState('');

  const [ip, setIP] = useState('');
  const [uuid] = useState(uuidv4());
  const [_currentChannel, _setCurrentChannel] = useState(null);
  const currentChannel = useRef();

  const [tagListOpen, setTagListOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(0);

  const [typingTimer, setTypingTimer] = useState();
  const doneTypingInterval = 2000;

  function doneTyping() {
    socket.current.emit('stopTyping', ip);
  }

  const setMessageList = (msgl) => {
    messageList.current = msgl;
    _setMessageList(msgl);
  };

  const setCurrentChannel = (channel) => {
    currentChannel.current = channel;
    _setCurrentChannel(channel);
  };

  const setChannels = (channellist) => {
    channels.current = channellist;
    _setChannels(channellist);
  };

  const setHasNewMessageChannels = (hnms) => {
    hasNewMessageChannels.current = hnms;
    _setHasNewMessageChannels(hnms);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.current.emit(
        'message',
        message.trim(),
        uuidv4(),
        ip,
        new Number(new Date()) / 1000,
      );
      setTimeout(() => {
        document.getElementById('messagebox').scrollTop = document.getElementById('messagebox').scrollHeight;
      }, 100);

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
        if (
          selectedTag
          < onlineUser.filter((u) => u.uuid !== uuid).length - 1
        ) {
          setSelectedTag(selectedTag + 1);
        }
      }
      if (
        e.code === 'Tab'
        && onlineUser.filter((u) => u.uuid !== uuid).length > selectedTag
      ) {
        setTagListOpen(false);
        setMessage(
          `${`${message
            .split(' ')
            .slice(0, message.split(' ').length - 1)
            .join(' ')} @${
            onlineUser.filter((u) => u.uuid !== uuid)[selectedTag].username
            || onlineUser.filter((u) => u.uuid !== uuid)[selectedTag].user
          } `.trim()} `,
        );
        document.getElementById('messageinput').focus();
      }
    }
  };

  const changeChannel = (channel) => {
    socket.current.emit('changeChannel', channel);
    setCurrentChannel(channel);
    setMessage('');
    setTagListOpen(false);
    setSelectedTag(0);
    setTypingTimer(undefined);
    doneTyping();
    setHasNewMessageChannels(
      _hasNewMessageChannels.filter((c) => c !== channel),
    );
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

  function updateCharWidth() {
    const containerWidth = document.querySelector(
      '#messagebox table tr td:last-child',
    )?.clientWidth;
    const charWidth = document.querySelector('#placeholder')?.clientWidth;
    if (containerWidth && charWidth) {
      const maxFittableChar = Math.ceil(containerWidth / charWidth);

      const newMessageList = [
        ...(messageList.current[currentChannel.current] || []),
      ];
      newMessageList.forEach((e) => {
        if (e.type === 'text') {
          if (typeof e.message !== 'string') {
            e.message = e.message.join('');
          }
          e.message = e.message.match(
            new RegExp(`.{1,${maxFittableChar - 7}}`, 'g'),
          );
        }
      });

      setMessageList({
        ...messageList.current,
        [currentChannel.current]: newMessageList,
      });
    }
  }

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (ip) {
      const socket = io('http://147.158.217.33:3001/');
      setSocket(socket);

      socket.on('connect', () => {
        socket.emit('connected', ip, '', uuid);
      });

      socket.on('message', (message, id, ip, date, nickname, type, channel) => {
        const newMessageList = [...(messageList.current[channel] || [])];

        newMessageList.push({
          id,
          message,
          type,
          ip,
          nickname,
          date,
        });

        setTimeout(() => {
          updateCharWidth();
        }, 50);

        if (channel) {
          setMessageList({
            ...messageList.current,
            ...Object.fromEntries([[channel, newMessageList]]),
          });
          if (
            currentChannel.current !== channel
            && !hasNewMessageChannels.current.includes(channel)
          ) {
            setHasNewMessageChannels([
              ...hasNewMessageChannels.current,
              channel,
            ]);
          }
        } else {
          setMessageList(
            Object.fromEntries(
              Object.entries(messageList.current).map(
                ([channel, messageList]) => [
                  channel,
                  [...messageList, ...newMessageList],
                ],
              ),
            ),
          );
        }

        setTimeout(() => {
          document.getElementById('messagebox').scrollTop = document.getElementById('messagebox').scrollHeight;
        }, 100);
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
        setTimeout(() => {
          updateCharWidth();
        }, 100);
      });

      socket.on('listChannels', (channelList) => {
        setChannels(channelList);
        setCurrentChannel(channelList[0]);
        setMessageList(
          Object.fromEntries(
            channelList.map((e) => [e, messageList.current[e] || []]),
          ),
        );
      });

      return () => socket.close();
    }

    window.addEventListener('resize', (event) => {
      updateCharWidth();
    });

    return () => {};
  }, [ip]);

  useEffect(() => {
    setTagListOpen(message && message.split(' ').pop().startsWith('@'));
    setSelectedTag(0);
  }, [message]);

  return (
    <div className="App w-full h-full relative bg-[#19192c] text-[#dadbdf] font-['Jetbrains_Mono'] text-sm font-light">
      <Head>
        <title>SOCKET.IO IRC v0.10</title>
      </Head>
      <div className="h-full flex">
        <div className="h-full border-r border-[#605F5F] min-w-[16%]">
          <div className="flex items-center justify-between border-b border-[#605F5F] p-6">
            <div className="flex items-center gap-2 ">
              <Icon icon="ic:baseline-memory" className="w-6 h-6" />
              IRC/reactjs
            </div>
            <Icon icon="ic:baseline-keyboard-arrow-down" className="w-6 h-6" />
          </div>
          <div className="p-6 flex flex-col">
            {_channels.map((e) => (
              <button
                type="button"
                onClick={() => changeChannel(e)}
                key={e}
                className={`flex items-center justify-between py-2 gap-1 ${
                  _currentChannel === e
                    ? 'border-l-2 pl-2 -ml-2 border-[#dadbdf]'
                    : ''
                }`}
              >
                <div className="flex items-center">
                  <Icon icon="ic:round-tag" className="w-6 h-6" />
                  {e}
                </div>
                {_hasNewMessageChannels.includes(e) && (
                  <div className="w-1.5 h-1.5 bg-[#dadbdf] rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-1 h-full relative z-50 flex-col ">
          <Header onlineUser={onlineUser} />
          <MessagesContainer
            _messageList={_messageList[_currentChannel] || []}
            ip={ip}
            selfUUID={uuid}
          />
          <MessageInput
            tagListOpen={tagListOpen}
            onlineUser={onlineUser}
            message={message}
            setMessage={setMessage}
            sendMessage={sendMessage}
            sendImage={sendImage}
            ip={ip}
            uuid={uuid}
            selectedTag={selectedTag}
            onMessageKeyDown={onMessageKeyDown}
            onMessageKeyUp={onMessageKeyUp}
            _isTypingList={_isTypingList}
          />
        </div>
        <div className="w-1/6 h-full border-l border-[#605F5F] p-6 flex flex-col gap-2">
          {onlineUser.map(({ username, user }) => (
            <div className="break-all">{username || user}</div>
          ))}
        </div>
      </div>
      <div id="placeholder" className="absolute top-0 left-0 opacity-0">
        .
      </div>
    </div>
  );
}

export default App;
