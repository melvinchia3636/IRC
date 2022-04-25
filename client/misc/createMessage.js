/* eslint-disable no-new-wrappers */
export default function createMessage(message, ip, nickname) {
  return {
    message: [message],
    _ip: ip,
    date: new Number(new Date()) / 1000,
    nickname,
  };
}
