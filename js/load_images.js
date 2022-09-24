let submit = document.getElementById('submit');
let ctrl = document.getElementById('ctrl');
let result = document.getElementById('result');

submit.addEventListener("click", function (){
    fetch(`http://127.0.0.1:48884/detection`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json;charset=utf-8'
            },
            body: JSON.stringify({
                "input_source": ctrl.files[0].path
            })
        }
    ).then((data)=>{
        if(!data.ok) alert(data.statusText);
        return data.json();
    }).then((predict_result)=>{
        // console.log("data: ", predict_result);
        // var predict_photos = predict_result['predict_photos'];
        // result.innerHTML = "";
        // predict_photos.forEach((predict_photo) => {
        //     var elem = document.createElement("img");
        //     elem.setAttribute("src", predict_photo);
        //     elem.setAttribute("width", "100%");
        //     elem.setAttribute("alt", "predict_result");
        //     result.appendChild(elem);
        // });
        result.innerText = predict_result;
    }).catch(e=>{
        console.log(e);
    })
});
