import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import publicIp from "public-ip";
import alertSound from "../public/alert.mp3";
import moment from "moment";
import { Icon } from "@iconify/react";

const colors = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "volet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

const colorRender = [
  [
    "text-red-500",
    "bg-red-500",
    "border-red-500",
    "placeholder-red-500",
    "selection:text-red-500",
    "selection:bg-red-500",
  ],
  [
    "text-orange-500",
    "bg-orange-500",
    "border-orange-500",
    "placeholder-orange-500",
    "selection:text-orange-500",
    "selection:bg-orange-500",
  ],
  [
    "text-amber-500",
    "bg-amber-500",
    "border-amber-500",
    "placeholder-amber-500",
    "selection:text-amber-500",
    "selection:bg-amber-500",
  ],
  [
    "text-yellow-500",
    "bg-yellow-500",
    "border-yellow-500",
    "placeholder-yellow-500",
    "selection:text-yellow-500",
    "selection:bg-yellow-500",
  ],
  [
    "text-lime-500",
    "bg-lime-500",
    "border-lime-500",
    "placeholder-lime-500",
    "selection:text-lime-500",
    "selection:bg-lime-500",
  ],
  [
    "text-green-500",
    "bg-green-500",
    "border-green-500",
    "placeholder-green-500",
    "selection:text-green-500",
    "selection:bg-green-500",
  ],
  [
    "text-emerald-500",
    "bg-emerald-500",
    "border-emerald-500",
    "placeholder-emerald-500",
    "selection:text-emerald-500",
    "selection:bg-emerald-500",
  ],
  [
    "text-teal-500",
    "bg-teal-500",
    "border-teal-500",
    "placeholder-teal-500",
    "selection:text-teal-500",
    "selection:bg-teal-500",
  ],
  [
    "text-cyan-500",
    "bg-cyan-500",
    "border-cyan-500",
    "placeholder-cyan-500",
    "selection:text-cyan-500",
    "selection:bg-cyan-500",
  ],
  [
    "text-sky-500",
    "bg-sky-500",
    "border-sky-500",
    "placeholder-sky-500",
    "selection:text-sky-500",
    "selection:bg-sky-500",
  ],
  [
    "text-blue-500",
    "bg-blue-500",
    "border-blue-500",
    "placeholder-blue-500",
    "selection:text-blue-500",
    "selection:bg-blue-500",
  ],
  [
    "text-indigo-500",
    "bg-indigo-500",
    "border-indigo-500",
    "placeholder-indigo-500",
    "selection:text-indigo-500",
    "selection:bg-indigo-500",
  ],
  [
    "text-volet-500",
    "bg-volet-500",
    "border-volet-500",
    "placeholder-volet-500",
    "selection:text-volet-500",
    "selection:bg-volet-500",
  ],
  [
    "text-purple-500",
    "bg-purple-500",
    "border-purple-500",
    "placeholder-purple-500",
    "selection:text-purple-500",
    "selection:bg-purple-500",
  ],
  [
    "text-fuchsia-500",
    "bg-fuchsia-500",
    "border-fuchsia-500",
    "placeholder-fuchsia-500",
    "selection:text-fuchsia-500",
    "selection:bg-fuchsia-500",
  ],
  [
    "text-pink-500",
    "bg-pink-500",
    "border-pink-500",
    "placeholder-pink-500",
    "selection:text-pink-500",
    "selection:bg-pink-500",
  ],
  [
    "text-rose-500",
    "bg-rose-500",
    "border-rose-500",
    "placeholder-rose-500",
    "selection:text-rose-500",
    "selection:bg-rose-500",
  ],
];

