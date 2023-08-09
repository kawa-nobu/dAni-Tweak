let player_init = false;
window.addEventListener('load', function(){
    switch (location.pathname) {
        case "/animestore/sc_d_pc":
            const observer = new MutationObserver(play_window_run);
            observer.observe(document.getElementById("video"),{
                childList: true,
                attributes: true,
                characterData: true,
                subtree: true,
                attributeOldValue: true,
                characterDataOldValue: true
            });
            break;
        default:
            break;
    }
});
function play_window_run(){
    let url_parm = new URLSearchParams(location.search);
    //console.log(url_parm.get("partId"));
    fetch(`https://animestore.docomo.ne.jp/animestore/rest/WS010105?viewType=5&partId=${url_parm.get("partId")}&defaultPlay=5`, {
        method: "GET",
        cache: "no-store"
    }).then(response => {
        if (!response.ok) {
            console.error('サーバーエラー');
        }
        return response.json();
    }).then(json => {
        //console.log(json);
        let mds_title = `${json.data.partDispNumber} ${json.data.partTitle}`;
        let thunbnail_rep = (json.data.mainScenePath).replace("_1_3.png", "_1_1.png");
        if(player_init == true){
            document.title = json.data.title;
            document.getElementById("video").addEventListener("loadedmetadata", function(){
                append_mediasession(mds_title, json.data.workTitle, thunbnail_rep);
            });
        }else{
            const pip_button_style = `background: url(${chrome.runtime.getURL('svg/pip.svg')});background-size: 30px;background-repeat: no-repeat;background-position: center;`;
            document.getElementsByClassName("setting mainButton")[0].insertAdjacentHTML("afterend", `<div class="mainButton"><button class="danmtw_PiPButton" style="${pip_button_style}"></button></div>`);
            document.title = json.data.title;
            document.getElementById("video").addEventListener("loadedmetadata", function(){
                append_mediasession(mds_title, json.data.workTitle, thunbnail_rep);
            });
            append_keyboard_ctrl();
            document.querySelector(".danmtw_PiPButton").addEventListener("click", function(){
                start_pip();
            });
            player_init = true;
        }
        
    }).catch(error => {
        console.error('通信に失敗しました', error);
    });
}
function append_mediasession(title, work_title, thumbnail_url){
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: title,
            artist: work_title,
            album: "",
            artwork: [{ src: thumbnail_url,  sizes: '640x360',   type: 'image/jpeg' }]
        });
        navigator.mediaSession.setActionHandler('play', function() {document.querySelector(".playButton").click();});
        navigator.mediaSession.setActionHandler('pause', function() {document.querySelector(".playButton").click();});
        navigator.mediaSession.setActionHandler('previoustrack', function() {document.querySelector(".backButton").click();});
        navigator.mediaSession.setActionHandler('nexttrack', function() {document.querySelector(".skipButton").click();});
    }
}
function start_pip(){
    document.getElementById("video").requestPictureInPicture();
    document.getElementById("video").addEventListener("leavepictureinpicture", function(){
        document.getElementById("video").play();
        document.querySelector(".playButton").click();
    });
}
function append_keyboard_ctrl(){
    let key_status;
    document.addEventListener("keydown", function(key){
        if(key.code == "KeyP" && key_status == 0) {
            key_status = 1;
            start_pip();
        };
    });
    document.addEventListener("keyup", function(key){
        if(key.code == "KeyP") {
            key_status = 0;
        };
    });
}