import { toggleControl, isTrackEnabled } from "./video.js";

const chatMessageContainer = document.querySelector(".chat-messages-area");
const chatRoomSection = document.getElementById("room-name");
const chatRoomUsersSection = document.getElementById("users");
const chatMessageInputSection = document.getElementById("msg");
const videoSection = document.getElementById("video-section");
const welcomeSection = document.querySelector(".join-container");
const chatSection = document.querySelector(".chat-container");
const chatMessageInput = document.getElementById("chat-form");

let global_users_collection = [];


export const bindActionToggleButtonListener = (element, action) => {
  element?.addEventListener("click", () => handleChatStartToggle(action));
}

export const bindStartChatButtonListener = (element, action) => {
  element?.addEventListener("click", () => handleStartChat(action));
}

export const bindChatMessageInputListener = (element, action) => {
  element?.addEventListener("submit", (e) => handleMessageSubmit(e, action));
}

export const bindLeaveButtonListener = (element, action) => {
  element?.addEventListener("click", () => handleLeaveRoom(action));
}

export const outputMessage = (message) => {
  if (message.info.isUserActionMessage && message.info.isPrivateRoom) {
    chatMessageContainer.innerHTML = "";
  } 
  if (!message.info.isPrivateRoom && message.info.isUserWaiting) return;
  chatMessageContainer.prepend(generateMessageDiv(message))
  chatMessageInputSection.disabled = message.info.isPrivateRoom ? message.info.isUserWaiting : false;
  chatMessageContainer.scrollTop = chatMessageContainer.scrollHeight;

  if (message.info.isUserLeftMessage){
    document.getElementById("host-vf").classList.remove("mini");
    document.getElementById("user-vf")?.remove();
  }
}

const generateMessageDiv = (message) => {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message");

    const infoParagraphTag = document.createElement("p");
    infoParagraphTag.classList.add("meta");
    if (message.info.isHostGenerated) {
      messageDiv.classList.add("right");
      infoParagraphTag.innerText = "You";
    } else if (message.info.isSystemGenerated) {
      messageDiv.classList.add("center");
    } else {
      infoParagraphTag.innerText = message.username;
    }
    
    if (message.info.isUserActionMessage) {
      messageDiv.classList.add("disappearing"); 
      messageDiv.addEventListener("animationend", () => messageDiv.remove());
    }


    if (!message.info.isSystemGenerated) {
      infoParagraphTag.innerHTML += `<span>  ${message.time}</span>`;
      messageDiv.appendChild(infoParagraphTag);
    }

    const messageParagraphTag = document.createElement("p");
    messageParagraphTag.classList.add("message-text");
    messageParagraphTag.innerText = message.text;
    messageDiv.appendChild(messageParagraphTag);
    return messageDiv;
}

export const outputRoomName = (room) => {
  const href = window.location.href;
  document.getElementById('room-code-text').textContent = href;
}

export const outputUsers = (users, isUserHost) => {
  global_users_collection = users.map(user => ({...user, isUserHost}));
  renderUsers(users);
}

const renderUsers = (users) => {
  const peopleList = document.getElementById('people-list');
  peopleList.innerHTML = "";
  users.forEach((user) => {
    peopleList.appendChild(addPersonToList(user));
  });
}

export const generateVideoPlayer = (isControlRequired, video) => {
  const videoPlayer = document.createElement("div");
  videoPlayer.classList.add("video-frame");

  if (isControlRequired) {
    const control = document.createElement("div");
    control.classList.add("control");

    const camaraControl = document.createElement("i");
    camaraControl.id = "camara-cntl"
    camaraControl.classList.add("control-btn", "fas", "fa-video");
    isTrackEnabled("video", true) && camaraControl.classList.add("enabled");
    camaraControl.addEventListener("click", () => toggleControl('video'));

    const audioControl = document.createElement("i");
    audioControl.id = "audio-cntl"
    audioControl.classList.add("control-btn", "fas", "fa-microphone");
    isTrackEnabled("audio", true) && camaraControl.classList.add("enabled");
    audioControl.addEventListener("click", () => toggleControl('audio'));

    control.appendChild(camaraControl);
    control.appendChild(audioControl);
    videoPlayer.appendChild(control);

    videoPlayer.id = "host-vf";
  } else {
    videoPlayer.id = "user-vf";
  }
  videoPlayer.appendChild(video);
  return videoPlayer;
}


