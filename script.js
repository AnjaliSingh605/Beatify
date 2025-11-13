console.log("Let's begin js");
let currentsong = new Audio();
let songs;
let currfolder;



function formatMMSS(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60); // remove any decimal part
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function convertSeconds(currentSeconds, totalSeconds) {
    return `${formatMMSS(currentSeconds)} / ${formatMMSS(totalSeconds)}`;
}

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(` http://127.0.0.1:3000/${folder}/ `);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];

    for (let index = 0; index < as.length; index++) {
        const ele = as[index];
        if (ele.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(ele.href.split(`/${folder}/`)[1]).trim());
        }

    }
    // show all songs in playlist
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songul.innerHTML = "";
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li> <img class="invert" width="34" src="img/music.svg" alt="">
                             <div class="info">
                                <div> ${song} </div>
                                <div> Singer </div>
                             </div>
                             <div class="playnow">
                               <span >Play now</span>
                               <img  class="invert" src="img/play.svg" alt="">
                             </div> </li>`;
    }

    // Attach event listeners to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })

    })

    return songs;
}

const playMusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";


}

async function displayAlbums() {
    let a = await fetch(` http://127.0.0.1:3000/songs/ `);
    let response = await a.text();
    let div = document.createElement("div");
    let cardContainer = document.querySelector(".cardContainer");
    div.innerHTML = response;
    let anchoors = div.getElementsByTagName("a");
    let array = Array.from(anchoors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0]
            // get that meta data of folder
            let a = await fetch(` http://127.0.0.1:3000/songs/${folder}/info.json `);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                            <div class="play" >
                                <svg viewBox="0 0 24 24" aria-hidden="true"
                                    style="width: 32px; height: 32px; fill: black;">
                                    <path
                                        d="m7.05 3.606 13.49 7.788a.7.7 0 0 1 0 1.212L7.05 20.394A.7.7 0 0 1 6 19.788V4.212a.7.7 0 0 1 1.05-.606">
                                    </path>
                                </svg>
                            </div>
                            
                              <img src="/songs/${folder}/cover.jpg" alt="">
                        <h2> ${response.title} </h2>
                        <p>${response.description}</p>
                    </div> `
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]);
        })
    })


}


async function main() {
    //get list of all the songs   


    await getsongs("songs/ncs");
    playMusic(songs[0], true);

    // Display all the albums on the page
    displayAlbums();



    // Attack eventt listener to play , next and previous
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg"
        } else {
            currentsong.pause();
            play.src = "img/play.svg"
        }
    })

    // Listen for timeupdate event
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSeconds(currentsong.currentTime, currentsong.duration)}`

        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    })

    // Add an event listener to seekbar

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = (percent + "%");
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    })

    // add an event listener for hamburger

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })
    // add an event listener for close

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = -120 + "%";
    })

    // add eventlistener to previos 

    previous.addEventListener("click", () => {
        console.log("previous, clicked");
        let currentTrack = decodeURIComponent(currentsong.src.split("/").slice(-1)[0]);
        let indx = songs.indexOf(currentTrack);
        if ((indx - 1) >= 0) {
            playMusic(songs[indx - 1]);
        }
    })

    // add eventlistener to  next

    next.addEventListener("click", () => {
        currentsong.pause();
        console.log("next, clicked");
        let currentTrack = decodeURIComponent(currentsong.src.split("/").slice(-1)[0]);
       let indx = songs.indexOf(currentTrack);
        if ((indx + 1) < songs.length) {
            playMusic(songs[indx + 1]);
        }

    })

    // add eventlistener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log("setting volume to", e.target.value , " / 100");
        currentsong.volume = parseInt(e.target.value) / 100;
    })

    // ADD eventlistener to mute the volume
    document.querySelector(".volume > img").addEventListener("click", (e) =>{
        if(e.target.src.includes("volume.svg")){
           e.target.src =  e.target.src.replace("volume.svg", "mute.svg");
            currentsong.volume = 0;
             document.querySelector(".range").getElementsByTagName("input")[0].value =  0;
        }else{
             e.target.src =  e.target.src.replace( "mute.svg", "volume.svg");
            currentsong.volume = .10;
             document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })


}



main();