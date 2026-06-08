import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ============================================================
   FIREBASE
============================================================ */

const firebaseConfig = {
  apiKey: "AIzaSyAdhCxO8hhnMH-Sb-MIFbn9MSLiyLPgzG4",
  authDomain: "undangan-pernikahan-gadafidewi.firebaseapp.com",
  projectId: "undangan-pernikahan-gadafidewi",
  storageBucket: "undangan-pernikahan-gadafidewi.firebasestorage.app",
  messagingSenderId: "312514836672",
  appId: "1:312514836672:web:184bd1e48e10c9b5f9d525",
  measurementId: "G-26HZWHEPHP"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ============================================================
   CONFIG
============================================================ */

const CONFIG = {
  couple: {
    groom: {
      short: "Gadafi",
      label: "Mempelai Pria",
      full: "Gadafi M. Al Idrus, S.Pd., Gr.",
      parents:
        "Bapak Mahsyur M. Al Idrus & Ibu Syarifa K. Al Idrus",
    },

    bride: {
      short: "Dewi",
      label: "Mempelai Wanita",
      full: "Dewi Zulfianti, S.Pd.",
      parents:
        "Bapak Zubaer A. Bahanan & Ibu Fatma R. Toliling (Almh.)",
    },
  },

  event: {
    weddingDate: "2026-06-21",
    akadTime: "19:30",
  },

  venue: {
    name: "Kediaman Mempelai Wanita",
    address:
      "Jl. M.A. Turungku, Kel. Kali, Kec. Biau, Kab. Buol",
    mapsUrl:
      "https://maps.app.goo.gl/vEtz6Y4kwUovPoxj6",
  },

  musicUrl: "assets/music.mp3",

  gift: [
    {
      bank: "Bank BRI",
      name: "Dewi Zulfianti",
      norek: "1234-5678-9012",
    },
    {
      bank: "Bank BCA",
      name: "Muammar Gadafi M. Al Idrus",
      norek: "0987-6543-2100",
    },
  ],
};

/* ============================================================
   GLOBALS
============================================================ */

let audio;
let prevSecs = -1;

/* ============================================================
   DATE HELPERS
============================================================ */

function parseDate(str) {
  const DAYS = [
    "Ahad",
    "Senin",
    "Selasa",
    "Rabu",
    "Kamis",
    "Jumat",
    "Sabtu",
  ];

  const MONTHS = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];

  const d = new Date(str + "T00:00:00");

  return {
    dayNum: d.getDate(),
    monthName: MONTHS[d.getMonth()],
    year: d.getFullYear(),
    full:
      `${DAYS[d.getDay()]}, ` +
      `${d.getDate()} ` +
      `${MONTHS[d.getMonth()]} ` +
      `${d.getFullYear()}`
  };
}

function formatTime(time) {
  return time.replace(":", ".") + " WITA";
}

/* ============================================================
   FILL CONTENT
============================================================ */

function fillContent() {

  const groom = CONFIG.couple.groom;
  const bride = CONFIG.couple.bride;

  const date = parseDate(
    CONFIG.event.weddingDate
  );

  document.title =
    `Undangan Pernikahan ${groom.short} & ${bride.short}`;

  document.getElementById(
    "inv-couple-title"
  ).textContent =
    "Dengan Restu Kedua Keluarga";

  document.getElementById(
    "inv-groom"
  ).textContent =
    groom.label;

  document.getElementById(
    "inv-bride"
  ).textContent =
    bride.label;

  document.getElementById(
    "inv-groom-full"
  ).textContent =
    groom.full;

  document.getElementById(
    "inv-bride-full"
  ).textContent =
    bride.full;

  document.getElementById(
    "inv-groom-parents"
  ).innerHTML =
    `Putra dari<br><strong>${groom.parents}</strong>`;

  document.getElementById(
    "inv-bride-parents"
  ).innerHTML =
    `Putri dari<br><strong>${bride.parents}</strong>`;

  document.getElementById(
    "cd-title"
  ).textContent =
    date.full;

  document.getElementById(
    "ev-akad-time"
  ).textContent =
    formatTime(CONFIG.event.akadTime);

  document.getElementById(
    "venue-name"
  ).textContent =
    CONFIG.venue.name;

  document.getElementById(
    "venue-addr"
  ).textContent =
    CONFIG.venue.address;

  document.getElementById(
    "btn-maps"
  ).href =
    CONFIG.venue.mapsUrl;

  document.getElementById(
    "ft-groom"
  ).textContent =
    groom.short;

  document.getElementById(
    "ft-bride"
  ).textContent =
    bride.short;

  CONFIG.gift.forEach((gift, index) => {

    const n = index + 1;

    const bank =
      document.getElementById(
        `gift-bank-${n}`
      );

    const name =
      document.getElementById(
        `gift-name-${n}`
      );

    const norek =
      document.getElementById(
        `gift-norek-${n}`
      );

    if (bank) bank.textContent = gift.bank;
    if (name) name.textContent = gift.name;
    if (norek) norek.textContent = gift.norek;

  });

}

