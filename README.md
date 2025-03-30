# Euphonia - Your Music Companion

![Euphonia Logo](assets/svgs/logo.svg)

Euphonia is a modern, responsive web-based music player with a clean interface and intuitive controls. This application allows users to browse music libraries and enjoy a seamless music listening experience.

## Features

- **Responsive Design**: Works across desktop, tablet, and mobile devices
- **Album Discovery**: Browse and explore different music collections
- **Playback Controls**: Play, pause, skip tracks, and adjust volume
- **Playlist Search**: Quickly find songs in your library
- **Playlist Sorting**: Sort your music alphabetically
- **Theme Toggle**: Switch between light and dark modes
- **Keyboard Shortcuts**: Control playback using keyboard
- **Seek Functionality**: Skip to any part of a track
- **Volume Control**: Adjust and mute audio

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Design**: Custom CSS with CSS Variables for theming

## Installation & Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/euphonia.git
   ```

2. Navigate to the project directory:
   ```
   cd euphonia
   ```

3. Set up your music library:
   - Create album folders in the `songs/` directory
   - Each album folder should include:
     - MP3 files
     - `cover.jpg` for album artwork
     - `info.json` with album metadata:
       ```json
       {
         "title": "Album Title",
         "description": "Album description or artist information"
       }
       ```

4. Serve the project using a local web server. For example, with Node.js:
   ```
   npx serve
   ```

5. Open the application in your browser (typically at http://localhost:3000)

## Usage

### Music Controls

- **Play/Pause**: Click the play/pause button or press the Spacebar
- **Next Track**: Click the next button or press the Down Arrow key
- **Previous Track**: Click the previous button or press the Up Arrow key
- **Seek**: Click anywhere on the seekbar or use Left/Right Arrow keys to jump 5 seconds
- **Volume**: Adjust using the volume slider or click the volume icon to mute

### Interface Controls

- **Theme Toggle**: Switch between light and dark mode using the theme icon in the header
- **Search**: Filter your library using the search input
- **Sort**: Sort your playlist alphabetically using the Sort button
- **Mobile Menu**: Use the hamburger menu to open the sidebar on mobile devices

## Keyboard Shortcuts

| Key           | Action                         |
|---------------|--------------------------------|
| Space         | Play/Pause                     |
| Arrow Right   | Forward 5 seconds              |
| Arrow Left    | Rewind 5 seconds               |
| Arrow Up      | Previous track                 |
| Arrow Down    | Next track                     |

## Future Enhancements

- User accounts and authentication
- Cloud synchronization of playlists
- Drag and drop playlist management
- Equalizer and audio effects

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Project inspired by modern music streaming services