let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = Array.from(div.getElementsByTagName("a"));
    songs = [];
    anchors.forEach((anchor) => {
        if (anchor.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(anchor.href.split(`/${folder}/`)[1]));
        }
    });

    // Show all the songs in the Playlist.
    let songUL = document.querySelector(".songList ul");

    songUL.innerHTML = "";

    songs.forEach((song) => {
        songUL.innerHTML += `<li>
                <div class="song-info">
                  <img src="assets/svgs/music.svg" alt="" />
                  <div>
                    <div>${song}</div>
                    <div>Harry</div>
                  </div>
                </div>
                <div class="play-now">
                  <span>Play Now</span>
                  <img
                    width="20"
                    src="assets/svgs/play.svg"
                    alt=""
                  />
                </div>
              </li>`;
    });

    // Attach an event listener to each song.
    Array.from(
        document.querySelector(".songList ul").getElementsByTagName("li")
    ).forEach((item) => {
        item.addEventListener("click", () => {
            playMusic(item.querySelector(".song-info div div").innerHTML);
        });
    });
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;

    if (!pause) {
        currentSong.play();
        play.src = "assets/svgs/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let cardContainer = document.querySelector(".cardContainer");

    let anchors = div.getElementsByTagName("a");

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let href = e.href;
            console.log(href);
            let folder = e.href.split("/").filter(Boolean).splice(-1)[0];
            console.log(folder);
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();

            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                <img src="/songs/${folder}/cover.jpg" alt="" />
              <h4>${response.title}</h4>
              <p>${response.description}</p>
              <span class="green-play-btn"><img src="assets/svgs/green-play.svg" alt="" /></span>
            </div>`
        }
    }

    // Load the Playlist when the card is clicked.
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async (item) => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })
}

async function main() {
    await getSongs("songs/brazil-phonks");
    playMusic(songs[0], true);

    // Display all the Albums.
    await displayAlbums();

    // Listening to hamburger open and close menu
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-190%";
    });

    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(
            currentSong.currentTime
        )} / ${formatTime(currentSong.duration)}`;
    });

    // Listen for timeupdate event.
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(
            currentSong.currentTime
        )} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
    });

    // Attach an event Listener to playbar controls
    let play = document.querySelector("#play");
    let previous = document.querySelector("#previous");
    let next = document.querySelector("#next");

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "assets/svgs/pause.svg";
        } else {
            currentSong.pause();
            play.src = "assets/svgs/play.svg";
        }
    });

    previous.addEventListener("click", () => {
        let currentSongIndex = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
        if (currentSongIndex > 0) {
            playMusic(songs[currentSongIndex - 1]);
        }
    });

    next.addEventListener("click", () => {
        let currentSongIndex = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
        if (currentSongIndex < songs.length - 1) {
            playMusic(songs[currentSongIndex + 1]);
        }
    });

    // Add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = e.target.value / 100;
    });

    // Add event listener to mute the track
    document.querySelector(".volume img").addEventListener("click", (e) => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg");
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}

main();

