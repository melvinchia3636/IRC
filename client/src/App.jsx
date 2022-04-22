import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import publicIp from 'public-ip';
import alertSound from "./alert.mp3";
import moment from "moment";
import { Icon } from "@iconify/react";

function App() {
  const [_messageList, _setMessageList] = useState([]);
  const [_isTypingList, _setIsTypingList] = useState([]);
  const messageList = useRef(_messageList);
  const isTypingList = useRef(_isTypingList);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState();
  const [ip, setIP] = useState('');
  const [nickname, setNickname] = useState(localStorage.getItem("nickname") || 'Anonymous');

  const [typingTimer, setTypingTimer] = useState();
  var doneTypingInterval = 2000;  //time in ms, 5 seconds for example

  const onMessageKeyUp = () => {
    clearTimeout(typingTimer);
    setTypingTimer(setTimeout(doneTyping, doneTypingInterval));
  };

  const onMessageKeyDown = () => {
    clearTimeout(typingTimer);
    socket.emit("typing", ip, nickname);
  };

  function doneTyping() {
    socket.emit("stopTyping", ip);
  }

  const setMessageList = (msgl) => {
    messageList.current = msgl;
    _setMessageList(msgl);
  }

  const setIsTypingList = (istyping) => {
    isTypingList.current = istyping;
    _setIsTypingList(istyping);
  }

  const getData = async () => {
    const ipres = await publicIp.v4()
    setIP(ipres)
  }

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    if (ip && nickname) {
      const socket = io('http://147.158.242.231:3001/');
      setSocket(socket);

      socket.on('connect', () => {
        socket.emit("connected", ip, nickname)
      });

      socket.on('message', (message, ip, date, nickname) => {
        let newMessageList = [...messageList.current];
        if (newMessageList[newMessageList.length - 1]?._ip === ip && date - newMessageList[newMessageList.length - 1]?.date < 60) {
          newMessageList[newMessageList.length - 1].message = [
            ...newMessageList[newMessageList.length - 1].message,
            message
          ];
        } else {
          newMessageList.push({
            message: [message],
            _ip: ip,
            date: date,
            nickname: nickname
          });
        }
        setMessageList(newMessageList);

        setTimeout(() => {
          document.getElementById("messagebox").scrollTop = document.getElementById("messagebox").scrollHeight;
        }, 100);

        new Audio(alertSound).play()
      });

      socket.on("typing", (_ip, nickname) => {
        let newIsTypingList = [...isTypingList.current];
        if (_ip !== ip && newIsTypingList.filter(e => e.ip === _ip).length === 0) {
          newIsTypingList.push({ ip: _ip, nickname });
        }
        setIsTypingList(newIsTypingList);
      });

      socket.on("stopTyping", (_ip) => {
        let newIsTypingList = [...isTypingList.current];
        newIsTypingList = newIsTypingList.filter(e => e.ip !== _ip);
        setIsTypingList(newIsTypingList);
      });

      return () => socket.close()
    }
  }, [ip])

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      if (message.startsWith("/")) {
        if (message.startsWith("/clear")) {
          setMessageList([
            {
              "message": [
                "Messages have been cleared"
              ],
              "_ip": "SYSTEM",
              "date": new Number(new Date()) / 1000,
            }
          ])
        } else if (message.startsWith("/nick")) {
          const newNickname = message.split(" ")[1];
          if (newNickname) {
            localStorage.setItem("nickname", newNickname);
            setNickname(newNickname);
            socket.emit("nickname", newNickname);
          }
        }
      } else {
        socket.emit('message', message.trim(), ip, new Number(new Date()) / 1000);
      }

      setTimeout(() => {
        document.getElementById("messagebox").scrollTop = document.getElementById("messagebox").scrollHeight;
      }, 100);

      setMessage('');
      doneTyping();
    }
  }

  return (
    <div className="App w-full h-full relative bg-black">
      <Icon icon="simple-icons:socketdotio" className="w-[90%] h-[90%] text-green-500 opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0" />
      <div className="flex h-full relative z-50 flex-col p-8 sm:p-16 text-[#20C20E] font-['Jetbrains_Mono']">
        <h1 className="font-bold text-xl mb-4">SOCKET.IO IRC v0.5</h1>
        <div className="flex-1 overflow-y-auto" id="messagebox">{_messageList.map(({ _ip, message, date, nickname }) => (
          <div className={`w-full flex ${ip === "SYSTEM" ? "justify-center" : ip === _ip ? "justify-end" : "justify-start"}`}>
            {_ip === "SYSTEM" ? (
              <div className="w-full text-center text-sm flex flex-col gap-2 mb-2">{message.map(e => <p>{e.replace(new RegExp(`^\\[${ip}\\]`), "You")}</p>)}</div>
            ) : (
              <div className="my-4 selection:bg-neutral-900 selection:text-[#20C20E] relative animate__animated flex flex-col w-auto md:max-w-[50%]">
                <div className={`inline-flex items-end mt-1 ${ip === _ip ? " flex-row-reverse" : " flex-row"}`}>
                  <span className={`min-w-[8rem] inline-flex justify-center text-black pl-4 pr-4 text-xs font-medium bg-[#20C20E] py-1 pt-1.5`} style={{ letterSpacing: '1px', transform: 'translateY(1px) ' + (ip === _ip && "scaleX(-1)"), clipPath: 'polygon(calc(100% - 8px) 0px, 100% 8px, 100% 100%, 0px 100%, 0px 0px)' }}><span className={ip === _ip && "scale-x-[-1]"}>{nickname} [{_ip}]</span></span>
                </div>
                <div className="border-2 relative min-w-[24vw] border-[#20C20E] flex flex-col">
                  <div className="text-[#20C20E] p-4 selection:text-neutral-900 selection:bg-[#20C20E] flex flex-col gap-4">
                    {message.map(e => <p className="block break-all">
                      {e}
                    </p>)}
                  </div>
                </div>
                <div className={`text-xs mt-1 ${ip === _ip ? "text-right" : ""}`}>{moment(date * 1000).format("lll")}</div>
              </div>
            )}
          </div>
        ))}</div>
        <div>
          {_isTypingList.map(({ ip, nickname }) => (
            <div className="flex items-center">
              <span className="text-xs">{nickname} is typing...</span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-6 w-full mt-4 border-2 border-[#20C20E]">
          <form onSubmit={sendMessage} className="flex-1" id="message">
            <input type="text" value={message} placeholder="Please enter your message" onKeyUp={onMessageKeyUp} onKeyDown={onMessageKeyDown} onChange={e => setMessage(e.target.value)} className="placeholder-[#20C20E] focus:outline-none bg-transparent w-full p-4 pl-5 [caret-shape:underscore]" />
          </form>
          <button type="submit" form="message">
            <Icon icon="ic:round-send" className='w-8 h-8 mr-3' />
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
