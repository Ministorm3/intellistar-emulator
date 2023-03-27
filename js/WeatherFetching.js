function guessZipCode(){
  // Skip geolookup until replaced with TWC (wunderground api dead)
  return;

  var zipCodeElement = getElement("zip-code-text");
  // Before filling with auto zip, check and see if
  // there is already an input
  if(zipCodeElement.value != ""){
    return;
  }

  // always use wunderground API for geolookup
  // only valid equivalent is GET v3/location/search
  // TODO: use TWC API GET v3/location/search instead of wunderground geolookup
  fetch(`https://api.wunderground.com/api/${CONFIG.secrets.wundergroundAPIKey}/geolookup/q/autoip.json`)
    .then(function(response) {
      //check for error
      if (response.status !== 200) {
        console.log("zip code request error");
        return;
      }
      response.json().then(function(data) {
        // Only fill zip if the user didn't touch
        // the box while the zip was fetching
        if(zipCodeElement.value == ""){
          zipCodeElement.value = data.location.zip;
        }
      });
    })
}

function fetchAlerts(){
  // Skip alert fetching until replaced with TWC (wunderground api dead)


  var alertCrawl = "";
  // again, always use wunderground for fetching alerts
  // two api calls are required for one alert
  // one: GET v1/alerts
  //        this gets all the alerts issued
  // two: GET v1/alert/:detailKey/details.json
  //        this gets the details of the alert
  // will think of a solution later
  // TODO: Use v1/alerts and v1/alert to grab alerts from TWC
  fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=40.4406&lon=-79.9959&exclude=current,minutely,hourly,daily&appid=731ad85ca6206a2f99932073de70f6c4`)
    .then(function(response) {
      if (response.status !== 200) {
        console.log("forecast request error");
        return;
      }
      response.json().then(function(data) {
		if (data.alerts == undefined){
			fetchForecast();
			return;
		}
        for(var i = 0; i < data.alerts.length; i++){
          /* Take the most important alert message and set it as crawl text
           This will supply more information i.e. tornado warning coverage */
          alertCrawl = alertCrawl + " " + data.alerts[i].description.replace("...", "");

          // ignore special weather statements
          alerts[i] = data.alerts[i].description.replace("...", "").split("...", 1)[0].split("*", 1)[0].split("for", 1)[0].replace(/\n/g, " ").replace("...", "").toUpperCase();
        }
        if(alertCrawl != ""){
          CONFIG.crawl = alertCrawl;
        }
        alertsActive = alerts.length > 0;
        fetchForecast();
      });
    })
}

function fetchForecast(){
  fetch(`https://api.weather.com/v1/geocode/${latitude}/${longitude}/forecast/daily/10day.json?language=${CONFIG.language}&units=${CONFIG.units}&apiKey=${CONFIG.secrets.twcAPIKey}`)
    .then(function(response) {
      if (response.status !== 200) {
        console.log('forecast request error');
        return;
      }
      response.json().then(function(data) {
        let forecasts = data.forecasts
        // narratives
        isDay = forecasts[0].day; // If the API spits out a day forecast, use the day timings
        let ns = []
        ns.push(forecasts[0].day || forecasts[0].night); // there must be a day forecast so if the API doesn't provide one, just make it the night one. It won't show anyway.
        ns.push(forecasts[0].night);
        ns.push(forecasts[1].day);
        ns.push(forecasts[1].night);
        for (let i = 0; i <= 3; i++) {
          let n = ns[i]
          forecastTemp[i] = n.temp
          forecastIcon[i] = n.icon_code
          forecastNarrative[i] = n.narrative
          forecastPrecip[i] = `${n.pop}% Chance<br/> of ${n.precip_type.charAt(0).toUpperCase() + n.precip_type.substr(1).toLowerCase()}`
        }
        // 7 day outlook
        for (var i = 0; i < 7; i++) {
          let fc = forecasts[i+1]
          outlookHigh[i] = fc.max_temp
          outlookLow[i] = fc.min_temp
          outlookCondition[i] = (fc.day ? fc.day : fc.night).phrase_32char.split(' ').join('<br/>')
          // thunderstorm doesn't fit in the 7 day outlook boxes
          // so I multilined it similar to that of the original
          outlookCondition[i] = outlookCondition[i].replace("Thunderstorm", "Thunder</br>storm");
          outlookIcon[i] = (fc.day ? fc.day : fc.night).icon_code
        }
        fetchRadarImages();
      })
    })
}

