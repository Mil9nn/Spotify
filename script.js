let songs = [];
let currentSong = new Audio();

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = Math.floor(seconds % 60);

    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    songs = [];
    let anchors = Array.from(div.getElementsByTagName("a"));
    anchors.forEach(anchor => {
        if(anchor.href.endsWith(".mp3")) {
            songs.push(anchor.href.split("/songs/")[1]);
        }
    });

    return songs; 
}

const playMusic = (track, pause=false) => {
    currentSong.src = "/songs/" + track;

    if(!pause) {
        currentSong.play();
        play.src = "assets/svgs/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

async function main() {
    let songs = await getSongs();

    // Show all the songs in the Playlist.
    let songUL = document.querySelector(".songList ul");
    songs.forEach(song => {
        songUL.innerHTML += `<li>
                <div class="song-info">
                  <img class="invert" src="assets/svgs/music.svg" alt="" />
                  <div>
                    <div>${song}</div>
                    <div>Harry</div>
                  </div>
                </div>
                <div class="play-now">
                  <span>Play Now</span>
                  <img
                    width="25"
                    class="invert"
                    src="assets/svgs/play.svg"
                    alt=""
                  />
                </div>
              </li>`
    });

    // Load one song initially into the playbar to play.
    // playMusic(songs[0], true);

    // Attach an event listener to each song.
    Array.from(document.querySelector(".songList ul").getElementsByTagName("li")).forEach(item => {
        item.addEventListener("click", () => {
            playMusic(item.querySelector(".song-info div div").innerHTML);
            
            currentSong.addEventListener("loadedmetadata", () => {
                document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
            });

            currentSong.addEventListener("timeupdate", () => {
                document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
                document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
            });

            
        });
    });

    // Attach an event Listener to playbar controls
    let play = document.querySelector("#play");
    let previous = document.querySelector("#previous");
    let next = document.querySelector("#next");

    play.addEventListener("click", () => {
        if(currentSong.paused) {
            currentSong.play();
            play.src = "assets/svgs/pause.svg";
        } else {
            currentSong.pause();
            play.src = "assets/svgs/play.svg";
        }
    });

    previous.addEventListener("click", () => {
        if(songs.includes(currentSong.src.split("/songs/")[1])) {
            let currentSongIndex = songs.indexOf(currentSong.src.split("/songs/")[1]);
            if(currentSongIndex > 0) {
                playMusic(songs[currentSongIndex - 1], true);
            }
        }
    });

    next.addEventListener("click", () => {
        if(songs.includes(currentSong.src.split("/songs/")[1])) {
            let currentSongIndex = songs.indexOf(currentSong.src.split("/songs/")[1]);
            if(currentSongIndex < songs.length - 1) {
                playMusic(songs[currentSongIndex + 1], true);
            }
        }
    })

}

main();
















document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
});

document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
});

let play = document.querySelector("#play");
let previous = document.querySelector("#previous");
let next = document.querySelector("#next");