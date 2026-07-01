/* ==========================================================================
   Aura Immersive Music Player Application Script
   ========================================================================== */

// --- Playlist Dataset ---
const playlist = [
  {
    id: 1,
    title: "Neon Horizon",
    artist: "Solar Flare",
    genre: "Synthwave",
    cover: "/covers/cover1.png",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: "6:12" // Placeholder duration until metadata loads
  },
  {
    id: 2,
    title: "Midnight Rain",
    artist: "Lunar Echo",
    genre: "Lofi Ambient",
    cover: "/covers/cover2.png",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: "7:05"
  },
  {
    id: 3,
    title: "Digital Forest",
    artist: "Byte Sized",
    genre: "Chiptune",
    cover: "/covers/cover3.png",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    duration: "5:44"
  }
];

// --- Player State ---
let currentIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isLoop = false;
let isMuted = false;
let previousVolume = 0.8;

// --- Instantiating HTML5 Audio Element ---
const audio = new Audio();
audio.volume = 0.8; // Default volume

// --- DOM Elements ---
const vinylContainer = document.getElementById("vinyl-container");
const albumCover = document.getElementById("album-cover");
const songGenre = document.getElementById("song-genre");
const songTitle = document.getElementById("song-title");
const songArtist = document.getElementById("song-artist");

// Controls
const btnPlay = document.getElementById("btn-play");
const playIcon = document.getElementById("play-icon");
const pauseIcon = document.getElementById("pause-icon");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const btnShuffle = document.getElementById("btn-shuffle");
const btnLoop = document.getElementById("btn-loop");

// Progress Slider
const progressSlider = document.getElementById("progress-slider");
const progressTrack = document.getElementById("progress-track");
const timeCurrent = document.getElementById("time-current");
const timeDuration = document.getElementById("time-duration");

// Volume Controls
const volumeSlider = document.getElementById("volume-slider");
const volumeTrack = document.getElementById("volume-track");
const volumeToggleBtn = document.getElementById("volume-toggle-btn");
const volHighIcon = document.getElementById("vol-high-icon");
const volMuteIcon = document.getElementById("vol-mute-icon");

// Playlist Drawer
const playlistDrawer = document.getElementById("playlist-drawer");
const playlistToggleBtn = document.getElementById("playlist-toggle-btn");
const playlistCloseBtn = document.getElementById("playlist-close-btn");
const playlistBackdrop = document.getElementById("playlist-backdrop");
const playlistTracksContainer = document.getElementById("playlist-tracks");

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  loadTrack(currentIndex);
  renderPlaylist();
  setupEventListeners();
});

// --- Core Media Loader ---
function loadTrack(index) {
  const track = playlist[index];
  if (!track) return;

  // Update track details
  audio.src = track.url;
  albumCover.src = track.cover;
  albumCover.alt = `${track.title} Album Artwork`;
  songGenre.textContent = track.genre;
  songTitle.textContent = track.title;
  songArtist.textContent = track.artist;
  
  // Reset progress displays
  progressSlider.value = 0;
  progressTrack.style.width = "0%";
  progressSlider.style.setProperty("--progress-thumb-left", "0%");
  timeCurrent.textContent = "0:00";
  timeDuration.textContent = track.duration;

  // Update active row highlight in playlist drawer
  updateActivePlaylistItem();
}

// --- Playlist Drawer Dynamic Populating ---
function renderPlaylist() {
  playlistTracksContainer.innerHTML = "";
  
  playlist.forEach((track, index) => {
    const item = document.createElement("div");
    item.className = "track-item";
    item.setAttribute("role", "listitem");
    item.setAttribute("tabindex", "0");
    item.setAttribute("aria-label", `Play ${track.title} by ${track.artist}`);
    
    item.innerHTML = `
      <div class="track-index">${index + 1}</div>
      <div class="track-details">
        <div class="track-title">${track.title}</div>
        <div class="track-artist">${track.artist}</div>
      </div>
      <div class="track-duration">${track.duration}</div>
    `;

    // Click handler to load this track
    item.addEventListener("click", () => {
      selectTrack(index);
      closePlaylist();
    });

    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectTrack(index);
        closePlaylist();
      }
    });

    playlistTracksContainer.appendChild(item);
  });
}