export const cleanUpEmptyVideoFrames = () => {
  // since peer.js will trigger stream event from call twice, video-frame divs
  // will be created without children; to remove the empty video-frames this utility
  // method will help.
  document.querySelectorAll('.video-frame').forEach(div => {
    if (div.children.length === 0) {
      div.remove();
    }
  });
}

export const appendVideoPlayer = (videoPlayer) => {
  videoSection.appendChild(videoPlayer);
  if (videoPlayer.id === 'user-vf') {
    document.getElementById("host-vf").classList.add("mini");
  }
}

const handleLeaveRoom = (leave) => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    leave()
  }
}

const handleMessageSubmit = (e, action) => {
  e.preventDefault();
  let msg = e.target.elements.msg.value.trim();
  if (msg) {
    action(msg);
    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
  }  
}

const handleStartChat = (e, action) => {
  action('');
}

const handleChatStartToggle = (action) => {
  document.getElementById("start-chat-btn").classList.toggle("hidden");
  document.getElementById("join-room-container").classList.toggle("hidden");
  action();
};

export const toggleControlBtn = (kind) => {

  const audioControlBtn = document.getElementById("audio-cntl");
  const camaraControlBtn = document.getElementById("camara-cntl");

  if (kind === 'video') {
    camaraControlBtn.classList.toggle("enabled");
  } else {
    audioControlBtn.classList.toggle("enabled");
  }
}






export const sideBarToggle = () => {
  const container = document.querySelector('.room-container');
  const sidebar = document.getElementById('video-sidebar');
  const sidebarBtn = document.getElementById('btn-sidebar');
  const panels = document.querySelectorAll('.sidebar-panel');
  const navButtons = document.querySelectorAll('.nav-btn');

  // Helper to show only one panel
  const showSidebarPanel = (targetId) => {
    // Hide all panels
    panels.forEach((panel) => panel.classList.add('hidden'));

    // Show selected panel
    const targetPanel = document.getElementById(targetId);
    if (targetPanel) {
      targetPanel.classList.remove('hidden');
    }

    // Set container as sidebar-visible
    container.classList.add('sidebar-visible');

    // Update active button state
    navButtons.forEach((btn) => {
      if (btn.getAttribute('data-target') === targetId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  // Attach event listeners to nav buttons
  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      const isHidden = document.getElementById(target).classList.contains('hidden');

      if (isHidden) {
        showSidebarPanel(target);
      }
    });
  });

  sidebarBtn.addEventListener('click', () => sidebar.classList.toggle('visible'));

  document.getElementById('copy-room-code')?.addEventListener('click', () => {
    const code = document.getElementById('room-code-text')?.textContent;
    if (code) {
      navigator.clipboard.writeText(code).then(() => {
        showToast('Room info copied to clipboard', 'info');
      });
    }
  });

  document.getElementById('people-search-input').addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    const filtered = query === '' ? global_users_collection : global_users_collection.filter(user =>
      user.username.toLowerCase().includes(query)
    );
    renderUsers(filtered);
  });
};

function getInitials(name) {
  const parts = name.trim().split(' ');
  const initials = parts.map(p => p[0].toUpperCase()).slice(0, 2).join('');
  return initials;
}

const avatarVariants = Array.from({ length: 25 }, (_, i) => `avatar-${i}`);

function hashToAvatarIndex(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % avatarVariants.length;
}

function getAvatarClassFromName(name) {
  const index = hashToAvatarIndex(name);
  return avatarVariants[index]; // returns avatar-0 to avatar-24
}