/* ============================================================
   COVER DATA
============================================================ */

function fillCover() {

  const date = parseDate(
    CONFIG.event.weddingDate
  );

  document.getElementById(
    "cover-groom"
  ).textContent =
    CONFIG.couple.groom.short;

  document.getElementById(
    "cover-bride"
  ).textContent =
    CONFIG.couple.bride.short;

  document.getElementById(
    "cover-date"
  ).textContent =
    date.full;

  const params =
    new URLSearchParams(
      window.location.search
    );

  const guest =
    params.get("to") ||
    params.get("tamu") ||
    "Tamu Undangan";

  document.getElementById(
    "cover-guest"
  ).textContent =
    decodeURIComponent(guest);
}

/* ============================================================
   COUNTDOWN
============================================================ */

function tickAnimate(el) {
  el.classList.remove("tick");
  void el.offsetWidth;
  el.classList.add("tick");
}

function updateCountdown() {

  const target =
    new Date(
      `${CONFIG.event.weddingDate}T${CONFIG.event.akadTime}:00`
    );

  const diff =
    target - new Date();

  if (diff <= 0) {

    document.getElementById(
      "cd-grid"
    ).style.display = "none";

    document.getElementById(
      "cd-done"
    ).style.display = "block";

    return;
  }

  const pad =
    n =>
      String(Math.floor(n))
        .padStart(2, "0");

  const daysNum =
    diff / 86400000;

  const hoursNum =
    (diff % 86400000) /
    3600000;

  const minsNum =
    (diff % 3600000) /
    60000;

  const secsNum =
    (diff % 60000) /
    1000;

  const days = pad(daysNum);
  const hours = pad(hoursNum);
  const mins = pad(minsNum);
  const secs = pad(secsNum);

  const daysEl =
    document.getElementById("cd-days");

  const hoursEl =
    document.getElementById("cd-hours");

  const minsEl =
    document.getElementById("cd-mins");

  const secsEl =
    document.getElementById("cd-secs");

  if (secs !== prevSecs) {

    tickAnimate(secsEl);

    if (secs === "59")
      tickAnimate(minsEl);

    if (
      secs === "59" &&
      mins === "59"
    ) {
      tickAnimate(hoursEl);
    }

    if (
      secs === "59" &&
      mins === "59" &&
      hours === "23"
    ) {
      tickAnimate(daysEl);
    }

    prevSecs = secs;
  }

  daysEl.textContent = days;
  hoursEl.textContent = hours;
  minsEl.textContent = mins;
  secsEl.textContent = secs;
}

setInterval(updateCountdown, 1000);

/* ============================================================
   MUSIC
============================================================ */

function initMusic() {

  audio = new Audio(CONFIG.musicUrl);

  audio.loop = true;
  audio.preload = "auto";

  const btn =
    document.getElementById("music-btn");

  btn.addEventListener("click", async () => {

    try {

      if (audio.paused) {

        await audio.play();

        btn.classList.add("playing");
        btn.innerHTML = "♫";

      } else {

        audio.pause();

        btn.classList.remove("playing");
        btn.innerHTML = "♪";

      }

    } catch (err) {
      console.error(err);
    }

  });

}

async function startMusic() {

  if (!audio) return;

  try {

    await audio.play();

    document
      .getElementById("music-btn")
      .classList.add("playing");

    document
      .getElementById("music-btn")
      .innerHTML = "♫";

  } catch (err) {

    console.warn(
      "Autoplay blocked:",
      err
    );

  }

}

/* ============================================================
   OPEN INVITATION
============================================================ */

function initCover() {

  const btn =
    document.getElementById("open-btn");

  btn.addEventListener("click", async () => {

    document.body.classList.remove(
      "locked"
    );

    document.getElementById(
      "content"
    ).style.display = "block";

    document.getElementById(
      "footer"
    ).style.display = "block";

    await startMusic();
    document
  .getElementById("music-btn")
  .classList.add("show");

    document.getElementById(
      "content"
    ).scrollIntoView({
      behavior: "smooth"
    });

  });

}

