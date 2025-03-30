let currentSong = new Audio();
let songs;
let currFolder;
let isPlaying = false;

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

// Update seekbar UI based on currentTime
function updateSeekBar() {
    const percent = (currentSong.currentTime / currentSong.duration) * 100;
    document.querySelector(".circle").style.left = `${percent}%`;
    document.documentElement.style.setProperty('--seek-position', `${percent}%`);
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
        const displayName = song.replace('.mp3', '');
        songUL.innerHTML += `<li>
                <div class="song-info">
                  <img src="assets/svgs/music.svg" alt="Music" />
                  <div>
                    <div>${displayName}</div>
                  </div>
                </div>
                <div class="play-now">
                  <span>Play</span>
                  <img width="20" src="assets/svgs/play.svg" alt="Play" />
                </div>
              </li>`;
    });

    // Attach an event listener to each song.
    Array.from(document.querySelector(".songList ul").getElementsByTagName("li"))
        .forEach((item) => {
            item.addEventListener("click", () => {
                playMusic(item.querySelector(".song-info div div").innerHTML + ".mp3");
            });
        });
    
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;

    // Update the UI before playing
    document.querySelector(".songinfo").innerHTML = track.replace('.mp3', '');
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    
    if (!pause) {
        isPlaying = true;
        currentSong.play()
            .then(() => {
                // Play was successful
                play.src = "assets/svgs/pause.svg";
            })
            .catch(err => {
                // Handle play errors
                console.error("Error playing song:", err);
                isPlaying = false;
                play.src = "assets/svgs/play.svg";
            });
    } else {
        isPlaying = false;
        play.src = "assets/svgs/play.svg";
    }
    
    // Highlight current song in playlist
    highlightCurrentSong(track);
};

