import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore, collection, addDoc,
  onSnapshot, query, orderBy, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey:            "AIzaSyCBSCk5y6Wrx4BYJmNSe26kIWMcVzI4qMg",
  authDomain:        "undangan-dewi-dan-gadafi.firebaseapp.com",
  projectId:         "undangan-dewi-dan-gadafi",
  storageBucket:     "undangan-dewi-dan-gadafi.firebasestorage.app",
  messagingSenderId: "763717831621",
  appId:             "1:763717831621:web:d11303420efc02f15fd9ac",
};
const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ============================================================
// ✏️  KONFIGURASI — UBAH DI SINI
// ============================================================
const CONFIG = {
  groomName:    "Nama Pria",
  groomFull:    "Nama Lengkap Pria",
  groomParents: "Bapak ... & Ibu ...",

  brideName:    "Nama Wanita",
  brideFull:    "Nama Lengkap Wanita",
  brideParents: "Bapak ... & Ibu ...",

  weddingDate:  "2025-09-20",   // Format: YYYY-MM-DD
  akadTime:     "08:00",        // Format 24 jam
  resepsiTime:  "11:00",

  venueName:    "Nama Gedung",
  venueAddress: "Alamat lengkap gedung, Kota",
  mapsUrl:      "https://maps.app.goo.gl/XXXXXXXXX",

  musicUrl:     "assets/music.mp3",

  gift: [
    { bank: "Bank BRI", name: "Nama Mempelai Wanita", norek: "1234-5678-9012" },
    { bank: "Bank BCA", name: "Nama Mempelai Pria",   norek: "0987-6543-2100" },
  ],
};

// ============================================================
// COVER LOCK
// ============================================================
document.getElementById("open-btn").addEventListener("click", () => {
  document.body.classList.remove("locked");
  document.getElementById("content").style.display = "block";
  document.getElementById("footer").style.display  = "block";
  setTimeout(() => {
    document.getElementById("content").scrollIntoView({ behavior: "smooth" });
    initScrollReveal();
  }, 80);
});

// ============================================================
// ISI KONTEN
// ============================================================
function parseDate(str) {
  const DAYS   = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
  const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni",
                  "Juli","Agustus","September","Oktober","November","Desember"];
  const d = new Date(str + "T00:00:00");
  return {
    dayNum:    d.getDate(),
    monthName: MONTHS[d.getMonth()],
    year:      d.getFullYear(),
    full: `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`,
  };
}

function fmt(t) { return t.replace(":", ".") + " WIB"; }

function fillContent() {
  const guest = new URLSearchParams(window.location.search).get("tamu") || "Tamu Undangan";
  const date  = parseDate(CONFIG.weddingDate);

  document.getElementById("cover-guest").textContent = guest;
  document.getElementById("cover-groom").textContent = CONFIG.groomName;
  document.getElementById("cover-bride").textContent = CONFIG.brideName;
  document.getElementById("cover-date").textContent  = date.full;

  document.getElementById("inv-couple-title").innerHTML = `${CONFIG.groomName} &amp; ${CONFIG.brideName}`;
  document.getElementById("inv-groom").textContent       = CONFIG.groomName;
  document.getElementById("inv-bride").textContent       = CONFIG.brideName;
  document.getElementById("inv-groom-full").textContent  = CONFIG.groomFull;
  document.getElementById("inv-bride-full").textContent  = CONFIG.brideFull;
  document.getElementById("inv-groom-parents").innerHTML = `Putra dari<br><strong>${CONFIG.groomParents}</strong>`;
  document.getElementById("inv-bride-parents").innerHTML = `Putri dari<br><strong>${CONFIG.brideParents}</strong>`;

  document.getElementById("cd-title").textContent = date.full;

  document.getElementById("ev-akad-day").textContent   = date.dayNum;
  document.getElementById("ev-akad-month").textContent = `${date.monthName} ${date.year}`;
  document.getElementById("ev-akad-time").textContent  = fmt(CONFIG.akadTime);
  document.getElementById("ev-res-day").textContent    = date.dayNum;
  document.getElementById("ev-res-month").textContent  = `${date.monthName} ${date.year}`;
  document.getElementById("ev-res-time").textContent   = fmt(CONFIG.resepsiTime);

  document.getElementById("venue-name").textContent = CONFIG.venueName;
  document.getElementById("venue-addr").textContent = CONFIG.venueAddress;
  document.getElementById("btn-maps").href          = CONFIG.mapsUrl;

  document.getElementById("ft-groom").textContent = CONFIG.groomName;
  document.getElementById("ft-bride").textContent = CONFIG.brideName;
  document.title = `Undangan Pernikahan ${CONFIG.groomName} & ${CONFIG.brideName}`;

  CONFIG.gift.forEach((g, i) => {
    const n = i + 1;
    const bankEl  = document.getElementById(`gift-bank-${n}`);
    const nameEl  = document.getElementById(`gift-name-${n}`);
    const norekEl = document.getElementById(`gift-norek-${n}`);
    if (bankEl)  bankEl.textContent  = g.bank;
    if (nameEl)  nameEl.textContent  = g.name;
    if (norekEl) norekEl.textContent = g.norek;
  });
}

// ============================================================
// HITUNG MUNDUR — dengan animasi tick pada detik
// ============================================================
let prevSecs = -1;

function tickAnimate(el) {
  el.classList.remove("tick");
  void el.offsetWidth; // reflow
  el.classList.add("tick");
}

