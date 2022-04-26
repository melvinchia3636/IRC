const commmandList = [
  {
    name: 'help',
    description: 'Display the documentation of each command (coming soon)',
  },
  {
    name: 'clear',
    description: 'Clear the chat',
  },
  {
    name: 'color',
    description: 'Change the color of your chatroom UI',
  },
  {
    name: 'nick',
    description: 'Change your nickname',
  },
  {
    name: 'notification',
    description: 'Toggle notifications (coming soon)',
  },
  {
    name: 'sound',
    description: 'Change notification sound (coming soon)',
  },
  {
    name: 'export',
    description: 'Export your chat history',
  },
  {
    name: 'roll',
    description: 'Roll a dice (coming soon)',
  },
  {
    name: 'sudo kick',
    description: 'Kick a user (coming soon)',
  },
  {
    name: 'sudo ban',
    description: 'Permenantly ban a user (coming soon)',
  },
  {
    name: 'sudo unban',
    description: 'Unban a user (coming soon)',
  },
  {
    name: 'mute',
    description: 'Mute a user in your own chatroom (coming soon)',
  },
  {
    name: 'unmute',
    description: 'Unmute a user in your own chatroom (coming soon)',
  },
  {
    name: 'sudo mute',
    description: 'Mute a user in the entire chatroom (coming soon)',
  },
  {
    name: 'sudo unmute',
    description: 'Unmute a user in the entire chatroom (coming soon)',
  },
  {
    name: 'shout',
    description: 'Shout something in the chatroom (coming soon)',
  },
  {
    name: 'code',
    description: 'send code with syntax highlighting (coming soon)',
  },
  {
    name: 'sudo slowchat',
    description: 'Slow down the chat to avoid spamming (coming soon)',
  },
  {
    name: 'about',
    description: 'Display information about the project (coming soon)',
  },
  {
    name: 'sudo help',
    description: 'Dipslay all moderator command (coming soon)',
  },
  {
    name: 'sudo clearmsg',
    description: 'Clear messages of other users (coming soon)',
  },
  {
    name: 'admin help',
    description: 'Display all admin command (coming soon)',
  },
  {
    name: 'admin addmod',
    description: 'Promote a user to moderator role (coming soon)',
  },
  {
    name: 'admin removemod',
    description: 'Demote a user to normal user role (coming soon)',
  },
  {
    name: 'admin transfer',
    description: 'Transfer a the chatroom ownership to another user (coming soon)',
  },
  {
    name: 'poll',
    description: 'Create a poll (coming soon)',
  },
  {
    name: 'sudo bot install',
    description: 'Install a bot (coming soon)',
  },
  {
    name: 'sudo bot uninstall',
    description: 'Uninstall a bot (coming soon)',
  },
  {
    name: 'sudo bot list',
    description: 'List all installed bot (coming soon)',
  },
  {
    name: 'sudo bot config',
    description: 'Configure a bot (coming soon)',
  },
  {
    name: 'sudo groups add',
    description: 'Add a group (coming soon)',
  },
  {
    name: 'sudo groups remove',
    description: 'Remove a group (coming soon)',
  },
  {
    name: 'server configure',
    description: 'Configure the server (coming soon)',
  },
  {
    name: 'sudo channel add',
    description: 'Add a channel (coming soon)',
  },
  {
    name: 'sudo channel remove',
    description: 'Remove a channel (coming soon)',
  },
  {
    name: 'theme',
    description: 'Change the UI/UX theme of the chatroom (coming soon)',
  },
  {
    name: 'server init',
    description: 'Download server config template (coming soon)',
  },
  {
    name: 'server join',
    description: 'Join a server (coming soon)',
  },
  {
    name: 'server leave',
    description: 'Leave a server (coming soon)',
  },
  {
    name: 'server create',
    description: 'create a server using specified server config (coming soon)',
  },
  {
    name: 'server list',
    description: 'List all public server (coming soon)',
  },
  {
    name: 'connect',
    description: 'Connect to physical server (coming soon)',
  },
  {
    name: 'pm',
    description: 'Send a private message (only specific user will receive the message) (coming soon)',
  },
].sort((a, b) => a.name.localeCompare(b.name));

export default commmandList;