function fetchCurrentWeather(){
  fetch(`https://api.weather.com/v3/location/point?postalKey=${zipCode}:${CONFIG.countryCode}&language=${CONFIG.language}&format=json&apiKey=${CONFIG.secrets.twcAPIKey}`)
    .then(function(response) {
      if (response.status !== 200) {
        console.log('conditions request error');
        return;
      }
      response.json().then(function(data) {
        try {
          // which LOCALE?!
          cityName = data.location.displayName.toUpperCase();
          latitude = data.location.latitude;
          longitude = data.location.longitude;
        } catch (err) {
          alert('Enter valid ZIP code');
          console.error(err)
          getZipCodeFromUser();
          return;
        }
        fetch(`https://api.weather.com/v1/geocode/${latitude}/${longitude}/observations/current.json?language=${CONFIG.language}&units=${CONFIG.units}&apiKey=${CONFIG.secrets.twcAPIKey}`)
          .then(function(response) {
            if (response.status !== 200) {
              console.log("conditions request error");
              return;
            }
            response.json().then(function(data) {
              // cityName is set in the above fetch call and not this one
              let unit = data.observation[CONFIG.unitField];
              currentTemperature = Math.round(unit.temp);
              currentCondition = data.observation.phrase_32char;
              windSpeed = `${data.observation.wdir_cardinal} ${unit.wspd} ${CONFIG.unit === 'm' ? 'km/h' : 'mph'}`;
              gusts = unit.gust || 'NONE';
              feelsLike = unit.feels_like
              visibility = Math.round(unit.vis)
              humidity = unit.rh
              dewPoint = unit.dewpt
              pressure = unit.altimeter.toPrecision(4);
              let ptendCode = data.observation.ptend_code
              pressureTrend = (ptendCode == 1 || ptendCode == 3) ? '▲' : ptendCode == 0 ? '' : '▼'; // if ptendCode == 1 or 3 (rising/rising rapidly) up arrow else its steady then nothing else (falling (rapidly)) down arrow
              currentIcon = data.observation.icon_code
              fetchAlerts();
            });
          });
      })
    });

}

function sleep(milliseconds) {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

function fetchRadarImages(){
  // Skip radar until replaced with some other solution (wunderground api dead)
  radarImage = document.createElement("iframe");
  radarImage.onerror = function () {
    getElement('radar-container').style.display = 'none';
  }
  radarImage.setAttribute("src","https://www.rainviewer.com/map.html?loc=40.4428,-79.9959,7&oFa=0&oC=1&oU=0&oCS=1&oF=1&oAP=1&c=3&o=70&lm=1&layer=radar&sm=0&sn=1&hu=0");
  radarImage.style.width = "1230px"
  radarImage.style.height = "520px"
  document.body.appendChild(radarImage);
  

  zoomedRadarImage = document.createElement("iframe");
  zoomedRadarImage.onerror = function () {
    getElement('zoomed-radar-container').style.display = 'none';
  }
  zoomedRadarImage.setAttribute("src","https://www.rainviewer.com/map.html?loc=40.4459,-79.9915,9&oFa=0&oC=1&oU=0&oCS=1&oF=1&oAP=1&c=3&o=70&lm=1&layer=radar&sm=0&sn=1&hu=0");
    zoomedRadarImage.style.width = "1230px"
    zoomedRadarImage.style.height = "520px"
    document.body.appendChild(zoomedRadarImage);

  scheduleTimeline();
}
