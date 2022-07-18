/* eslint-disable react/prop-types */
/* eslint-disable no-nested-ternary */
import moment from 'moment';
import React from 'react';

export default function MessagesContainer({ _messageList }) {
  return (
    <div className="flex-1 overflow-y-scroll mb-4 px-8" id="messagebox">
      <table className="overflow-y-auto relative z-50">
        <tbody>
          {_messageList.map(({
            message, type, ip, nickname, date,
          }) => (
            <tr>
              <td>
                {moment(date * 1000)
                  .format('HH:mm:ss')
                  .split(':')
                  .map((e, i) => (
                    <span>
                      {e}
                      {i !== 2 && <span className="text-yellow-300">:</span>}
                    </span>
                  ))}
              </td>
              <td className="text-right min-w-[8rem] pl-6">
                {ip === 'SYSTEM' ? (
                  (typeof message === 'string' ? message : message.join()).includes('joined the chat') ? (
                    <span className="text-lime-500">--&gt;</span>
                  ) : (typeof message === 'string' ? message : message.join()).includes('left the chat') ? (
                    <span className="text-red-500">&lt;--</span>
                  ) : (
                    <span className="text-fuchsia-500">--</span>
                  )
                ) : (
                  nickname || ip
                )}
                &nbsp;
              </td>
              <td className="break-all w-full">
                {(type === 'image' || (type === 'text' && typeof message === 'string')) && <span className="text-green-500">|</span>}
                {' '}
                {type === 'image' ? (
                  <img className="inline-block" src={message} alt="" />
                ) : typeof message === 'string' ? (
                  message
                ) : (
                  <div>
                    {message.map((e) => (
                      <div>
                        <span className="text-green-500">|</span>
                        {' '}
                        {e}
                      </div>
                    ))}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
