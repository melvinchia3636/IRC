/* eslint-disable react/prop-types */
import { Icon } from '@iconify/react';
import React from 'react';

function TagList({
  tagListOpen, currentColor, onlineUser, message, setMessage, selectedTag, ip,
}) {
  return (
    <div
      className={`absolute top-0 left-0 transition-[all] -translate-y-full w-full overflow-y-auto flex flex-col ${
        tagListOpen ? 'border-2 max-h-96' : 'border-0 max-h-0'
      } border-${currentColor} bg-black`}
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
                ? `bg-${currentColor} text-black`
                : 'hover:bg-zinc-900'
            } ${
              i !== onlineUser.filter((e) => e.user !== ip
              && e.username.startsWith(message.split(' ').pop().slice(1))).length - 1
    && 'border-b-2'
            } border-${currentColor}`}
          >
            <span className="block">
              @
              {username}
            </span>
            <span className="block">{user}</span>
          </button>
        ))}
    </div>
  );
}

function CommandList({
  commandListOpen, currentColor, setMessage, selectedCommand, commands, message,
}) {
  return (
    <div
      className={`absolute top-0 left-0 transition-[all] -translate-y-full w-full overflow-y-auto flex flex-col ${
        commandListOpen ? 'border-2 max-h-96' : 'border-0 max-h-0'
      } border-${currentColor} bg-black`}
    >
      {commands
        .filter(
          (e) => e.name.startsWith(message.split(' ').shift().slice(1)),
        )
        .map(({ name, description }, i) => (
          <button
            type="button"
            tabIndex="0"
            onClick={() => {
              setMessage(`/${name} `);
              document.getElementById('messageinput').focus();
            }}
            className={`p-4 w-full flex items-center justify-between ${
              i === selectedCommand
                ? `bg-${currentColor} text-black`
                : 'hover:bg-zinc-900'
            } ${
              i !== commands.filter(
                (e) => e.name.startsWith(message.split(' ').pop().slice(1)),
              ).length - 1
    && 'border-b-2'
            } border-${currentColor}`}
          >
            <span className="block">
              /
              {name}
            </span>
            <span className="block">{description}</span>
          </button>
        ))}
    </div>
  );
}

export default function MessageInpput({
  currentColor,
  tagListOpen,
  commandListOpen,
  onlineUser,
  commands,
  message,
  setMessage,
  sendMessage,
  ip,
  selectedTag,
  selectedCommand,
  onMessageKeyDown,
  onMessageKeyUp,
  _isTypingList,
}) {
  return (
    <>
      <div
        className={`flex items-center relative gap-6 w-full mt-4 border-2 border-${currentColor}`}
      >
        <TagList
          tagListOpen={tagListOpen}
          currentColor={currentColor}
          onlineUser={onlineUser}
          message={message}
          setMessage={setMessage}
          selectedTag={selectedTag}
          ip={ip}
        />
        <CommandList
          commandListOpen={commandListOpen}
          currentColor={currentColor}
          setMessage={setMessage}
          selectedCommand={selectedCommand}
          commands={commands}
          message={message}
        />
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
            className={`placeholder-${currentColor} focus:outline-none bg-transparent w-full p-4 pl-5 [caret-shape:underscore]`}
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
      <div className="mt-2">
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
    </>
  );
}
