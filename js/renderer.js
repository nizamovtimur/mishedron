const information = document.getElementById('info');
information.innerText = `This app is using Chrome (v${versions.chrome()}), Node.js (v${versions.node()}), and Electron (v${versions.electron()})`;

let input = document.querySelector('#input')
let result = document.querySelector('#result')
let btn = document.querySelector('#btn')

function sendToPython() {
    var { PythonShell } = require('python-shell');
    require('./js/uvicorn_options');
    let options = {
        pythonPath: python_path
    };
    PythonShell.run('model/uvicorn_start.py', options, function (err, results) {
        if (err) throw err;
        console.log('response: ', results);
    });
}

function onclick(){
    result.innerHTML = "<p>Loading...</p>";
    var files = [];
    Array.from(input.files).forEach(function(item, index, array) {
        files.push(item.path);
    });
    fetch(`http://127.0.0.1:48884/classification`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify(files)
        }
    ).then((data)=>{
        if(!data.ok) alert(data.statusText);
        return data.json();
    }).then((predict_result)=>{
        console.log("data: ", predict_result);
        var predict_photos = predict_result['predict_photos'];
        result.innerHTML = "";
        predict_photos.forEach((predict_photo) => {
            var elem = document.createElement("img");
            elem.setAttribute("src", predict_photo);
            elem.setAttribute("width", "100%");
            elem.setAttribute("alt", "predict_result");
            result.appendChild(elem);
        });
    }).catch(e=>{
        console.log(e);
    })
}

sendToPython();

btn.addEventListener('click', onclick);