import createMessage from './createMessage';
import uuidv4 from './uuidv4';

export const colors = [
  'white',
  'red-500',
  'orange-500',
  'amber-500',
  'yellow-500',
  'lime-500',
  'green-500',
  'emerald-500',
  'teal-500',
  'cyan-500',
  'sky-500',
  'blue-500',
  'indigo-500',
  'violet-500',
  'purple-500',
  'fuchsia-500',
  'pink-500',
  'rose-500',
];

function clearMessage(setMessageList) {
  setMessageList([
    createMessage({
      id: uuidv4(),
      message: 'Message cleared',
    }, 'SYSTEM'),
  ]);
}

function changeColor(_args, setCurrentColor, setMessageList, messageList) {
  const args = _args.toLowerCase();
  if (args && colors.map((e) => e.split('-').shift()).includes(args)) {
    localStorage.setItem('color', args + (args === 'white' ? '' : '-500'));
    setCurrentColor(args + (args === 'white' ? '' : '-500'));
    setMessageList([
      ...messageList.current,
      createMessage({
        id: uuidv4(),
        message: `You changed your color to ${args}`,
      }, 'SYSTEM'),
    ]);
  } else {
    setMessageList([
      ...messageList.current,
      createMessage({
        id: uuidv4(),
        message: args ? `Invalid color: ${args}` : 'No color specified',
      }, 'SYSTEM'),
    ]);
  }
}

function changeNickname(args, setNickname, socket, setMessageList, messageList) {
  const newNickname = args
    .replace(/[^A-Za-z0-9]/g, '');
  if (newNickname) {
    localStorage.setItem('nickname', newNickname);
    setNickname(newNickname);
    socket.current.emit('nickname', newNickname);
  } else {
    setMessageList([
      ...messageList.current,
      createMessage({
        id: uuidv4(),
        message: 'Invalid nickname',
      }, 'SYSTEM'),
    ]);
  }
}

function exportChat(messageList, setMessageList) {
  const blob = new Blob([JSON.stringify(messageList.current)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chat.json';
  a.click();

  setMessageList([
    ...messageList.current,
    createMessage({
      id: uuidv4(),
      message: 'Chat messages exported',
    }, 'SYSTEM'),
  ]);
}

export {
  clearMessage,
  changeColor,
  changeNickname,
  exportChat,
};
