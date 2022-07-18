/* eslint-disable no-underscore-dangle */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import { Icon } from '@iconify/react';
import React from 'react';

function TagList({
  tagListOpen, onlineUser, message, setMessage, selectedTag, uuid,
}) {
  return (
    <div
      className={`absolute top-0 left-0 transition-[all] rounded-t-sm -translate-y-full w-full overflow-y-auto flex flex-col ${
        tagListOpen ? 'max-h-96 border-t-2 border-[#605F5F]' : 'max-h-0 border-0'
      } border-[#605F5F] bg-[#19192c]`}
    >
      {onlineUser
        .filter(
          (e) => e.uuid !== uuid,
        )
        .map(({ user, username }, i) => (
          <button
            type="button"
            tabIndex="0"
            onClick={() => {
              setMessage(
                `${`${message
                  .split(' ')
                  .slice(0, message.split(' ').length - 1)
                  .join(' ')} @${username || user
                } `.trim()} `,
              );
              document.getElementById('messageinput').focus();
            }}
            className={`p-4 w-full flex items-center justify-between ${
              i === selectedTag
                ? 'bg-[#dadbdf] text-[#19192c]'
                : 'hover:bg-[#dadbdf] hover:bg-opacity-10'
            } border-b-2 border-[#605F5F]`}
          >
            <span className="block">
              @
              {username || user}
            </span>
            <span className="block">{user}</span>
          </button>
        ))}
    </div>
  );
}

export default function MessageInpput({
  tagListOpen,
  onlineUser,
  message,
  setMessage,
  sendMessage,
  sendImage,
  ip,
  selectedTag,
  onMessageKeyDown,
  onMessageKeyUp,
  _isTypingList,
  uuid,
}) {
  return (
    <div className="relative z-50">
      <div className="mb-2">
        {_isTypingList.map(({ nickname, ip }) => (
          <div className="flex items-center">
            <span className="text-xs">
              {nickname || ip}
              {' '}
              is typing...
            </span>
          </div>
        ))}
      </div>
      <div className="flex-1 flex items-center border-t-2 rounde-sm border-[#605F5F]">
        <div className={`overflow-hidden transition-all flex items-center ${message ? 'w-0' : 'w-10'}`}>
          <button type="button" onClick={sendImage} className="ml-4">
            <Icon icon="ic:outline-image" className="w-6 h-6" />
          </button>
        </div>
        <div
          className="flex items-center relative gap-6 w-full"
        >
          <TagList
            tagListOpen={tagListOpen}
            onlineUser={onlineUser}
            message={message}
            setMessage={setMessage}
            selectedTag={selectedTag}
            ip={ip}
            uuid={uuid}
          />
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex-1"
            id="message"
            autoComplete="off"
          >
            <input
              autoComplete="false"
              id="messageinput"
              type="text"
              value={message}
              placeholder="Please enter your message"
              onKeyUp={onMessageKeyUp}
              onKeyDown={onMessageKeyDown}
              onChange={(e) => setMessage(e.target.value)}
              className="placeholder-[#605F5F] focus:outline-none bg-transparent w-full p-4 pl-5 [caret-shape:underscore]"
            />
          </form>
          <button
            type="submit"
            form="message"
            onTouchEnd={(e) => {
              sendMessage(e);
            }}
          >
            <Icon icon="ic:round-send" className="w-6 h-6 mr-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