function updateActivePlaylistItem() {
  const items = playlistTracksContainer.querySelectorAll(".track-item");
  items.forEach((item, index) => {
    if (index === currentIndex) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

function selectTrack(index) {
  currentIndex = index;
  loadTrack(currentIndex);
  if (isPlaying) {
    playAudio();
  } else {
    togglePlay();
  }
}

// --- Player Controllers ---
function togglePlay() {
  if (isPlaying) {
    pauseAudio();
  } else {
    playAudio();
  }
}

function playAudio() {
  isPlaying = true;
  audio.play()
    .then(() => {
      vinylContainer.classList.add("playing");
      playIcon.style.display = "none";
      pauseIcon.style.display = "block";
    })
    .catch((err) => {
      console.log("Audio play failed or interrupted:", err);
      isPlaying = false;
      vinylContainer.classList.remove("playing");
      playIcon.style.display = "block";
      pauseIcon.style.display = "none";
    });
}

function pauseAudio() {
  isPlaying = false;
  audio.pause();
  vinylContainer.classList.remove("playing");
  playIcon.style.display = "block";
  pauseIcon.style.display = "none";
}

function nextTrack() {
  if (isShuffle) {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * playlist.length);
    } while (newIndex === currentIndex && playlist.length > 1);
    currentIndex = newIndex;
  } else {
    currentIndex = (currentIndex + 1) % playlist.length;
  }
  
  loadTrack(currentIndex);
  if (isPlaying) {
    playAudio();
  }
}

function prevTrack() {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadTrack(currentIndex);
  if (isPlaying) {
    playAudio();
  }
}

function toggleShuffle() {
  isShuffle = !isShuffle;
  btnShuffle.classList.toggle("active", isShuffle);
}

function toggleLoop() {
  isLoop = !isLoop;
  btnLoop.classList.toggle("active", isLoop);
}

// --- Volume Controls ---
function updateVolume(val) {
  const fraction = val / 100;
  audio.volume = fraction;
  volumeTrack.style.width = `${val}%`;

  if (val === 0) {
    isMuted = true;
    volHighIcon.style.display = "none";
    volMuteIcon.style.display = "block";
  } else {
    isMuted = false;
    previousVolume = fraction;
    volHighIcon.style.display = "block";
    volMuteIcon.style.display = "none";
  }
}

function toggleMute() {
  if (isMuted) {
    updateVolume(Math.round(previousVolume * 100));
    volumeSlider.value = Math.round(previousVolume * 100);
  } else {
    previousVolume = audio.volume;
    updateVolume(0);
    volumeSlider.value = 0;
  }
}

// --- Playlist Drawer Toggles ---
function openPlaylist() {
  playlistDrawer.classList.add("active");
  playlistDrawer.setAttribute("aria-hidden", "false");
  playlistToggleBtn.setAttribute("aria-expanded", "true");
  playlistDrawer.focus();
}

function closePlaylist() {
  playlistDrawer.classList.remove("active");
  playlistDrawer.setAttribute("aria-hidden", "true");
  playlistToggleBtn.setAttribute("aria-expanded", "false");
}

// --- Time Formatter Utility ---
function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// --- Event Listeners Mapping ---
function setupEventListeners() {
  // Click Playbacks
  btnPlay.addEventListener("click", togglePlay);
  btnNext.addEventListener("click", nextTrack);
  btnPrev.addEventListener("click", prevTrack);
  btnShuffle.addEventListener("click", toggleShuffle);
  btnLoop.addEventListener("click", toggleLoop);

  // Audio Event Hooks
  audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
      const percentage = (audio.currentTime / audio.duration) * 100;
      progressSlider.value = percentage;
      progressTrack.style.width = `${percentage}%`;
      progressSlider.style.setProperty("--progress-thumb-left", `${percentage}%`);
      
      timeCurrent.textContent = formatTime(audio.currentTime);
    }
  });

  audio.addEventListener("durationchange", () => {
    timeDuration.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("loadedmetadata", () => {
    timeDuration.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("ended", () => {
    if (isLoop) {
      audio.currentTime = 0;
      playAudio();
    } else {
      nextTrack();
    }
  });

  // Timeline Slider inputs
  progressSlider.addEventListener("input", (e) => {
    if (audio.duration) {
      const seekTime = (e.target.value / 100) * audio.duration;
      audio.currentTime = seekTime;
      progressTrack.style.width = `${e.target.value}%`;
      progressSlider.style.setProperty("--progress-thumb-left", `${e.target.value}%`);
      timeCurrent.textContent = formatTime(seekTime);
    }
  });

  // Volume Slider inputs
  volumeSlider.addEventListener("input", (e) => {
    updateVolume(parseInt(e.target.value));
  });

  volumeToggleBtn.addEventListener("click", toggleMute);

  // Playlist drawer togglers
  playlistToggleBtn.addEventListener("click", openPlaylist);
  playlistCloseBtn.addEventListener("click", closePlaylist);
  playlistBackdrop.addEventListener("click", closePlaylist);

  // Accessibility keyboard closes drawer
  playlistDrawer.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closePlaylist();
      playlistToggleBtn.focus();
    }
  });
}
