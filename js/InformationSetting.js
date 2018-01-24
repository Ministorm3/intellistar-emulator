function setGreetingPage(){
  getElement("hello-location-text").innerHTML = cityName + ",";
  getElement("infobar-location-text").innerHTML = cityName;
  getElement("greeting-text").innerHTML = greetingText;
}

function setTimelineEvents(){
  var row = getElement('timeline-events')
  for(var i = 0; i < pageOrder.length; i++){
    var cell = row.insertCell(i);
    cell.style.width = '280px';
    cell.align = 'left';
    cell.innerHTML = pageOrder[i].name;
  }
}

function setRadarImages(){
  radarImage = new Image();
  radarImage.onerror = function () {
    getElement('radar-container').style.display = 'none';
  }
  radarImage.src = 'http://api.wunderground.com/api/' + APIKEY + '/animatedradar/q/MI/'+ zipCode + '.gif?newmaps=1&timelabel=1&timelabel.y=10&num=5&delay=10&radius=100&num=15&width=1235&height=525&rainsnow=1&smoothing=1&noclutter=1';

  if(pageOrder == SINGLE || pageOrder == MULTIPLE){
    zoomedRadarImage = new Image();
    zoomedRadarImage.onerror = function () {
      getElement('zoomed-radar-container').style.display = 'none';
    }
    zoomedRadarImage.src = 'http://api.wunderground.com/api/' + APIKEY + '/animatedradar/q/MI/'+ zipCode + '.gif?newmaps=1&timelabel=1&timelabel.y=10&num=5&delay=10&radius=50&num=15&width=1235&height=525&rainsnow=1&smoothing=1&noclutter=1';
  }
}

function setCurrentConditions(){
  getElement('cc-condition').innerHTML = currentCondition;
  getElement('cc-wind').innerHTML = windSpeed;
  getElement('cc-gusts').innerHTML = gusts;
  getElement('cc-feelslike').innerHTML = feelsLike;
  getElement('cc-pressuretrend').innerHTML = pressureTrend;
  getElement('ccicon').src = 'assets/icons/conditions/' + currentIcon +'.svg';
}

function createLogoElements(){
  var alreadyAddedLogos = [];
  for(var p = 0; p < pageOrder.length; p++){
    for (var s = 0; s < pageOrder[p].subpages.length; s++) {
      //for every single sub page
      var currentPage = getPageLogoFileName(pageOrder[p].subpages[s].name);

      if(!alreadyAddedLogos.includes(currentPage)){
        var logo = new Image();
        logo.style.width = '85px';
        logo.style.height = '85px';
        logo.style.marginRight = '20px'
        logo.src = 'assets/timeline/' + currentPage;
        getElement('logo-stack').appendChild(logo);
        alreadyAddedLogos.push(currentPage);
      }
    }
  }
}

// This is the invidual day stuff (Today, Tomorrow, etc.)
function setForecast(){
  // Store all the needed elements as arrays so that they can be referenced in loops
  var forecastNarrativeElement=
  [getElement("today-narrative-text"),
  getElement("tonight-narrative-text"),
  getElement("tomorrow-narrative-text"),
  getElement("tomorrow-night-narrative-text")];

  var forecastTempElement =
  [getElement("today-forecast-temp"),
  getElement("tonight-forecast-temp"),
  getElement("tomorrow-forecast-temp"),
  getElement("tomorrow-night-forecast-temp")];

  var forecastIconElement =
  [getElement("today-forecast-icon"),
  getElement("tonight-forecast-icon"),
  getElement("tomorrow-forecast-icon"),
  getElement("tomorrow-night-forecast-icon")];

  var forecastPrecipElement =
  [getElement("today-forecast-precip"),
  getElement("tonight-forecast-precip"),
  getElement("tomorrow-forecast-precip"),
  getElement("tomorrow-night-forecast-precip")];

  for (var i = 0; i < 4; i++) {
    forecastNarrativeElement[i].innerHTML = forecastNarrative[i];
    forecastTempElement[i].innerHTML = forecastTemp[i];
    forecastPrecipElement[i].innerHTML = forecastPrecip[i];

    var icon = new Image();
    icon.style.width = '100%';
    icon.style.height = '100%';
    icon.src = 'assets/icons/conditions/' + forecastIcon[i] +'.svg';
    forecastIconElement[i].innerHTML = '';
    forecastIconElement[i].appendChild(icon);
  }
}

function setOutlook(){ // Also known as 7day page
  for (var i = 0; i < 7; i++) {
    var textElement = getElement("day" + i + "-text");
    var highElement = getElement("day" + i + "-high");
    var lowElement = getElement("day" + i + "-low");
    var conditionElement = getElement("day" + i + "-condition");
    var containerElement = getElement("day" + i + "-container");
    var iconElement = getElement("day" + i + "-icon");
    var dayIndex = (new Date().getDay()+ i) % 7;

    var icon = new Image();
    icon.style.width = '100%';
    icon.style.height = '100%';
    icon.src = 'assets/icons/conditions/' + outlookIcon[i] +'.svg';
    iconElement.innerHTML = '';
    iconElement.appendChild(icon);

    // Set weekends to transparent
    var isWeekend = dayIndex == 0 || dayIndex == 6;
    if(isWeekend){
      containerElement.style.backgroundColor = "transparent"; //weekend
    }
    textElement.innerHTML = WEEKDAY[dayIndex];

    highElement.innerHTML = outlookHigh[i];
    lowElement.innerHTML = outlookLow[i];
    conditionElement.innerHTML = outlookCondition[i];
  }
}

function setAlertPage(){
  if(alerts.length === 0)
    return;

  if(alerts.length == 1){
    getElement("single-alert0").innerHTML = alerts[0];
  }
  else{
    for(var i = 0; i < Math.min(3, alerts.length); i++){
      var idName = 'alert' + i;
      getElement(idName).innerHTML = alerts[i];
    }
  }
}

/* Because the first page always animates in from bottom, check if
   current page is first and set either left or top to 0px. */
function setInitialPositionCurrentPage(){
  if(pageOrder[0].subpages[0].name == 'current-page'){
    getElement('current-page').style.left = '0px';
  }
  else{
    getElement('current-page').style.top = '0px';
  }
}

function getPageLogoFileName(subPageName){
  switch (subPageName) {
    case "single-alert-page":
      return "8logo.svg";
    break;

    case "multiple-alert-page":
      return "8logo.svg";
    break;

    case "current-page":
      return "thermometer.svg";
    break;

    case "radar-page":
      return "radar1.svg";
    break;

    case "zoomed-radar-page":
      return "radar2.svg";
    break;

    case "today-page":
      return "calendar.svg";
    break;

    case "tonight-page":
      return "calendar.svg";
    break;

    case "tomorrow-page":
      return "calendar.svg";
    break;

    case "tomorrow-night-page":
      return "calendar.svg";
    break;

    case "7day-page":
      return "week.svg";
    break;
  }
}
