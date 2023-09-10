/**
 * Date: 08/29/2023
 * Author: Steve Padmanaban
 * Description: This file contains event listeners and functions that 
 * engage in retrieving and displaying Weather data from API, handling 
 * bad input, and toggling temperatures between fahrenheit and celsius.
 */

//Event listener whose function executes the below actions when window is loaded
window.addEventListener("load", async () => {
    let cityMapData = await getCitiesMap();
    loadCurrentLocInfo(cityMapData);
    let cityBtn = document.getElementById("cityBtn");
    let searchField = document.getElementById("MainDisplay").querySelector("#search");

    createDropDown(searchField, cityMapData);

    // Event listener whose function executes the actions of retrieving weather data and 
    // handling bad input
    cityBtn.addEventListener("click", (event) => {
        event.preventDefault();

        cityName = document.getElementById("search").value;
        
        // If Input contains numerical values, throw error message
        if (/\d/.test(cityName)) {
            let errorMsgs = document.getElementById("MainDisplay").getElementsByTagName("span");

            // Remove displayed error messages
            for (let i = 0, len = errorMsgs.length; i != len; ++i) {
                errorMsgs[0].parentNode.removeChild(errorMsgs[0]);
            }

            let numError = document.createElement('span');
            numError.style.color = '#d10426';
            numError.style.fontSize = '15px';
            numError.style.fontFamily = 'Verdana';
            numError.style.fontWeight = 'Bold';
            numError.appendChild(document.createTextNode("No Numerical Values Allowed. Please try again."));

            const weatherResult = document.getElementById("WeatherResult");
            const mainDisplay = document.getElementById("MainDisplay");

            mainDisplay.insertBefore(numError, weatherResult);
        } else {
            let cityId;
            if(cityName === '') {
                cityId = -1;
            } else {
                cityId = cityMapData.get(cityName);
            }
            getWeatherAndTimeData(cityId);
        }

        searchField.value = ''; // clear search box


    });

    let tempBtn = document.getElementById("CityTempBtn");

    // Event listener whose function executes actions of toggling 
    // displayed temperatures between fahrenheit and celsius
    tempBtn.addEventListener("click", (event) => {
        event.preventDefault();
        let cityTemp = document.getElementById("CityTemp");
        let lowTemp = document.getElementById("LowTemp");
        let highTemp = document.getElementById("HighTemp");

        let convertCityTemp;
        let convertLowTemp;
        let convertHighTemp;

        // Displayed Temperature is Fahrenheit
        if (cityTemp.innerHTML.includes("F")) {
            convertCityTemp = convertFarenheitToCelsius(cityTemp.innerHTML.split(' ')[0]);
            convertLowTemp = convertFarenheitToCelsius(lowTemp.innerHTML.split(' ')[1]);
            convertHighTemp = convertFarenheitToCelsius(highTemp.innerHTML.split(' ')[1]);

            cityTemp.innerHTML = convertCityTemp + " \xB0C";
            lowTemp.innerHTML = "Low: " + convertLowTemp + " \xB0C";
            highTemp.innerHTML = "High: " + convertHighTemp + " \xB0C";

        } else {
            // Displayed Temperature is Celsius
            convertCityTemp = convertCelsiusToFarenheit(cityTemp.innerHTML.split(' ')[0]);
            convertLowTemp = convertCelsiusToFarenheit(lowTemp.innerHTML.split(' ')[1]);
            convertHighTemp = convertCelsiusToFarenheit(highTemp.innerHTML.split(' ')[1]);

            cityTemp.innerHTML = convertCityTemp + " \xB0F";
            lowTemp.innerHTML = "Low: " + convertLowTemp + " \xB0F";
            highTemp.innerHTML = "High: " + convertHighTemp + " \xB0F";
        }

    });

});

/**
 * Gets Current Location via IP Geolocation API and retrieves Weather Data of that location
 * @author Steve Padmanaban
 * @param {Map} cityMapData Map of city keys whose values are the associated city IDs
 */
