/**
 * Date: 08/29/2023
 * Author: Steve Padmanaban
 * Description: This file contains functions that don't 
 * pertain to fetch API. Such functions display effects
 * to the screen and/or input box and make any necessary 
 * conversions
 */

/**
 * Retrieves the Date and Time from given timezone Offset
 * 
 * @param {Number} timeZoneOffset - time property from OpenWeather API that represents 
 * the difference from the city's time and UTC time in seconds
 * 
 * @returns {String} - a string containing the date (Day of Week mm/dd/yyyy) and time (hh:mm)
 */
function formatDateAndTime(timeZoneOffset) {
    let newDate = new Date();
    let currTime = newDate.getTime(); // current time of UTC in milliseconds 
    let offSet = newDate.getTimezoneOffset() * 60000; // Offset between local time and UTC in milliseconds
    let utc = currTime + offSet; // UTC time in milliseconds
    let cityDateTime = utc + (1000 * timeZoneOffset); // local time based on parameter offset

    let adjustDate = new Date(cityDateTime);

    let retrieveTime = adjustDate.getHours() + ":" + adjustDate.getMinutes() + ":" + adjustDate.getSeconds(); // time in 24 hour format
    let formattedTime = formatTime(retrieveTime); // time in 12 hour format

    // Formatted Date with Day of Week and mm/dd/yyyy
    let formattedDate = adjustDate.toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return formattedDate + "<br><br>" + formattedTime;
}

/**
 * Changes the background to daytime or nightime based on city's current time
 * 
 * @param {String} cityTime - string containing formatted date and time
 * @param {JSON} weatherDataJSON - weather JSON object returned from fetching OpenWeather API
 */
function setBackroundImg(cityTime, weatherDataJSON) {
    let arr = cityTime.split("<br><br>");
    let AMorPM = arr[1].substring(arr[1].length - 4);

    let sunRiseMilli = weatherDataJSON.sys.sunrise; //sunrise timezone offset
    let sunSetMilli = weatherDataJSON.sys.sunset; //sunset timezone offset

    let sunrise = new Date(sunRiseMilli * 1000);
    let sunset = new Date(sunSetMilli * 1000);

    sunriseTime = sunrise.getTime();
    sunsetTime = sunset.getTime();

    sunriseOffSet = sunrise.getTimezoneOffset() * 60000;
    sunsetOffSet = sunset.getTimezoneOffset() * 60000;

    sunriseUTC = sunriseTime + sunriseOffSet;
    sunsetUTC = sunsetTime + sunsetOffSet;

    localSunrise = new Date(sunriseUTC + (weatherDataJSON.timezone * 1000));
    localSunset = new Date(sunsetUTC + (weatherDataJSON.timezone * 1000));


    if (Number(arr[1].trim().split(':')[0]) != 12 && AMorPM === 'P.M.') {
        let num = Number(arr[1].trim().split(':')[0]) + 12;
        arr[1] = num.toString() + ":" + arr[1].trim().split(':')[1].substring(0, arr[1].trim().split(':')[1].indexOf('P.M.') - 1);

    } else if (Number(arr[1].trim().split(':')[0]) == 12 && AMorPM === 'A.M.') {
        arr[1] = "0" + ":" + arr[1].trim().split(':')[1].substring(0, arr[1].trim().split(':')[1].indexOf('A.M.') - 1);
    } else {
        arr[1] = arr[1].substring(0, arr[1].indexOf(AMorPM) - 1);
    }

    adjustCurrDate = new Date(`${arr[0]} ${arr[1]}`);

    if (adjustCurrDate.getHours() > localSunrise.getHours() && adjustCurrDate.getHours() < localSunset.getHours()) {
        setDay();

    } else if (adjustCurrDate.getHours() > localSunset.getHours()) {
        setNight();

    } else if (adjustCurrDate.getHours() == localSunrise.getHours()) {
        if (adjustCurrDate.getMinutes() >= localSunrise.getMinutes()) {
            setDay();

        } else {
            setNight();
        }

    } else if (adjustCurrDate.getHours() == localSunset.getHours()) {
        if (adjustCurrDate.getMinutes() >= localSunset.getMinutes()) {
            setNight();

        } else {
            setDay();
        }
    } else if (adjustCurrDate.getHours() >= 0 && adjustCurrDate.getHours() < localSunrise.getHours()) {
        setNight();
    }
}

function formatTime(originalTime) {
    let index = originalTime.indexOf(' ');
    let time;

    if (index != -1) {
        time = originalTime.substring(index);

    } else {
        time = originalTime;
    }

    time = time.split(':');

    let hour = Number(time[0]);
    let minute = Number(time[1]);

    let formattedTime;

    if (hour > 0 && hour <= 12) {
        formattedTime = "" + hour;
    } else if (hour > 12) {
        formattedTime = "" + (hour - 12);
    } else if (hour == 0) {
        formattedTime = "12";
    }

    formattedTime += (minute < 10) ? ":0" + minute : ":" + minute;
    formattedTime += (hour >= 12) ? " P.M." : " A.M.";

    return formattedTime;
}

