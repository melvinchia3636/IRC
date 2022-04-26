/* eslint-disable no-underscore-dangle */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import { Icon } from '@iconify/react';
import React from 'react';
import { colors } from '../misc/command';

function ReplyMessage({ replyTo, setReplyTo, currentColor }) {
  return (
    <div
      className={`absolute top-0 left-0 transition-[all] rounded-t-sm px-4 -translate-y-full w-full overflow-y-auto flex flex-col ${
        replyTo ? 'border-2 max-h-96 py-4' : 'border-0 max-h-0'
      } border-${currentColor} bg-black`}
    >
      {replyTo && (
        <>
          <div className="text-sm mb-1">
            Reply to
            {' '}
            <span className="font-bold">{replyTo.nickname}</span>
            {' '}
            [
            {replyTo._ip}
            ]
          </div>
          <div className="truncate">
            {replyTo.type === 'image' ? (
              <img src={replyTo.message} alt="reply" className="object-contain w-full h-32 object-left" />
            ) : (
              replyTo.message
            )}
          </div>
          <button onClick={() => setReplyTo(undefined)} type="button" className="absolute right-4 top-4">
            <Icon icon="uil:times" className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}

function TagList({
  tagListOpen, currentColor, onlineUser, message, setMessage, selectedTag, ip,
}) {
  return (
    <div
      className={`absolute top-0 left-0 transition-[all] rounded-t-sm -translate-y-full w-full overflow-y-auto flex flex-col ${
        tagListOpen ? 'border-2 max-h-96' : 'border-0 max-h-0'
      } border-${currentColor} bg-black`}
    >
      {onlineUser
        .filter(
          (e) => e.user !== ip && e.username.startsWith(message.split(' ').pop().slice(1)),
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
                  .join(' ')} @${username
                } `.trim()} `,
              );
              document.getElementById('messageinput').focus();
            }}
            className={`p-4 w-full flex items-center justify-between ${
              i === selectedTag
                ? `bg-${currentColor} text-black`
                : 'hover:bg-zinc-900'
            } ${
              i !== onlineUser.filter((e) => e.user !== ip
              && e.username.startsWith(message.split(' ').pop().slice(1))).length - 1 && 'border-b-2'
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
      className={`absolute top-0 left-0 transition-[all] rounded-t-sm -translate-y-full w-full overflow-y-auto flex flex-col ${
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
                (e) => e.name.startsWith(message.split(' ').shift().slice(1)),
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

function ColorList({
  message, setMessage, currentColor, selectedColor,
}) {
  return (
    <div
      className={`absolute top-0 left-0 transition-[all] rounded-t-sm -translate-y-full w-full overflow-y-auto flex flex-col ${
        message.split(' ').shift() === '/color' && message.split(' ').slice(1).length === 1 ? 'border-2 max-h-96' : 'border-0 max-h-0'
      } border-${currentColor} bg-black`}
    >
      {colors.filter(
        (c) => c.startsWith(message.split(' ').slice(1).join(' ')),
      ).map((e, i) => (
        <button
          id={`color-select-${e}`}
          className={`p-4 flex items-center gap-2 ${i === selectedColor
            ? `bg-${currentColor} text-black`
            : 'hover:bg-zinc-900'
          } ${
            i !== colors.filter(
              (c) => c.startsWith(message.split(' ').pop().trim()),
            ).length - 1
            && 'border-b-2'
          } border-${currentColor}`}
          type="button"
          onClick={() => {
            setMessage(
              `/color ${
                e.split('-')[0]
              } `,
            );
            document.getElementById('messageinput').focus();
          }}
        >
          <span className={`block w-5 h-5 bg-${e} border-2 border-black rounded-sm`} />
          {e.split('-')[0]}
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
  replyTo,
  setReplyTo,
  sendMessage,
  sendImage,
  ip,
  selectedTag,
  selectedCommand,
  selectedColor,
  onMessageKeyDown,
  onMessageKeyUp,
  _isTypingList,
}) {
  return (
    <div className="mt-4">
      <div className={`flex-1 flex items-center border-2 rounde-sm border-${currentColor}`}>
        <div className={`overflow-hidden transition-all flex items-center ${message ? 'w-0' : 'w-20'}`}>
          <button type="button" onClick={sendImage} className="ml-4">
            <Icon icon="ic:outline-image" className="w-6 h-6" />
          </button>
          <button type="button" onClick={sendImage} className="ml-3">
            <Icon icon="ic:outline-attach-file" className="w-6 h-6" />
          </button>
        </div>
        <div
          className="flex items-center relative gap-6 w-full"
        >
          <ReplyMessage
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            currentColor={currentColor}
          />
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
          <ColorList
            message={message}
            setMessage={setMessage}
            currentColor={currentColor}
            selectedColor={selectedColor}
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
    </div>
  );
}
