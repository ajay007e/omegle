import {
  toggleControl,
  isTrackEnabled,
  isStreamActive,
  getLocalStreamData,
  updateStreamStatus
} from "./video.js";
import { sendEvent } from "./chat.js";

// GLOBAL VARIABLES
let global_users_collection = [];


// BINDING FUNCTION FOR script.js
export const bindActionToggleButtonListener = (element, action) => {
  element?.addEventListener("click", () => handleChatStartToggle(action));
}

const handleChatStartToggle = (action) => {
  document.getElementById("start-chat-btn").classList.toggle("hidden");
  document.getElementById("join-room-container").classList.toggle("hidden");
  action();
};

export const bindChatMessageInputListener = (element, action) => {
  element?.addEventListener("submit", (e) => handleMessageSubmit(e, action));
}

const handleMessageSubmit = (e, action) => {
  e.preventDefault();
  let msg = e.target.elements.chatMessageInput.value.trim();
  if (msg) {
    action(msg);
    e.target.elements.chatMessageInput.value = "";
    e.target.elements.chatMessageInput.focus();
  }  
}

export const bindLeaveButtonListener = (element, action) => {
  element?.addEventListener("click", () => handleLeaveRoom(action));
}

const handleLeaveRoom = (leave) => {
  const leaveRoom = confirm("Are you sure you want to leave the chatroom?");
  if (leaveRoom) {
    leave()
  }
}


// UI OUTPUT FUNCTIONS FOR chat.js
export const outputRoomName = (room) => {
  const href = window.location.href;
  document.getElementById('room-code-text').textContent = href;
}

export const outputUsers = (users, isUserHost) => {
  global_users_collection = users.map(user => ({...user, isUserHost}));
  renderUsers(global_users_collection);
  updateVideoFrames();
}

const updateVideoFrames = () => {
  const videoFrames = Array.from(document.querySelectorAll(".video-frame"));
  videoFrames.forEach(element => {
    if(element.id == "host-vf") {
      element.dataset.name = global_users_collection.find(user => user.isUser)?.username;
    } else {
      element.dataset.name = global_users_collection.find(user => user.userId === element.id)?.username;
    }
  });
}

const renderUsers = (users) => {
  const peopleList = document.getElementById('people-list');
  peopleList.innerHTML = "";
  users.forEach((user) => {
    peopleList.appendChild(generatePersonDiv(user));
  });
}

export const outputMessage = (message) => {
  const chatMessageContainer = document.querySelector(".chat-messages-area");
  if (message.info.isUserActionMessage && message.info.isPrivateRoom) {
    chatMessageContainer.innerHTML = "";
  } 
  if (!message.info.isPrivateRoom && message.info.isUserWaiting) return;
  chatMessageContainer.prepend(generateMessageDiv(message))
  document.getElementById("chat-message-input").disabled = message.info.isPrivateRoom ? message.info.isUserWaiting : false;
  chatMessageContainer.scrollTop = chatMessageContainer.scrollHeight;
}

export const handleUserLeaveSafely = (userId) => {
  document.getElementById(userId)?.remove();
  adjustRoomVideoLayout();
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


// UI OUTPUT FUNCTIONS FOR video.js
export const generateVideoPlayer = ({isControlRequired, video, isHost, userId, isPrivateRoom}) => {
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
  }

  if (isHost) {
    videoPlayer.id = "host-vf";
  } else {
    if (isPrivateRoom) {
      videoPlayer.id = "user-vf"
    } else {
      videoPlayer.classList.add("user-vf")
      videoPlayer.id = userId;
    }
  }

  const pinButton = document.createElement('button');
  pinButton.innerHTML = '<i class="fas fa-thumbtack"></i>';
  pinButton.classList.add('pin-btn');
  pinButton.addEventListener('click', () => {
    removeSpotlight();
    adjustRoomVideoLayout(false);
  });
  videoPlayer.appendChild(pinButton);
  
  videoPlayer.appendChild(video);
  return videoPlayer;
}

export const cleanUpEmptyVideoFrames = () => {
  // since peer.js will trigger stream event from call twice, video-frame divs
  // will be created without children; to remove the empty video-frames this utility
  // method will help.
  document.querySelectorAll('.video-frame').forEach(div => {
    if (div.children.length === 1) {
      div.remove();
    }
  });
}

export const appendVideoPlayer = (videoPlayer) => {
  document.getElementById("video-section").appendChild(videoPlayer);
}

const handleMiniVideoPlayer = () => {
  const videoPlayer = document.getElementById("user-vf");
  const hostVideoPlayer = document.getElementById("host-vf");
  const videoFramesCount = document.querySelectorAll(".video-frame").length;
  const isSpotlightEnabled = document.querySelector(".spotlight");
  if ((videoPlayer?.id === 'user-vf' || videoFramesCount == 2) && !isSpotlightEnabled) {
    hostVideoPlayer.classList.add("mini");
  } else {
    hostVideoPlayer.classList.remove("mini");
  }
}

