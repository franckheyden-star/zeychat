const socket = io();

// éléments UI
const input = document.getElementById("msgInput");
const messages = document.getElementById("messages");
const usersBox = document.getElementById("users");
const typingBox = document.getElementById("typing");

// pseudo utilisateur
let username = prompt("Entre ton pseudo 👤");
socket.emit("join", username);

// envoyer message
function send() {
  const text = input.value.trim();
  if (!text) return;

  socket.emit("message", {
    text: text,
    time: getTime(),
    type: "text"
  });

  input.value = "";
}

// afficher message reçu
socket.on("message", (data) => {
  const div = document.createElement("div");

  const isMe = data.user === username;

  div.classList.add("msg");
  div.classList.add(isMe ? "me" : "other");

  // contenu message (support futur images / vidéos)
  let content = "";

  if (data.type === "image") {
    content = `<img src="${data.text}" style="max-width:100%; border-radius:10px;">`;
  } 
  else if (data.type === "video") {
    content = `<video src="${data.text}" controls style="max-width:100%; border-radius:10px;"></video>`;
  } 
  else {
    content = data.text;
  }

  div.innerHTML = `
    <b>${data.user}</b><br>
    ${content}
    <div class="time">
      ${data.time} ${isMe ? "✓✓" : ""}
    </div>
  `;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});

// utilisateurs en ligne
socket.on("users", (list) => {
  usersBox.innerHTML = "";

  list.forEach(u => {
    const div = document.createElement("div");
    div.classList.add("user");
    div.innerText = "🟢 " + u;
    usersBox.appendChild(div);
  });
});

// typing indicator
input.addEventListener("input", () => {
  socket.emit("typing", true);
});

socket.on("typing", (user) => {
  typingBox.innerText = `${user} est en train d'écrire...`;

  setTimeout(() => {
    typingBox.innerText = "";
  }, 1500);
});

// bouton entrée
input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    send();
  }
});

// heure
function getTime() {
  const d = new Date();
  return (
    String(d.getHours()).padStart(2, "0") +
    ":" +
    String(d.getMinutes()).padStart(2, "0")
  );
}