function degreesToDirection(degree) {
    let val = Math.floor((degree / 22.5) + 0.5);
    arr = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
    return arr[(val % 16)];
}

function setDay() {
    document.body.style.backgroundImage = "url('https://raw.githubusercontent.com/spadmanaban25/Weather-Application-2023/main/images/Daytime.jpg')";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "cover";
    let pDiv = document.getElementById("WeatherResult").querySelectorAll('p');
    pDiv.forEach(e => e.style.color = "#ebedf0");
}

function setNight() {
    document.body.style.backgroundImage = "url('https://raw.githubusercontent.com/spadmanaban25/Weather-Application-2023/main/images/NightTime.jpg')";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "cover";
    let pDiv = document.getElementById("WeatherResult").querySelectorAll('p');
    pDiv.forEach(e => e.style.color = "#f8ed62");
}

function convertFarenheitToCelsius(tempF) {
    let celsius = Math.round((Number(tempF) - 32) / 1.8);
    return celsius;
}

function convertCelsiusToFarenheit(tempC) {
    let faren = Math.round((Number(tempC) * 1.8) + 32);
    return faren;
}

function convertToStateAbbr(stateName) {
    var states = [
        ['Arizona', 'AZ'],
        ['Alabama', 'AL'],
        ['Alaska', 'AK'],
        ['Arkansas', 'AR'],
        ['California', 'CA'],
        ['Colorado', 'CO'],
        ['Connecticut', 'CT'],
        ['Delaware', 'DE'],
        ['Florida', 'FL'],
        ['Georgia', 'GA'],
        ['Hawaii', 'HI'],
        ['Idaho', 'ID'],
        ['Illinois', 'IL'],
        ['Indiana', 'IN'],
        ['Iowa', 'IA'],
        ['Kansas', 'KS'],
        ['Kentucky', 'KY'],
        ['Louisiana', 'LA'],
        ['Maine', 'ME'],
        ['Maryland', 'MD'],
        ['Massachusetts', 'MA'],
        ['Michigan', 'MI'],
        ['Minnesota', 'MN'],
        ['Mississippi', 'MS'],
        ['Missouri', 'MO'],
        ['Montana', 'MT'],
        ['Nebraska', 'NE'],
        ['Nevada', 'NV'],
        ['New Hampshire', 'NH'],
        ['New Jersey', 'NJ'],
        ['New Mexico', 'NM'],
        ['New York', 'NY'],
        ['North Carolina', 'NC'],
        ['North Dakota', 'ND'],
        ['Ohio', 'OH'],
        ['Oklahoma', 'OK'],
        ['Oregon', 'OR'],
        ['Pennsylvania', 'PA'],
        ['Rhode Island', 'RI'],
        ['South Carolina', 'SC'],
        ['South Dakota', 'SD'],
        ['Tennessee', 'TN'],
        ['Texas', 'TX'],
        ['Utah', 'UT'],
        ['Vermont', 'VT'],
        ['Virginia', 'VA'],
        ['Washington', 'WA'],
        ['West Virginia', 'WV'],
        ['Wisconsin', 'WI'],
        ['Wyoming', 'WY'],
    ];

    for (let i = 0; i < states.length; i++) {
        if (states[i][0] === stateName) {
            return states[i][1];
        }
    }

    return "No State Found";
}

async function getCitiesMap() {
    const cityListRes = await fetch('scripts/jsonFiles/city.list.json')
    const cityListData = await cityListRes.json();

    let cityListMap = new Map();
    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

    for (let data of cityListData) {
        let cityStr = '';
        if (data.state != '') {
            if (convertToStateAbbr(data.name) != data.state) {
                cityStr = data.name + ', ' + data.state + ', ' + regionNames.of(data.country);
            }

        } else {
            cityStr = data.name + ', ' + regionNames.of(data.country);
        }

        cityListMap.set(cityStr, data.id);
    }


    return cityListMap;
}

function createDropDown(inputField, cityData) {

    let cityListArr = Array.from(cityData.keys());

    inputField.addEventListener('keyup', (e) => {
        removeElements();
        for (let i of cityListArr) {
            if (i.toLowerCase().startsWith(inputField.value.toLowerCase()) && inputField.value != "") {
                let listItem = document.createElement("li");
                listItem.classList.add("list-items");
                listItem.style.cursor = "pointer";
                listItem.setAttribute("onclick", "displayNames('" + i + "')");
                let word = "<b>" + i.substr(0, inputField.value.length) + "</b>";
                word += i.substr(inputField.value.length);
                listItem.innerHTML = word;
                document.querySelector(".list").appendChild(listItem);
            }
        }
    });
}

async function displayNames(value) {
    let inputField = document.getElementById("MainDisplay").querySelector("#search");
    inputField.value = value;

    let cityMapData = await getCitiesMap();

    removeElements();

    getWeatherAndTimeData(cityMapData.get(value));

    inputField.value = "";

}

function removeElements() {
    let items = document.querySelectorAll(".list-items");
    items.forEach((item) => {
        item.remove();
    });
}