let submit = document.getElementById('submit');
let ctrl = document.getElementById('ctrl');
// let result = document.getElementById('result');
let tabs = document.getElementById('list-tab');
let value_tabs = document.getElementById('nav-tabContent');
let pictureBox = document.getElementById('pictureBox');
let preloader = document.getElementById("page-preloader");

const $ = require('../jquery/jquery-3.6.1.js');
const agent = require("global-agent/dist/classes/Agent");
$(function(){
    $('#list-tab').on('click','a',function(){
        pictureBox.src = document.getElementById("id" + ($(this).index() + 1)).path;
    });
});

pictureBox.addEventListener("click", function () {
    let image = document.createElement("img");
    image.setAttribute("src", pictureBox.src);
    image.setAttribute("id", "largeImage");
    image.setAttribute("style", "position: absolute; height: 100%;width: 100%; top: 0px; left: 0px; z-index: 10");
    image.addEventListener('click', function(event) {
            document.body.removeChild(document.getElementById("largeImage"));
    });
    document.body.appendChild(image);
});

document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        document.body.removeChild(document.getElementById("largeImage"));
    }
});

submit.addEventListener("click", function (){
    preloader.classList.add("undone");
    fetch('http://127.0.0.1:48884/detection?input_source='.concat(ctrl.files[0].path)).then((data)=>{
        if(!data.ok) alert(data.statusText);
        return data.json();
    }).then((predict_result)=>{
        tabs.innerHTML = '';
        let true_map = predict_result["predict_result"];
        let count = 0;
        for (var abs_path in true_map){
            count++;
            let link = document.createElement("a");
            link.setAttribute("class", "list-group-item list-group-item-action")
            link.setAttribute("id", "id" + count);
            link.setAttribute("href", "#list" + count);
            link.setAttribute("data-bs-toggle", "list");
            link.setAttribute("role", "tab");
            link.path = abs_path;
            link.appendChild(document.createTextNode(abs_path.substring(abs_path.lastIndexOf('\\') + 1)));
            tabs.appendChild(link);
            let custom_div = document.createElement("div");
            custom_div.setAttribute("class", "tab-pane fade");
            custom_div.setAttribute("id", "list" + count);
            custom_div.setAttribute("role", "tabpanel");
            for (var i=0;i<true_map[abs_path].length;i++){
                custom_div.innerText += "Медведь " + (i + 1) + ": (" + true_map[abs_path][i].toString() + "); ";
            }
            value_tabs.appendChild(custom_div);
        }
        document.getElementById("tabs").setAttribute("style", "background-color: white;")
        preloader.classList.remove("undone");
        preloader.classList.add("done");
    }).catch(e=>{
        console.log(e);
    });

    // TODO: DIMA, EGOR, TYPE YOR CODE HERE
});
