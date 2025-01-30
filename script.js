document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
});

document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-100%";
});

let play = document.querySelector("#play");
let previous = document.querySelector("#previous");
let next = document.querySelector("#next");

async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    console.log(div);

    let songs = [];
    let anchors = Array.from(div.getElementsByTagName("a"));
    anchors.forEach(anchor => {
        console.log(anchor.href);
        if(anchor.href.endsWith(".mp3")) {
            songs.push(anchor.href.split("/songs/")[1]);
        }
    });
    return songs;
}

getSongs();