function highlightCurrentSong(trackName) {
    // Remove highlight from all songs
    document.querySelectorAll(".songList ul li").forEach(item => {
        item.classList.remove("active");
        item.style.backgroundColor = "";
    });
    
    // Add highlight to current song
    const songItems = document.querySelectorAll(".songList ul li");
    const displayName = trackName.replace('.mp3', '');
    
    for (let item of songItems) {
        if (item.querySelector(".song-info div div").innerHTML === displayName) {
            item.classList.add("active");
            item.style.backgroundColor = "rgba(140, 103, 240, 0.12)";
            
            // Ensure the song is visible in the list
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            break;
        }
    }
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = ""; // Clear existing content

    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors);
    
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").filter(Boolean).splice(-1)[0];
            
            try {
                // Get the metadata of the folder
                let a = await fetch(`/songs/${folder}/info.json`);
                let response = await a.json();

                cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card">
                    <img src="/songs/${folder}/cover.jpg" alt="${response.title}" />
                    <div class="card-content">
                        <h4>${response.title}</h4>
                        <p>${response.description}</p>
                    </div>
                    <div class="green-play-btn">
                        <img src="assets/svgs/green-play.svg" alt="Play album" />
                    </div>
                </div>`;
            } catch (error) {
                console.error(`Error loading info for folder ${folder}:`, error);
            }
        }
    }

    // Load the Playlist when the card is clicked.
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async (item) => {
            // Add loading state
            card.classList.add("loading");
            
            try {
                songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
                if (songs.length > 0) {
                    playMusic(songs[0]);
                }
            } catch (error) {
                console.error("Error loading songs:", error);
            } finally {
                // Remove loading state
                card.classList.remove("loading");
            }
        });
    });
}

async function main() {
    try {
        // Set initial volume
        currentSong.volume = 0.7;
        document.querySelector(".range input").value = 70;
        
        // Initial loading of songs
        await getSongs("songs/brazil-phonks");
        playMusic(songs[0], true);

        // Display all the Albums.
        await displayAlbums();

        // Mobile menu handlers
        document.querySelector(".hamburger").addEventListener("click", () => {
            document.querySelector(".left").classList.add("active");
        });

        document.querySelector(".close").addEventListener("click", () => {
            document.querySelector(".left").classList.remove("active");
        });

        // Audio event listeners
        currentSong.addEventListener("loadedmetadata", () => {
            document.querySelector(".songtime").innerHTML = `${formatTime(
                currentSong.currentTime
            )} / ${formatTime(currentSong.duration)}`;
            updateSeekBar();
        });

        // Listen for timeupdate event.
        currentSong.addEventListener("timeupdate", () => {
            document.querySelector(".songtime").innerHTML = `${formatTime(
                currentSong.currentTime
            )} / ${formatTime(currentSong.duration)}`;
            updateSeekBar();
        });

        // Add an event listener to seekbar
        document.querySelector(".seekbar").addEventListener("click", (e) => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = percent + "%";
            document.documentElement.style.setProperty('--seek-position', `${percent}%`);
            currentSong.currentTime = (currentSong.duration * percent) / 100;
        });

        // Handle song end
        currentSong.addEventListener("ended", () => {
            let currentSongIndex = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
            if (currentSongIndex < songs.length - 1) {
                playMusic(songs[currentSongIndex + 1]);
            } else {
                // Reset to first song if at the end
                playMusic(songs[0]);
            }
        });

        // Attach an event Listener to playbar controls
        let play = document.querySelector("#play");
        let previous = document.querySelector("#previous");
        let next = document.querySelector("#next");

        play.addEventListener("click", () => {
            if (currentSong.paused) {
                isPlaying = true;
                currentSong.play();
                play.src = "assets/svgs/pause.svg";
            } else {
                isPlaying = false;
                currentSong.pause();
                play.src = "assets/svgs/play.svg";
            }
        });

        previous.addEventListener("click", () => {
            let currentSongIndex = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
            if (currentSongIndex > 0) {
                playMusic(songs[currentSongIndex - 1]);
            } else {
                // Wrap around to the last song
                playMusic(songs[songs.length - 1]);
            }
        });

        next.addEventListener("click", () => {
            let currentSongIndex = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
            if (currentSongIndex < songs.length - 1) {
                playMusic(songs[currentSongIndex + 1]);
            } else {
                // Wrap around to the first song
                playMusic(songs[0]);
            }
        });

        // Add an event to volume
        document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {
            currentSong.volume = e.target.value / 100;
            updateVolumeUI(e.target.value);
        });

        // Add event listener to mute the track
        document.querySelector(".volume img").addEventListener("click", (e) => {
            if (e.target.src.includes("volume.svg")) {
                e.target.src = e.target.src.replace("volume.svg", "mute.svg");
                currentSong.volume = 0;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
                updateVolumeUI(0);
            } else {
                e.target.src = e.target.src.replace("mute.svg", "volume.svg");
                currentSong.volume = 0.7;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 70;
                updateVolumeUI(70);
            }
        });

        // Function to update the volume range UI
        function updateVolumeUI(value) {
            const volumeInput = document.querySelector(".range input");
            const percentage = value;
            volumeInput.style.background = `linear-gradient(to right, var(--primary) 0%, var(--primary) ${percentage}%, #ddd ${percentage}%, #ddd 100%)`;
        }
        
        // Initialize volume range UI
        updateVolumeUI(70);

        // Keyboard shortcuts
        document.addEventListener("keydown", (e) => {
            // Space bar for play/pause
            if (e.code === "Space" && !e.target.matches("input, textarea")) {
                e.preventDefault(); // Prevent scrolling
                if (currentSong.paused) {
                    isPlaying = true;
                    currentSong.play();
                    play.src = "assets/svgs/pause.svg";
                } else {
                    isPlaying = false;
                    currentSong.pause();
                    play.src = "assets/svgs/play.svg";
                }
            }
            
            // Arrow keys for navigation
            if (e.code === "ArrowLeft") {
                // Rewind 5 seconds
                currentSong.currentTime = Math.max(0, currentSong.currentTime - 5);
            }
            
            if (e.code === "ArrowRight") {
                // Forward 5 seconds
                currentSong.currentTime = Math.min(currentSong.duration, currentSong.currentTime + 5);
            }
            
            // Previous/Next track
            if (e.code === "ArrowDown") {
                let currentSongIndex = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
                if (currentSongIndex < songs.length - 1) {
                    playMusic(songs[currentSongIndex + 1]);
                } else {
                    playMusic(songs[0]);
                }
            }
            
            if (e.code === "ArrowUp") {
                let currentSongIndex = songs.indexOf(decodeURIComponent(currentSong.src.split("/").slice(-1)[0]));
                if (currentSongIndex > 0) {
                    playMusic(songs[currentSongIndex - 1]);
                } else {
                    playMusic(songs[songs.length - 1]);
                }
            }
        });
        
        // Add theme toggle functionality
        const addThemeToggle = () => {
            // Create theme toggle button
            const themeToggle = document.createElement('img');
            themeToggle.src = 'assets/svgs/theme.svg';
            themeToggle.alt = 'Toggle theme';
            themeToggle.style.width = '20px';
            themeToggle.style.opacity = '0.6';
            themeToggle.style.cursor = 'pointer';
            themeToggle.style.transition = 'var(--transition)';
            
            // Add hover effect
            themeToggle.addEventListener('mouseover', () => {
                themeToggle.style.opacity = '1';
            });
            
            themeToggle.addEventListener('mouseout', () => {
                themeToggle.style.opacity = '0.6';
            });
            
            // Add to header controls
            const headerControls = document.querySelector('.header-controls');
            headerControls.appendChild(themeToggle);
            
            // Check for saved theme preference
            const isDarkMode = localStorage.getItem('darkMode') === 'true';
            if (isDarkMode) {
                enableDarkMode();
            }
            
            // Toggle theme on click
            themeToggle.addEventListener('click', () => {
                if (document.body.classList.contains('dark-mode')) {
                    disableDarkMode();
                } else {
                    enableDarkMode();
                }
            });
        };
        
        // Dark mode functions
        function enableDarkMode() {
            document.body.classList.add('dark-mode');
            document.documentElement.style.setProperty('--bg-main', '#121212');
            document.documentElement.style.setProperty('--bg-sidebar', '#1a1a1a');
            document.documentElement.style.setProperty('--bg-card', '#1e1e1e');
            document.documentElement.style.setProperty('--bg-playbar', 'rgba(18, 18, 18, 0.95)');
            document.documentElement.style.setProperty('--text-primary', '#ffffff');
            document.documentElement.style.setProperty('--text-secondary', '#b3b3b3');
            document.documentElement.style.setProperty('--text-tertiary', '#737373');
            localStorage.setItem('darkMode', 'true');
        }
        
        function disableDarkMode() {
            document.body.classList.remove('dark-mode');
            document.documentElement.style.setProperty('--bg-main', '#f9f9f9');
            document.documentElement.style.setProperty('--bg-sidebar', '#ffffff');
            document.documentElement.style.setProperty('--bg-card', '#ffffff');
            document.documentElement.style.setProperty('--bg-playbar', 'rgba(255, 255, 255, 0.95)');
            document.documentElement.style.setProperty('--text-primary', '#222222');
            document.documentElement.style.setProperty('--text-secondary', '#606060');
            document.documentElement.style.setProperty('--text-tertiary', '#909090');
            localStorage.setItem('darkMode', 'false');
        }
        
        // Add theme toggle
        addThemeToggle();
        
        // Add functionality for playlist searching
        const addPlaylistSearch = () => {
            const searchContainer = document.createElement('div');
            searchContainer.className = 'search-container';
            searchContainer.style.padding = '12px';
            searchContainer.style.marginBottom = '12px';
            
            const searchInput = document.createElement('input');
            searchInput.type = 'text';
            searchInput.placeholder = 'Search your library...';
            searchInput.style.width = '100%';
            searchInput.style.padding = '8px 12px';
            searchInput.style.borderRadius = 'var(--border-radius-sm)';
            searchInput.style.border = 'none';
            searchInput.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
            searchInput.style.fontSize = '14px';
            searchInput.style.outline = 'none';
            
            searchContainer.appendChild(searchInput);
            
            // Insert before songList
            const library = document.querySelector('.library');
            const songList = document.querySelector('.songList');
            library.insertBefore(searchContainer, songList);
            
            // Filter songs as user types
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const songItems = document.querySelectorAll('.songList ul li');
                
                songItems.forEach(item => {
                    const songName = item.querySelector('.song-info div div').textContent.toLowerCase();
                    if (songName.includes(searchTerm)) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        };
        
        // Add playlist search functionality
        addPlaylistSearch();
        
        // Add playlist sorting
        const addPlaylistSorting = () => {
            const sortButton = document.createElement('button');
            sortButton.innerText = 'Sort A-Z';
            sortButton.style.fontSize = '12px';
            sortButton.style.padding = '6px 12px';
            sortButton.style.backgroundColor = 'var(--primary-light)';
            sortButton.style.color = 'white';
            sortButton.style.border = 'none';
            sortButton.style.borderRadius = 'var(--border-radius-sm)';
            sortButton.style.cursor = 'pointer';
            sortButton.style.marginLeft = '12px';
            sortButton.style.fontWeight = '500';
            
            // Add to library title
            const libraryTitle = document.querySelector('.library h2');
            libraryTitle.appendChild(sortButton);
            
            // Track sort state
            let sortAscending = true;
            
            // Sort functionality
            sortButton.addEventListener('click', () => {
                const songList = document.querySelector('.songList ul');
                const songs = Array.from(songList.querySelectorAll('li'));
                
                songs.sort((a, b) => {
                    const aName = a.querySelector('.song-info div div').textContent;
                    const bName = b.querySelector('.song-info div div').textContent;
                    
                    if (sortAscending) {
                        return aName.localeCompare(bName);
                    } else {
                        return bName.localeCompare(aName);
                    }
                });
                
                // Clear and re-append sorted items
                songList.innerHTML = '';
                songs.forEach(song => {
                    songList.appendChild(song);
                });
                
                // Toggle sort state
                sortAscending = !sortAscending;
                sortButton.innerText = sortAscending ? 'Sort A-Z' : 'Sort Z-A';
            });
        };
        
        // Add playlist sorting
        addPlaylistSorting();
        
    } catch (error) {
        console.error("An error occurred during initialization:", error);
        document.querySelector(".songinfo").innerHTML = "Error loading player. Please refresh.";
    }
}

// Initialize the application
main();