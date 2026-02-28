const statusEl = document.getElementById('status');
const channelListEl = document.getElementById('channelList');
const currentChannelEl = document.getElementById('currentChannel');
const videoEl = document.getElementById('videoPlayer');
const m3uUrlInput = document.getElementById('m3uUrl');
const m3uFileInput = document.getElementById('m3uFile');
const searchInput = document.getElementById('searchInput');
const loadUrlBtn = document.getElementById('loadUrlBtn');
const reloadBtn = document.getElementById('reloadBtn');

let channels = [];
let filteredChannels = [];
let selectedChannel = null;
let hls = null;

const samplePlaylist = `#EXTM3U
#EXTINF:-1 tvg-name="Sintel Trailer",Sintel Trailer
https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8
#EXTINF:-1 tvg-name="Big Buck Bunny",Big Buck Bunny
https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`;

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? '#fca5a5' : '#22d3ee';
}

function parseM3U(content) {
  const lines = content.split(/\r?\n/);
  const parsed = [];
  let pendingName = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('#EXTINF')) {
      const parts = trimmed.split(',');
      pendingName = parts.length > 1 ? parts[parts.length - 1].trim() : 'Untitled Channel';
    } else if (!trimmed.startsWith('#')) {
      parsed.push({
        name: pendingName || trimmed,
        url: trimmed,
      });
      pendingName = null;
    }
  }

  return parsed;
}

function renderChannels() {
  channelListEl.innerHTML = '';

  if (filteredChannels.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'muted';
    empty.textContent = 'No channels found.';
    channelListEl.appendChild(empty);
    return;
  }

  filteredChannels.forEach((channel) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = channel.name;

    if (selectedChannel && selectedChannel.url === channel.url) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => playChannel(channel));
    li.appendChild(btn);
    channelListEl.appendChild(li);
  });
}

function stopPlayer() {
  if (hls) {
    hls.destroy();
    hls = null;
  }
  videoEl.pause();
}

function playChannel(channel) {
  selectedChannel = channel;
  currentChannelEl.textContent = channel.name;
  renderChannels();

  const url = channel.url;
  stopPlayer();

  if (Hls.isSupported() && url.includes('.m3u8')) {
    hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(videoEl);
    hls.on(Hls.Events.ERROR, (_, data) => {
      if (data.fatal) {
        setStatus(`Playback error for ${channel.name}.`, true);
      }
    });
    setStatus(`Playing ${channel.name}`);
    return;
  }

  videoEl.src = url;
  videoEl
    .play()
    .then(() => setStatus(`Playing ${channel.name}`))
    .catch(() => setStatus(`Could not autoplay ${channel.name}. Press play manually.`, true));
}

function applySearch() {
  const q = searchInput.value.trim().toLowerCase();
  filteredChannels = channels.filter((c) => c.name.toLowerCase().includes(q));
  renderChannels();
}

async function loadFromUrl() {
  const playlistUrl = m3uUrlInput.value.trim();
  if (!playlistUrl) {
    setStatus('Please enter a playlist URL.', true);
    return;
  }

  try {
    setStatus('Fetching playlist URL...');
    const res = await fetch(playlistUrl);
    if (!res.ok) throw new Error('HTTP error');
    const content = await res.text();
    channels = parseM3U(content);
    filteredChannels = [...channels];
    renderChannels();
    setStatus(`Loaded ${channels.length} channels.`);
  } catch {
    setStatus('Failed to fetch playlist. Check URL, CORS, or use file upload.', true);
  }
}

function loadFromFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    const content = String(reader.result || '');
    channels = parseM3U(content);
    filteredChannels = [...channels];
    renderChannels();
    setStatus(`Loaded ${channels.length} channels from file.`);
  };
  reader.onerror = () => setStatus('Could not read playlist file.', true);
  reader.readAsText(file);
}

loadUrlBtn.addEventListener('click', loadFromUrl);
searchInput.addEventListener('input', applySearch);
m3uFileInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (file) loadFromFile(file);
});
reloadBtn.addEventListener('click', () => {
  if (selectedChannel) {
    playChannel(selectedChannel);
  } else {
    setStatus('Pick a channel first.', true);
  }
});

channels = parseM3U(samplePlaylist);
filteredChannels = [...channels];
renderChannels();
setStatus('Loaded demo playlist. Replace it with your own playlist URL or file.');