function updateCountdown() {
  const target = new Date(`${CONFIG.weddingDate}T${CONFIG.akadTime}:00`);
  const diff   = target - new Date();

  if (diff <= 0) {
    document.getElementById("cd-grid").style.display = "none";
    document.getElementById("cd-done").style.display = "block";
    return;
  }

  const pad = n => String(Math.floor(n)).padStart(2, "0");

  const days  = pad(diff / 86400000);
  const hours = pad((diff % 86400000) / 3600000);
  const mins  = pad((diff % 3600000)  / 60000);
  const secs  = pad((diff % 60000)    / 1000);

  const secsEl = document.getElementById("cd-secs");
  const minsEl = document.getElementById("cd-mins");
  const hrsEl  = document.getElementById("cd-hours");
  const daysEl = document.getElementById("cd-days");

  // Animasi tick setiap detik berubah
  if (secs !== prevSecs) {
    tickAnimate(secsEl);
    if (secs === "59") tickAnimate(minsEl);
    if (secs === "59" && mins === "59") tickAnimate(hrsEl);
    if (secs === "59" && mins === "59" && hours === "23") tickAnimate(daysEl);
    prevSecs = secs;
  }

  secsEl.textContent = secs;
  minsEl.textContent = mins;
  hrsEl.textContent  = hours;
  daysEl.textContent = days;
}

// ============================================================
// KELOPAK BUNGA
// ============================================================
function createPetals() {
  const container = document.getElementById("petals");
  const shapes    = ["🌸","🌺","🌷","✿","❀","❁"];
  const colors    = ["#c9956e","#e8a89e","#c4776a","#e0b99a","#f0c0b0"];

  for (let i = 0; i < 28; i++) {
    const p = document.createElement("div");
    p.className   = "petal";
    p.textContent = shapes[i % shapes.length];
    Object.assign(p.style, {
      left:              Math.random() * 100 + "%",
      fontSize:          (10 + Math.random() * 16) + "px",
      color:             colors[i % colors.length],
      animationDuration: (9 + Math.random() * 14) + "s",
      animationDelay:    (Math.random() * 16) + "s",
    });
    container.appendChild(p);
  }
}

// ============================================================
// SCROLL REVEAL
// ============================================================
function initScrollReveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
}

// ============================================================
// MUSIK
// ============================================================
function initMusic() {
  const audio   = new Audio(CONFIG.musicUrl || "assets/music.mp3");
  audio.loop    = true;
  audio.volume  = 0.5;
  const btn     = document.getElementById("music-btn");
  let playing   = false;

  btn.addEventListener("click", () => {
    if (playing) {
      audio.pause();
      btn.textContent = "♪";
      btn.classList.remove("playing");
    } else {
      audio.play().catch(() => {});
      btn.textContent = "⏸";
      btn.classList.add("playing");
    }
    playing = !playing;
  });

  document.addEventListener("click", function startAudio() {
    if (!playing) {
      audio.play().catch(() => {});
      btn.textContent = "⏸";
      btn.classList.add("playing");
      playing = true;
    }
    document.removeEventListener("click", startAudio);
  }, { once: true });
}

// ============================================================
// SALIN NOMOR REKENING
// ============================================================
window.copyRek = function (id, btn) {
  const norek = document.getElementById(id).textContent.replace(/\D/g, "");
  navigator.clipboard.writeText(norek).then(() => {
    btn.textContent = "Tersalin!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = "Salin";
      btn.classList.remove("copied");
    }, 2000);
  });
};

// ============================================================
// RSVP — Firebase
// ============================================================
window.submitRsvp = async function () {
  const name   = document.getElementById("rsvp-name").value.trim();
  const attend = document.getElementById("rsvp-attend").value;
  const msg    = document.getElementById("rsvp-msg").value.trim();
  const errEl  = document.getElementById("rsvp-error");

  if (!name || !attend) {
    errEl.textContent = "Mohon isi nama dan konfirmasi kehadiran.";
    return;
  }
  errEl.textContent = "";

  try {
    await addDoc(collection(db, "rsvp"), {
      name, attend, msg,
      createdAt: serverTimestamp(),
    });
    document.getElementById("rsvp-form").style.display = "none";
    const sEl = document.getElementById("rsvp-success");
    sEl.style.display = "block";
    document.getElementById("rsvp-success-msg").textContent =
      attend === "hadir"
        ? `Terima kasih, ${name}! Kami sangat menantikan kehadiran Anda.`
        : `Terima kasih, ${name}. Doa dan restu Anda sangat berarti bagi kami.`;
  } catch (err) {
    errEl.textContent = "Gagal mengirim. Coba lagi ya.";
    console.error(err);
  }
};

function listenRsvp() {
  const q = query(collection(db, "rsvp"), orderBy("createdAt", "desc"));
  onSnapshot(q, snapshot => {
    const listEl = document.getElementById("rsvp-list");
    if (snapshot.empty) {
      listEl.innerHTML = '<div class="rsvp-loading">Belum ada konfirmasi.</div>';
      return;
    }
    listEl.innerHTML = snapshot.docs.map(doc => {
      const d  = doc.data();
      const bc = d.attend === "hadir" ? "ri-hadir" : "ri-tidak";
      const bt = d.attend === "hadir" ? "Hadir" : "Tidak hadir";
      return `
        <div class="rsvp-item">
          <div>
            <div class="ri-name">${d.name}</div>
            ${d.msg ? `<div class="ri-msg">"${d.msg}"</div>` : ""}
          </div>
          <span class="ri-badge ${bc}">${bt}</span>
        </div>`;
    }).join("");
  });
}

// ============================================================
// INIT
// ============================================================
fillContent();
createPetals();
updateCountdown();
setInterval(updateCountdown, 1000);
initMusic();
listenRsvp();