/* ============================================================
   SCROLL REVEAL
============================================================ */

function initReveal() {

  const items =
    document.querySelectorAll(
      ".reveal"
    );

  const io =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (entry.isIntersecting) {

            entry.target.classList.add(
              "visible"
            );

          }

        });

      },
      {
        threshold: .15
      }
    );

  items.forEach(item =>
    io.observe(item)
  );

}

/* ============================================================
   PETALS
============================================================ */

function createPetals() {

  const wrap =
    document.getElementById("petals");

  if (!wrap) return;

  for (let i = 0; i < 20; i++) {

    const petal =
      document.createElement("div");

    petal.className = "petal";

    petal.innerHTML = "❀";

    petal.style.left =
      Math.random() * 100 + "%";

    petal.style.top =
      (-Math.random() * 100) + "px";

    petal.style.color =
      Math.random() > .5
        ? "#e8a89e"
        : "#c9956e";

    petal.style.opacity =
      .2 + Math.random() * .3;

    petal.style.fontSize =
      12 + Math.random() * 12 + "px";

    petal.style.animationDuration =
      10 + Math.random() * 12 + "s";

    petal.style.animationDelay =
      Math.random() * 10 + "s";

    wrap.appendChild(petal);

  }

}

/* ============================================================
   COPY REKENING
============================================================ */

window.copyRek =
async function(id, btn) {

  const text =
    document.getElementById(id)
    ?.textContent
    ?.trim();

  if (!text) return;

  try {

    await navigator.clipboard.writeText(
      text
    );

    const old =
      btn.textContent;

    btn.textContent =
      "Tersalin";

    btn.classList.add("copied");

    setTimeout(() => {

      btn.textContent = old;

      btn.classList.remove(
        "copied"
      );

    }, 2000);

  } catch (err) {

    console.error(err);

  }

};

/* ============================================================
   RSVP
============================================================ */

window.submitRsvp =
async function() {

  const name =
    document.getElementById(
      "rsvp-name"
    ).value.trim();

  const attend =
    document.getElementById(
      "rsvp-attend"
    ).value;

  const msg =
    document.getElementById(
      "rsvp-msg"
    ).value.trim();

  const error =
    document.getElementById(
      "rsvp-error"
    );

  error.textContent = "";

  if (!name) {

    error.textContent =
      "Nama wajib diisi";

    return;
  }

  if (!attend) {

    error.textContent =
      "Pilih konfirmasi kehadiran";

    return;
  }

  try {

    await addDoc(
      collection(db, "rsvp"),
      {
        name,
        attend,
        msg,
        createdAt:
          serverTimestamp()
      }
    );

    document.getElementById(
      "rsvp-form"
    ).style.display = "none";

    document.getElementById(
      "rsvp-success"
    ).style.display = "block";

  } catch (err) {

    console.error(err);

    error.textContent =
      "Gagal mengirim data";

  }

};

/* ============================================================
   LOAD RSVP
============================================================ */

function loadRsvp() {

  const list =
    document.getElementById(
      "rsvp-list"
    );

  const q =
    query(
      collection(db, "rsvp"),
      orderBy(
        "createdAt",
        "desc"
      )
    );

  onSnapshot(q, snap => {

    if (snap.empty) {

      list.innerHTML =
        `<div class="rsvp-loading">
          Belum ada konfirmasi
        </div>`;

      return;
    }

    let html = "";

    snap.forEach(doc => {

      const d = doc.data();

      html += `
      <div class="rsvp-item">

        <div>

          <div class="ri-name">
            ${d.name}
          </div>

          ${
            d.msg
            ? `<div class="ri-msg">${d.msg}</div>`
            : ""
          }

        </div>

        <div class="
          ri-badge
          ${
            d.attend === "hadir"
            ? "ri-hadir"
            : "ri-tidak"
          }
        ">
          ${
            d.attend === "hadir"
            ? "Hadir"
            : "Tidak"
          }
        </div>

      </div>
      `;

    });

    list.innerHTML = html;

  });

}

/* ============================================================
   INIT
============================================================ */

fillCover();
fillContent();

updateCountdown();

initMusic();
initCover();
initReveal();

createPetals();

loadRsvp();
