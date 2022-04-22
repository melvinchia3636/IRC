import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from "axios";
import publicIp from 'public-ip';
import alertSound from "./alert.mp3";
import useSound from 'use-sound';
import moment from "moment";

function App() {
  const [_messageList, _setMessageList] = useState([]);
  const messageList = useRef(_messageList);
  const [message, setMessage] = useState('');
  const [socket, setSocket] = useState();
  const [ip, setIP] = useState('');

  const setMessageList = (msgl) => {
    messageList.current = msgl;
    _setMessageList(msgl);
  }

  const getData = async () => {
    const ipres = await publicIp.v4()
    setIP(ipres)
  }

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    if (ip) {
      const socket = io('http://147.158.206.247:3001/');
      setSocket(socket);

      socket.on('connect', () => {
        socket.emit("connected", ip)
      });

      socket.on('message', (message, ip, date) => {
        let newMessageList = [...messageList.current];
        console.log(date, newMessageList[newMessageList.length - 1]?.date)
        if (newMessageList[newMessageList.length - 1]?._ip === ip && date - newMessageList[newMessageList.length - 1]?.date < 60) {
          newMessageList[newMessageList.length - 1].message = [
            ...newMessageList[newMessageList.length - 1].message,
            message
          ];
        } else {
          newMessageList.push({
            message: [message],
            _ip: ip,
            date: date
          });
        }
        setMessageList(newMessageList);

        setTimeout(() => {
          document.getElementById("messagebox").scrollTop = document.getElementById("messagebox").scrollHeight;
        }, 100);
        new Audio(alertSound).play()
      });
    }
  }, [ip])

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('message', message.trim(), ip, new Number(new Date()) / 1000);
      setMessage('');
    }
  }

  return (
    <div className="App w-full h-full flex flex-col p-8 bg-black text-green-500 font-['Jetbrains_Mono']">
      <h1 className="font-bold text-xl mb-4">NICE IRC v0.3</h1>
      <div className="flex-1 overflow-y-auto" id="messagebox">{_messageList.map(({_ip, message, date}) => (
        <div className={`w-full flex ${ip === _ip ? "justify-end" : "justify-start"}`}>
          <div className="my-4 selection:bg-neutral-900 selection:text-green-500 relative animate__animated flex flex-col w-auto md:max-w-[50%]">
            <div className={`inline-flex items-end mt-1 ${ip === _ip ? " flex-row-reverse" : " flex-row"}`}>
              <span className={`min-w-[8rem] inline-flex justify-center text-black pl-4 pr-4 text-xs font-medium bg-green-500 py-1 pt-1.5`} style={{ letterSpacing: '1px', transform: 'translateY(1px) '+(ip === _ip && "scaleX(-1)"), clipPath: 'polygon(calc(100% - 8px) 0px, 100% 8px, 100% 100%, 0px 100%, 0px 0px)' }}><span className={ip === _ip && "scale-x-[-1]"}>[{_ip}]</span></span>
            </div>
            <div className="border-2 relative min-w-[20vw] border-green-500 flex flex-col">
              <div className="text-green-500 p-4 selection:text-neutral-900 selection:bg-green-500 flex flex-col gap-4">
                {message.map(e => <p className="block break-all">
                  {e}
                </p>)}
              </div>
            </div>
            <div className={`text-xs mt-1 ${ip === _ip ? "text-right" : ""}`}>{moment(date * 1000).format("lll")}</div>
          </div>
        </div>
      ))}</div>
      <form onSubmit={sendMessage}>
        <input type="text" value={message} placeholder="Please enter your message" onChange={e => setMessage(e.target.value)} className="border-2 border-green-500 placeholder-green-500 focus:outline-none bg-transparent w-full mt-4 p-4 px-5 [caret-shape:underscore]" />
      </form>
    </div>
  )
}

export default App
