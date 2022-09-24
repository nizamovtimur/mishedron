function sendToPython() {
    var { PythonShell } = require('python-shell');
    require('../js/uvicorn_options');
    let options = {
        pythonPath: python_path
    };
    PythonShell.run('model/uvicorn_start.py', options, function (err, results) {
        if (err) throw err;
        console.log('response: ', results);
    });
}

sendToPython();