const handleSpotlight = () => {
  const isSpotlightEnabled = document.querySelector(".spotlight");
  const isPinExist = document.querySelector(".pin");
  const videoFrames = Array.from(document.querySelectorAll(".video-frame:not(.pin)"));
  videoFrames.forEach(frame => frame.classList.remove("hidden"));
  document.getElementById("video-frame-more")?.remove();
  if(isSpotlightEnabled && isPinExist) {
    if (videoFrames.length > 4) {
      const targetVideoFrames = videoFrames.slice(2, videoFrames.length-1);
      targetVideoFrames.forEach(frame => frame.classList.add("hidden"));
      appendVideoPlayer(generateOverflowVideoFrame(targetVideoFrames));
    }
  } else {
    removeSpotlight();
  }
}

const addSpotlight = (userId) => {
  document.querySelector('.video-container').classList.add('spotlight');
  document.querySelector('.pin')?.classList.remove('pin');
  document.getElementById(userId).classList.add('pin');
  adjustRoomVideoLayout(false);
}

const removeSpotlight = () => {
  document.querySelector('.video-container').classList.remove('spotlight');
  document.querySelector('.pin')?.classList.remove('pin');
}

export const adjustRoomVideoLayout = (isPrivateRoom = false) => {
  if (!isPrivateRoom) {
    const container = document.querySelector('.video-container');
    const frames = container.querySelectorAll('.video-frame');
    const count = frames.length;

    const isSpotlightEnabled = container.classList.contains('spotlight');
    container.className = `video-container ${isSpotlightEnabled && count != 1 ? 'spotlight' : ''}`;

    if (count < 3) {
      container.classList.add(`layout-1`);
    } else if (count > 2 && count < 16) {
      container.classList.add(`layout-${count}`);
    } else {
      container.classList.add(`layout-16`);
    }
    handleSpotlight();
  }
  handleMiniVideoPlayer();
}

export const toggleControlBtn = (kind) => {
  const audioControlBtn = document.getElementById("audio-cntl");
  const camaraControlBtn = document.getElementById("camara-cntl");

  if (kind === 'video') {
    camaraControlBtn.classList.toggle("enabled");
  } else {
    audioControlBtn.classList.toggle("enabled");
  }
  sendEvent('stream-updated', getLocalStreamData());
}


// PAGE CONFIGURATION FUNCTION FOR room PAGE
export const setupRoomPage = () => {
  setupSideBar();
  setupModel();
}

const showEditUserModal = () => {
  const modalOverlay = document.getElementById("modal-overlay");
  const modalInput = document.getElementById("modal-input");

  modalInput.value = "";
  modalOverlay.style.display = "flex";
  modalInput.focus();
}

const setupModel = () => {
  const modalOverlay = document.getElementById("modal-overlay");
  const modalInput = document.getElementById("modal-input");
  const modalSubmit = document.getElementById("modal-submit");
  const modalCancel = document.getElementById("modal-cancel");

  const hideModal = () => {
    modalOverlay.style.display = "none";
  }
  modalSubmit.addEventListener("click", () => {
    const newName = modalInput.value.trim();
    if (newName) {
      sendEvent('edit-user', newName);
      hideModal();
    }
  });
  modalCancel.addEventListener("click", hideModal);
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) hideModal();
  });
}

export const setupControlPanel = () => {
  const camaraControlBtn = document.getElementById("camara-cntl");
  isTrackEnabled("video", true) ? camaraControlBtn.classList.add("enabled") : camaraControlBtn.classList.add("disabled");
  camaraControlBtn.addEventListener("click", () => toggleControl('video'));

  const audioControlBtn = document.getElementById("audio-cntl");
  isTrackEnabled("audio", true) ? audioControlBtn.classList.add("enabled") : audioControlBtn.classList.add("disabled");
  audioControlBtn.addEventListener("click", () => toggleControl('audio'));
}

const setupSideBar = () => {
  const container = document.querySelector('.room-container');
  const sidebar = document.getElementById('video-sidebar');
  const sidebarBtn = document.getElementById('btn-sidebar');
  const panels = document.querySelectorAll('.sidebar-panel');
  const navButtons = document.querySelectorAll('.nav-btn');

  const showSidebarPanel = (targetId) => {
    panels.forEach((panel) => panel.classList.add('hidden'));
    const targetPanel = document.getElementById(targetId);
    if (targetPanel) {
      targetPanel.classList.remove('hidden');
    }
    navButtons.forEach((btn) => {
      if (btn.getAttribute('data-target') === targetId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  };

  navButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      const isHidden = document.getElementById(target).classList.contains('hidden');
      if (isHidden) {
        showSidebarPanel(target);
      }
    });
  });

  sidebarBtn.addEventListener('click', () => {
    container.classList.toggle('sidebar-visible');
    sidebar.classList.toggle('visible');}
  );

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

