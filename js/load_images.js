let submit = document.getElementById('submit');
let ctrl = document.getElementById('ctrl');
let result = document.getElementById('result');

submit.addEventListener("click", function (){
    var result_predict = '{"predict_result":{"/home/timur/Downloads/result/bear900.jpg":[[208.13992309570312,398.82965087890625],[368.10540771484375,367.0312805175781]],"/home/timur/Downloads/IMG_7513.jpeg":[],"/home/timur/Downloads/result/bear700.JPG":[[496.2020263671875,271.0287170410156],[335.9165344238281,271.1084899902344]]}}'
    // GET JSON FROM MODEL
    // fetch('http://127.0.0.1:48884/detection?input_source='.concat(ctrl.files[0].path)).then((data)=>{
    //     if(!data.ok) alert(data.statusText);
    //     return data.json();
    // }).then((predict_result)=>{
    //     result_predict = JSON.stringify(predict_result);
    // }).catch(e=>{
    //     console.log(e);
    // });

    // TODO: DIMA, EGOR, TYPE YOR CODE HERE
    result.innerText = result_predict;
});
