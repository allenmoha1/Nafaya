const storageKeys = {
  users: "schedule_users",
  session: "schedule_session_user",
};

const authSection = document.getElementById("auth-section");
const scheduleSection = document.getElementById("schedule-section");
const authMessage = document.getElementById("auth-message");
const welcomeMessage = document.getElementById("welcome-message");
const scheduleList = document.getElementById("schedule-list");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const registerBtn = document.getElementById("register-btn");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");
const scheduleForm = document.getElementById("schedule-form");

const parseUsers = () => JSON.parse(localStorage.getItem(storageKeys.users) || "{}");
const saveUsers = (users) => localStorage.setItem(storageKeys.users, JSON.stringify(users));

const getCurrentUser = () => localStorage.getItem(storageKeys.session);
const setCurrentUser = (username) => localStorage.setItem(storageKeys.session, username);
const clearCurrentUser = () => localStorage.removeItem(storageKeys.session);

const showAuthMessage = (text, isError = false) => {
  authMessage.textContent = text;
  authMessage.style.color = isError ? "#dc2626" : "#059669";
};

const renderSchedules = () => {
  const username = getCurrentUser();
  if (!username) return;

  const users = parseUsers();
  const schedules = users[username]?.schedules || [];

  scheduleList.innerHTML = "";
  if (schedules.length === 0) {
    scheduleList.innerHTML = "<li>まだ予定がありません。</li>";
    return;
  }

  schedules
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .forEach((schedule, index) => {
      const li = document.createElement("li");
      li.className = "schedule-item";
      li.innerHTML = `
        <strong>${schedule.title}</strong>
        <span class="schedule-meta">${schedule.date} ${schedule.time}</span>
        <span>${schedule.memo || "メモなし"}</span>
      `;

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "削除";
      deleteBtn.className = "danger";
      deleteBtn.addEventListener("click", () => {
        const latestUsers = parseUsers();
        latestUsers[username].schedules.splice(index, 1);
        saveUsers(latestUsers);
        renderSchedules();
      });

      li.appendChild(deleteBtn);
      scheduleList.appendChild(li);
    });
};

const updateView = () => {
  const currentUser = getCurrentUser();
  if (currentUser) {
    authSection.classList.add("hidden");
    scheduleSection.classList.remove("hidden");
    welcomeMessage.textContent = `${currentUser} さんの予定`;
    renderSchedules();
  } else {
    authSection.classList.remove("hidden");
    scheduleSection.classList.add("hidden");
    showAuthMessage("");
  }
};

registerBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showAuthMessage("ユーザー名とパスワードを入力してください。", true);
    return;
  }

  const users = parseUsers();
  if (users[username]) {
    showAuthMessage("このユーザー名は既に使われています。", true);
    return;
  }

  users[username] = { password, schedules: [] };
  saveUsers(users);
  showAuthMessage("新規登録が完了しました。ログインしてください。");
});

loginBtn.addEventListener("click", () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  const users = parseUsers();
  if (!users[username] || users[username].password !== password) {
    showAuthMessage("ユーザー名またはパスワードが違います。", true);
    return;
  }

  setCurrentUser(username);
  usernameInput.value = "";
  passwordInput.value = "";
  updateView();
});

logoutBtn.addEventListener("click", () => {
  clearCurrentUser();
  updateView();
});

scheduleForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) return;

  const formData = new FormData(scheduleForm);
  const newSchedule = {
    title: formData.get("title").trim(),
    date: formData.get("date"),
    time: formData.get("time"),
    memo: formData.get("memo").trim(),
  };

  if (!newSchedule.title || !newSchedule.date || !newSchedule.time) {
    return;
  }

  const users = parseUsers();
  users[currentUser].schedules.push(newSchedule);
  saveUsers(users);
  scheduleForm.reset();
  renderSchedules();
});

updateView();
