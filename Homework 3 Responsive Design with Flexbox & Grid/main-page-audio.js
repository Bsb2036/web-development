const song = document.querySelector("#teapot-song");
const status = document.querySelector("#song-status");

if (song && status) {
    function showAudioError() {
        status.textContent = "The audio file could not be loaded. Add im-a-little-teapot.mp3 to this folder.";
    }

    song.addEventListener("playing", () => {
        status.textContent = "Now playing.";
    });

    song.addEventListener("error", showAudioError);

    song.play().catch((error) => {
        if (error.name === "NotAllowedError") {
            status.textContent = "Your browser blocked autoplay. Press Play to start the song.";
        } else if (song.error || song.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
            showAudioError();
        } else {
            status.textContent = "Playback could not start. Press Play to try again.";
        }
    });

    window.setTimeout(() => {
        if (song.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) {
            showAudioError();
        }
    }, 1000);
}