const generatePersonDiv = ({userId, username, isHost, isUser, isUserHost}) => {
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

  const fragment = document.createDocumentFragment();

  // Pin Button
  if (!isUser) {
    const pinBtn = document.createElement('button');
    pinBtn.className = 'dropdown-item';
    pinBtn.title = 'Pin';
    pinBtn.innerHTML = '<i class="fas fa-thumbtack"></i> Pin';
    pinBtn.addEventListener('click', () => handlePinUser(userId));
    fragment.appendChild(pinBtn);
  }

  // Edit Button
  if (isUser) {
    const editBtn = document.createElement('button');
    editBtn.className = 'dropdown-item';
    editBtn.title = 'Edit name';
    editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit name';
    editBtn.addEventListener('click', () => handleEditUser(userId));
    fragment.appendChild(editBtn);
  }

  // Remove Button
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
  
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeAllDropdowns();
    dropdown.classList.toggle('hidden');
  });

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

const generateOverflowVideoFrame = (videoFrames) => {
  const videoFrame = document.createElement("div");
  videoFrame.classList.add("overflow-frame");
  videoFrame.id = "video-frame-more"

  const miniUsers = document.createElement("div");
  miniUsers.className = "mini-users"

  const MAXIMUN_NO_OF_AVATHARS_IN_OVERFLOW_FRAME = 2;
  let missingUsers = 0;
  videoFrames.slice(0, MAXIMUN_NO_OF_AVATHARS_IN_OVERFLOW_FRAME).forEach(frame => {
    const miniThumbnail = document.createElement("div");
    miniThumbnail.classList.add("mini-thumbnail", "avathar");
    const name = frame.dataset.name;
    if (name) {
      miniThumbnail.textContent = getInitials(name);
      miniThumbnail.style.backgroundColor = getAvatarBgFromName(name);
      miniUsers.appendChild(miniThumbnail);
    } else {
      missingUsers++;
    }
  });

  const remainingFrames = videoFrames.length - MAXIMUN_NO_OF_AVATHARS_IN_OVERFLOW_FRAME + missingUsers;
  console.log(videoFrames.length, missingUsers)
  if(remainingFrames > 0) {
    const miniMoreThumbnail = document.createElement("div");
    miniMoreThumbnail.classList.add("mini-thumbnail");
    miniMoreThumbnail.id = "mini-thumbnail-more";
    miniMoreThumbnail.textContent = `+${remainingFrames}`;
    miniUsers.appendChild(miniMoreThumbnail);
  }
  videoFrame.appendChild(miniUsers);
  return videoFrame;
}

// TODO: move to seperate helper.js
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

const getAvatarBgFromName = (name) => {
  const hue = Math.abs(hashString(name)) % 360;
  const saturation = 65; // Fixed saturation for consistency
  const lightness = 55; // Fixed lightness for readability
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

const getAvatarClassFromName = (name) => {
  // TODO: assign a constant value to 25
  return `avatar-${hashString(name) % 25}`; // returns avatar-0 to avatar-24
}

const getInitials = (name) => {
  const parts = name.trim().split(' ');
  const initials = parts.map(p => p[0].toUpperCase()).slice(0, 2).join('');
  return initials;
}

const handleEditUser = (userId) => {
  showEditUserModal();
}

const handleRemoveUser = (userId) => {
  sendEvent('kick-out', userId);
}

const handlePinUser = (userId) => {
  addSpotlight(userId);
}

export const updateUserStream = (user, data) => {
  const stream = document.getElementById(user.userId)?.querySelector('video')?.srcObject;
  stream && updateStreamStatus(stream, data);
}

export const reorderVideoFrames = () => {
    const frames = Array.from(document.querySelectorAll(".video-frame"));

    const activeFrames = [];
    const inactiveFrames = [];

    frames.forEach(frame => {
      const video = frame.querySelector("video");
      const stream = video?.srcObject;

      const camOn = isStreamActive(stream, 'video');
      const micOn = isStreamActive(stream, 'audio');
      const speaking = frame.classList.contains("speaking");

      if (camOn || speaking || micOn) {
        activeFrames.push(frame);
      } else {
        inactiveFrames.push(frame);
      }
    });

    document.getElementById("video-section").innerHTML = '';
    [...activeFrames, ...inactiveFrames].forEach(frame => appendVideoPlayer(frame));
}
