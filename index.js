require('dotenv').config();
const notifier = require('node-notifier');
const fetch = require("node-fetch");

const parada = '708';
function callApiRest() {
    var email = process.env.email;
    var pass = process.env.pass;

    if (email == '' || pass == '') {
        console.log("Email or pass incorrect.");
        return;
    }

    fetch('https://openapi.emtmadrid.es/v1/mobilitylabs/user/login/', {
        method: 'GET',
        headers: {
            "email": email,
            "password": pass
        }
    })
        .then(res => res.json())
        .then(function (response) {
            console.log(response);
            console.log("accessToken: " + response.data[0].accessToken);
            callMethod(response.data[0].accessToken)
        })
        .catch(function (response) {
            console.log(response);
            console.log("accessToken: " + response.data[0].accessToken);
            callMethod(response.data[0].accessToken)
        });

}

function callMethod(accessToken) {

    var cid = parada;
    if (cid == null || cid == "") {
        alert("Invalid ");
    }
    fetch("https://openapi.emtmadrid.es/v2/transport/busemtmad/stops/" + cid + "/arrives/", {
        method: 'POST',
        headers: {
            "accessToken": accessToken,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "statistics": "N",
            "cultureInfo": "EN",
            "Text_StopRequired_YN": "Y",
            "Text_EstimationsRequired_YN": "Y",
            "Text_IncidencesRequired_YN": "Y",
            "DateTime_Referenced_Incidencies_YYYYMMDD": "20190923"
        })
    })
        .then(res => res.json())
        .then(function (response) {
            const data = response.data;
            let arrive = data[0].Arrive;
            arrive = arrive.map(item => ({
                Linea: item.line,
                Tiempo: item.estimateArrive / 60
            }));
            let message = '';
            arrive.forEach(item => {
                message += `Linea: ${item.Linea}\nTiempo: ${item.Tiempo}\n`
            });
            notifier.notify({
                title: 'Parada: ' + parada,
                message: message
            });
        })
        .catch(function (error) {
            console.log(error);
        });
}

var time = process.env.time.split(':');

function checkTime() {
    var now = new Date();

    if (now.getUTCHours() >= time[0] && now.getUTCMinutes() >= time[1]) {
        callApiRest()
    }
    else {
        console.log(now.getUTCHours() + ':' + now.getUTCMinutes());
        setTimeout(checkTime, 1000 * 5);
    }
}

console.log("Bus alarm: " + time.join(":"));

checkTime();