function App() {
  const [_messageList, _setMessageList] = useState([]);
  const [_isTypingList, _setIsTypingList] = useState([]);
  const [onlineUserCount, setOnlineUserCount] = useState(0);
  const messageList = useRef(_messageList);
  const isTypingList = useRef(_isTypingList);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState();
  const [ip, setIP] = useState("");
  const [nickname, setNickname] = useState("Anonymous");
  const [currentColor, setCurrentColor] = useState("teal");

  const [typingTimer, setTypingTimer] = useState();
  var doneTypingInterval = 2000; //time in ms, 5 seconds for example

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
  };

  const setIsTypingList = (istyping) => {
    isTypingList.current = istyping;
    _setIsTypingList(istyping);
  };

  const getData = async () => {
    const ipres = await publicIp.v4();
    setIP(ipres);
  };

  useEffect(() => {
    setNickname(localStorage.getItem("nickname") || "Anonymous");
    setCurrentColor(localStorage.getItem("color") || "teal");
    getData();
  }, []);

  useEffect(() => {
    if (ip && nickname) {
      fetch("/api/socketio").finally(() => {
        const socket = io();
        setSocket(socket);

        socket.on("connect", () => {
          socket.emit("connected", ip, nickname);
        });

        socket.on("message", (message, ip, date, nickname) => {
          let newMessageList = [...messageList.current];
          if (
            (newMessageList[newMessageList.length - 1]?._ip === ip &&
              date - newMessageList[newMessageList.length - 1]?.date < 60) ||
            (ip === "SYSTEM" &&
              newMessageList[newMessageList.length - 1]?._ip === ip)
          ) {
            newMessageList[newMessageList.length - 1].message = [
              ...newMessageList[newMessageList.length - 1].message,
              message,
            ];
          } else {
            newMessageList.push({
              message: [message],
              _ip: ip,
              date: date,
              nickname: nickname,
            });
          }
          setMessageList(newMessageList);

          setTimeout(() => {
            document.getElementById("messagebox").scrollTop =
              document.getElementById("messagebox").scrollHeight;
          }, 100);

          new Audio(alertSound).play();
        });

        socket.on("typing", (_ip, nickname) => {
          let newIsTypingList = [...isTypingList.current];
          if (
            _ip !== ip &&
            newIsTypingList.filter((e) => e.ip === _ip).length === 0
          ) {
            newIsTypingList.push({ ip: _ip, nickname });
          }
          setIsTypingList(newIsTypingList);
        });

        socket.on("stopTyping", (_ip) => {
          let newIsTypingList = [...isTypingList.current];
          newIsTypingList = newIsTypingList.filter((e) => e.ip !== _ip);
          setIsTypingList(newIsTypingList);
        });

        socket.on("onlineCount", (count) => {
          setOnlineUserCount(count);
        });

        return () => socket.close();
      });
    }
  }, [ip]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      if (message.startsWith("/")) {
        if (message.startsWith("/clear")) {
          setMessageList([
            {
              message: ["Messages have been cleared"],
              _ip: "SYSTEM",
              date: new Number(new Date()) / 1000,
            },
          ]);
        } else if (message.startsWith("/nick")) {
          const newNickname = message.split(" ")[1];
          if (newNickname) {
            localStorage.setItem("nickname", newNickname);
            setNickname(newNickname);
            socket.emit("nickname", newNickname);
          }
        } else if (message.startsWith("/color")) {
          const newColor = message.split(" ")[1];
          if (newColor && colors.includes(newColor)) {
            localStorage.setItem("color", newColor);
            setCurrentColor(newColor);
            setMessageList([
              ...messageList.current,
              {
                message: [`You changed your color to ${newColor}`],
                _ip: "SYSTEM",
                date: new Number(new Date()) / 1000,
              },
            ]);
          }
        }
      } else {
        socket.emit(
          "message",
          message.trim(),
          ip,
          new Number(new Date()) / 1000
        );
      }

      setTimeout(() => {
        document.getElementById("messagebox").scrollTop =
          document.getElementById("messagebox").scrollHeight;
      }, 100);

      setMessage("");
      doneTyping();
    }
  };

  return (
    <div
      className={`App w-full h-full relative bg-black text-${currentColor}-500`}
    >
      <Icon
        icon="simple-icons:socketdotio"
        className="w-[90%] h-[90%] opacity-10 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0"
      />
      <div className="flex h-full relative z-50 flex-col p-8 sm:p-16 font-['Jetbrains_Mono']">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-bold text-2xl">SOCKET.IO IRC v0.5</h1>
          <p className="text-right">{onlineUserCount} user(s) online</p>
        </div>
        <div className="flex-1 overflow-y-auto" id="messagebox">
          {_messageList.map(({ _ip, message, date, nickname }) => (
            <div
              className={`w-full flex ${
                ip === "SYSTEM"
                  ? "justify-center"
                  : ip === _ip
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              {_ip === "SYSTEM" ? (
                <div className="w-full">
                  {message.map((e) => (
                    <div className="!text-[15px] w-full text-center my-1">
                      {e.replace(new RegExp(`^\\[${ip}\\]`), "You")}
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  className={`my-4 selection:bg-neutral-900 selection:text-${currentColor}-500 relative animate__animated flex flex-col w-auto md:max-w-[50%]`}
                >
                  <div
                    className={`inline-flex items-end mt-1 ${
                      ip === _ip ? " flex-row-reverse" : " flex-row"
                    }`}
                  >
                    <span
                      className={`min-w-[8rem] inline-flex justify-center text-black pl-4 pr-4 text-xs font-medium bg-${currentColor}-500 py-1 pt-1.5`}
                      style={{
                        letterSpacing: "1px",
                        transform:
                          "translateY(1px) " + (ip === _ip && "scaleX(-1)"),
                        clipPath:
                          "polygon(calc(100% - 8px) 0px, 100% 8px, 100% 100%, 0px 100%, 0px 0px)",
                      }}
                    >
                      <span className={ip === _ip && "scale-x-[-1]"}>
                        {nickname} [{_ip}]
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
                    className={`text-xs mt-1 ${ip === _ip ? "text-right" : ""}`}
                  >
                    {moment(date * 1000).format("lll")}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div>
          {_isTypingList.map(({ ip, nickname }) => (
            <div className="flex items-center">
              <span className="text-xs">{nickname} is typing...</span>
            </div>
          ))}
        </div>
        <div
          className={`flex items-center gap-6 w-full mt-4 border-2 border-${currentColor}-500`}
        >
          <form onSubmit={sendMessage} className="flex-1" id="message">
            <input
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
  );
}

export default App;