const handleEditUser = (userId) => {
  console.log(userId);
}
const handleRemoveUser = (userId) => {
  console.log(userId);
}
const handlePinUser = (userId) => {
  console.log(userId);
}

const addPersonToList = ({userId, username, isHost, isUser, isUserHost}) => {
  const li = document.createElement('li');
  li.className = 'person-item';
  li.dataset.id = userId;

  // Avatar
  const avatar = document.createElement('div');
  avatar.classList.add('person-avatar', getAvatarClassFromName(username));
  avatar.textContent = getInitials(username);

  // Info
  const info = document.createElement('div');
  info.className = 'person-info';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'person-name';
  nameSpan.textContent = username;

  const badgesContainer = document.createElement('div');
  badgesContainer.className = 'person-badges';

  if (isHost) {
    const hostBadge = document.createElement('span');
    hostBadge.className = 'badge badge-host';
    hostBadge.textContent = 'Host';
    badgesContainer.appendChild(hostBadge);
  }

  if (isUser) {
    const youBadge = document.createElement('span');
    youBadge.className = 'badge badge-you';
    youBadge.textContent = 'You';
    badgesContainer.appendChild(youBadge);
  }

  info.appendChild(nameSpan);
  info.appendChild(badgesContainer);

  // Action dropdown
  const actions = document.createElement('div');
  actions.className = 'person-actions';

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'user-action-btn dropdown-toggle';
  toggleBtn.title = 'More actions';
  toggleBtn.innerHTML = '<i class="fas fa-ellipsis-v"></i>';

  const dropdown = document.createElement('div');
  dropdown.className = 'dropdown-menu hidden';

  // Conditionally add buttons
  // const pinBtn = `<button class="dropdown-item" onclick="handlePinUser('${userId}')" title="Pin"><i class="fas fa-thumbtack"></i> Pin</button>`;
  // const editBtn = `<button class="dropdown-item" onclick="handleEditUser('${userId}')" title="Edit name"><i class="fas fa-edit"></i> Edit name</button>`;
  // const removeBtn = `<button class="dropdown-item" onclick="handleRemoveUser('${userId}')" title="Remove"><i class="fas fa-times"></i> Remove</button>`;

  const fragment = document.createDocumentFragment();

  // Pin Button
  const pinBtn = document.createElement('button');
  pinBtn.className = 'dropdown-item';
  pinBtn.title = 'Pin';
  pinBtn.innerHTML = '<i class="fas fa-thumbtack"></i> Pin';
  pinBtn.addEventListener('click', () => handlePinUser(userId));
  fragment.appendChild(pinBtn);

  // Edit Button (only for current user)
  if (isUser || isUserHost) {
    const editBtn = document.createElement('button');
    editBtn.className = 'dropdown-item';
    editBtn.title = 'Edit name';
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit name';
    editBtn.addEventListener('click', () => handleEditUser(userId));
    fragment.appendChild(editBtn);
  }

  // Remove Button (only if current user is host)
  if (isUserHost && !isUser) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'dropdown-item';
    removeBtn.title = 'Remove';
    removeBtn.innerHTML = '<i class="fas fa-times"></i> Remove';
    removeBtn.addEventListener('click', () => handleRemoveUser(userId));
    fragment.appendChild(removeBtn);
  }

  dropdown.appendChild(fragment);

  const closeAllDropdowns = () => {
    document.querySelectorAll('.dropdown-menu').forEach(drop => {
      drop.classList.add('hidden');
    });
  }
  
  // Toggle logic
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // prevent closing immediately
    closeAllDropdowns(); // close others first
    dropdown.classList.toggle('hidden'); // then toggle current one
  });

  // Outside click closes everything
  document.addEventListener('click', () => {
    closeAllDropdowns();
  });

  actions.appendChild(toggleBtn);
  actions.appendChild(dropdown);

  li.appendChild(avatar);
  li.appendChild(info);
  li.appendChild(actions);

  return li;
};