async function loadCurrentLocInfo(cityMapData) {
    let IPURL = "https://ipgeolocation.abstractapi.com/v1/?api_key=2ca3b69508fe4904b0761641870dd092";
    const currentResponse = await fetch(IPURL);
    const currentData = await currentResponse.json();

    let cityName = currentData.city + ", " + currentData.region_iso_code + ", " + currentData.country;
    getWeatherAndTimeData(cityMapData.get(cityName));
}

/**
 * Fetches and Displays Weather Information from OpenWeather API and handles bad input if necessary
 * @param {Number} cityId - value associated with the city name based on Hashmap with city data
 */
async function getWeatherAndTimeData(cityId) {
    let loadingFavicon = document.createElement('i');
    loadingFavicon.className = 'fa fa-spinner fa-spin';

    let errorMsgs = document.getElementById("MainDisplay").getElementsByTagName("span");

    // Removes all displayed Error Messages before Data Retrieval occurs
    for (let i = 0, len = errorMsgs.length; i != len; ++i) {
        errorMsgs[0].parentNode.removeChild(errorMsgs[0]);
    }

    let searchFavicon = document.getElementsByClassName("fa fa-search")[0];

    searchFavicon.replaceWith(loadingFavicon);

    let weatherURL = 'https://api.openweathermap.org/data/2.5/weather?id=' + cityId + '&appid=d9c329b6561c13cd10871ec409d0f923&units=imperial';

    try {

        const weatherResponse = await fetch(weatherURL);
        let weatherData = await weatherResponse.json();

        const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
        let display = document.getElementById('WeatherResult');

        let nameOfCity = weatherData.name;
        let countryName = regionNames.of(weatherData.sys.country);

        // If city's name and country's name are the same, then throw error message
        if (nameOfCity === countryName || countryName.includes(nameOfCity) || nameOfCity.includes(countryName)) {

            let sameError = document.createElement('span');
            sameError.style.color = '#d10426';
            sameError.style.fontSize = '15px';
            sameError.style.fontFamily = 'Verdana';
            sameError.style.fontWeight = 'Bold';
            sameError.appendChild(document.createTextNode("City and Country Names are the same. Please try again."));

            const weatherResult = document.getElementById("WeatherResult");
            const mainDisplay = document.getElementById("MainDisplay");

            mainDisplay.insertBefore(sameError, weatherResult);
            loadingFavicon.replaceWith(searchFavicon);
            return;

        }

        let fullName;

        // If country is USA, then include the US State with the city
        if (countryName === 'United States' && !nameOfCity.toLowerCase().includes("dc")) {
            let longLatURL = 'https://api.openweathermap.org/geo/1.0/reverse?lat=' + weatherData.coord.lat +
                '&lon=' + weatherData.coord.lon + '&appid=d9c329b6561c13cd10871ec409d0f923';
            try {
                let longLatResponse = await fetch(longLatURL);
                let longLatData = await longLatResponse.json();
                if (nameOfCity === longLatData[0].state) {
                    let sameError = document.createElement('span');
                    sameError.style.color = '#d10426';
                    sameError.style.fontSize = '15px';
                    sameError.style.fontFamily = 'Verdana';
                    sameError.style.fontWeight = 'Bold';
                    sameError.appendChild(document.createTextNode("City and US State Names are the same. Please try again."));

                    const weatherResult = document.getElementById("WeatherResult");
                    const mainDisplay = document.getElementById("MainDisplay");

                    mainDisplay.insertBefore(sameError, weatherResult);
                    loadingFavicon.replaceWith(searchFavicon);
                    return;
                }

                fullName = nameOfCity + ", " + convertToStateAbbr(longLatData[0].state) + ", " + "United States";

            } catch (error) {
                const errorMsg = document.createElement('span');
                errorMsg.setAttribute('id', 'errorMsg');
                errorMsg.style.color = '#d10426';
                errorMsg.style.fontSize = '15px';
                errorMsg.style.fontFamily = 'Verdana';
                errorMsg.style.fontWeight = 'Bold';
                errorMsg.appendChild(document.createTextNode("Invalid City Name. Please try again."));

                const weatherResult = document.getElementById("WeatherResult");
                const mainDisplay = document.getElementById("MainDisplay");

                mainDisplay.insertBefore(errorMsg, weatherResult);
            }


        } else {
            fullName = nameOfCity + ", " + countryName;
        }
        
        // City Temperatures
        let cityTemp = Math.round(Number(weatherData.main.temp));
        let highTemp = Math.round(Number(weatherData.main.temp_max));
        let lowTemp = Math.round(Number(weatherData.main.temp_min));

        // City's Extra Weather Information
        let humidity = weatherData.main.humidity;
        let windDirection = degreesToDirection(weatherData.wind.deg);
        let windSpeed = Math.round(Number(weatherData.wind.speed)).toString() + " mph";

        // City's Local Time
        let dateTime = weatherData.timezone;
        let formatDateTime = formatDateAndTime(dateTime);

        let imgIconCode = weatherData.weather[0].icon;
        let imgSrc = 'https://openweathermap.org/img/wn/' + imgIconCode + '.png';
        display.querySelector('#WeatherIcon').src = imgSrc;
        display.querySelector('#Description').innerHTML = weatherData.weather[0].main;



        display.querySelector('#CityName').innerHTML = fullName;
        display.querySelector('#CityTemp').innerHTML = cityTemp.toString() + " \xB0F";
        document.getElementById('LowHigh').querySelector('#LowTemp').innerHTML = "Low: " + lowTemp.toString() + " \xB0F";
        document.getElementById('LowHigh').querySelector('#HighTemp').innerHTML = "High: " + highTemp.toString() + " \xB0F";

        if (document.getElementById("WindIcon") == null) {
            let windIcon = document.createElement('img');
            windIcon.setAttribute("id", "WindIcon");
            windIcon.src = "https://raw.githubusercontent.com/spadmanaban25/Weather-Application-2023/main/images/WindSpeedOriginal.png";
            document.getElementById("WindInfo").insertBefore(windIcon, document.getElementById('AddWeather').querySelector('#WindSpeed'));
        }

        if (document.getElementById("HumidityIcon") == null) {
            let humidityIcon = document.createElement('img');
            humidityIcon.setAttribute("id", "HumidityIcon");
            humidityIcon.src = "https://raw.githubusercontent.com/spadmanaban25/Weather-Application-2023/main/images/Humidity.png";
            document.getElementById("HumidInfo").insertBefore(humidityIcon, document.getElementById('AddWeather').querySelector('#Humidity'));
        }

        document.getElementById('AddWeather').querySelector('#WindSpeed').innerHTML = windDirection + " " + windSpeed + "<br>" + "<p id='DescribeWeather'>Wind Speed</p>";
        document.getElementById('AddWeather').querySelector('#Humidity').innerHTML = humidity.toString() + "%" + "<br>" + "<p id='DescribeHumidity'>Humidity</p>";

        display.querySelector('#CityTime').innerHTML = formatDateTime;

        setBackroundImg(display.querySelector('#CityTime').innerHTML, weatherData);
    } catch (error) {
        const errorMsg = document.createElement('span');
        errorMsg.setAttribute('id', 'errorMsg');
        errorMsg.style.color = '#d10426';
        errorMsg.style.fontSize = '15px';
        errorMsg.style.fontFamily = 'Verdana';
        errorMsg.style.fontWeight = 'Bold';
        errorMsg.appendChild(document.createTextNode("Invalid City Name. Please try again."));

        const weatherResult = document.getElementById("WeatherResult");
        const mainDisplay = document.getElementById("MainDisplay");

        mainDisplay.insertBefore(errorMsg, weatherResult);
    }

    loadingFavicon.replaceWith(searchFavicon);
}
