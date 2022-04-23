/* eslint-disable react/prop-types */
/* eslint-disable no-nested-ternary */
import moment from 'moment';
import React from 'react';

export default function MessagesContainer({
  _messageList,
  ip,
  currentColor,
}) {
  return (
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
            <div className="w-full flex flex-col gap-2 my-1">
              {message.map((e) => (
                <div className="!text-[15px] w-full text-center">
                  {e.replace(new RegExp(`^\\[${ip}\\]`), 'You')}
                </div>
              ))}
            </div>
          ) : (
            <div
              className={`my-4 selection:bg-neutral-900 selection:text-${currentColor} relative animate__animated flex flex-col w-auto md:max-w-[50%]`}
            >
              <div
                className={`inline-flex items-end mt-1 ${
                  ip === _ip ? ' flex-row-reverse' : ' flex-row'
                }`}
              >
                <span
                  className={`min-w-[8rem] inline-flex justify-center text-black pl-4 pr-4 text-xs font-medium bg-${currentColor} py-1 pt-1.5`}
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
                className={`border-2 relative min-w-[24vw] border-${currentColor} flex flex-col`}
              >
                <div
                  className={`text-${currentColor} p-4 flex flex-col gap-4`}
                >
                  {message.map((e) => (
                    <p
                      className={`block break-all selection:text-neutral-900 selection:bg-${currentColor}`}
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
  );
}
