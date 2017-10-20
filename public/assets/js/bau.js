//this is if we want to add/read the arrays from a firebase database
var config = {
  apiKey: "AIzaSyB1rP8APHhpysEOVtEe3GkxlGO6ZIRsNYg",
  authDomain: "bau-scheduler.firebaseapp.com",
  databaseURL: "https://bau-scheduler.firebaseio.com/",
};
firebase.initializeApp(config);
var database = firebase.database();

//used to randomize arrays
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

//gets all available timeslots for next two weeks
function calculateTimeslots(d) {

  var list = [];
  var olist = [];
  var name = "";
  var tempDate;

  d = new Date(d.setDate(d.getDate() - d.getDay() +1)); //get date for Monday this week
  //set Monday (2 slots)
  d.setHours(9); d.setMinutes(0); d.setSeconds(0); tempDate = d.toISOString(); //9am slot
  list.push(tempDate);
  list.push(d.getTime());
  list.push(name);
  olist.push(list);
  d.setHours(13); d.setMinutes(0); d.setSeconds(0); tempDate = d.toISOString(); //1pm slot
  list = [];
  list.push(tempDate);
  list.push(d.getTime());
  list.push(name);
  olist.push(list);

  //set rest of the week (2 slots per day)
  for(var i = 1; i < 5; i++) {
    d.setDate(d.getDate() + 1);
    d.setHours(9); d.setMinutes(0); d.setSeconds(0); tempDate = d.toISOString(); //9am slot
    list = [];
    list.push(tempDate);
    list.push(d.getTime());
    list.push(name);
    olist.push(list);
    d.setHours(13); d.setMinutes(0); d.setSeconds(0); tempDate = d.toISOString(); //1pm slot
    list = [];
    list.push(tempDate);
    list.push(d.getTime());
    list.push(name);
    olist.push(list);
  }

  d.setDate(d.getDate() + 2); //add two days for the weekend

  //set rest of 2nd week (2 slots per day)
  for(var i = 1; i < 6; i++) {
    d.setDate(d.getDate() + 1);
    d.setHours(9); d.setMinutes(0); d.setSeconds(0); tempDate = d.toISOString(); //9am slot
    list = [];
    list.push(tempDate);
    list.push(d.getTime());
    list.push(name);
    olist.push(list);
    d.setHours(13); d.setMinutes(0); d.setSeconds(0); tempDate = d.toISOString(); //1pm slot
    list = [];
    list.push(tempDate);
    list.push(d.getTime());
    list.push(name);
    olist.push(list);
  }

  return olist;
}

$(document).ready(function() {

  //sets users array (could be read from database in the future)
  var users = [["Mike", "GMT"],["Dave", "GMT"],["John", "GMT"],["Iain", "GMT"],["Linda", "GMT"],["James", "GMT"],["Jenny", "GMT"],["Luiza", "GMT"],["Kelly", "GMT"],["Paul", "GMT"]];
  //gets all available timeslots for this current week
  var currentTimeslots = calculateTimeslots(new Date());
  //change this number to increase amount of timeslots per user
  var timeSlotsPerUser = 3;

  //console.log(currentTimeslots); //used for testing array

  //loop through all users
  for(var u = 0; u < users.length; u++) {

    //randomize the timeslots
    currentTimeslots = shuffle(currentTimeslots);

    //get user credentials
    var userName = users[u][0];
    var userTimezone = users[u][1];

    //loop through all timeslots
    for(var i = 0; i < currentTimeslots.length; i++) {

      //loop through to find if user already exists in any timeslots
      var found = 0;
      var addToTimeslot = 0;
      var foundTimeslot = [];
      for(var t = 0; t < currentTimeslots.length; t++) {
        if(currentTimeslots[t][2]==userName){
          found++;
          foundTimeslot.push(found);
        }
      }

      if(!currentTimeslots[i][2]) { //if name empty (meaning: timeslot is available)

        if(addToTimeslot<timeSlotsPerUser) {
          if(found!=0) { //here is where the user already has a timeslot and checks if consecutive days (only need if we want to add more than 1 timeslot per user)

            for(var f = 0; f < foundTimeslot.length; f++) {
              var currentFound = new Date(currentTimeslots[foundTimeslot[f]][0]);
              var currentToday = new Date(currentTimeslots[i][0]);
              var currentYesterday = new Date(currentTimeslots[i][0]);
              var currentTomorrow = new Date(currentTimeslots[i][0]);
              currentYesterday.setDate(currentYesterday.getDate() - 1);
              currentTomorrow.setDate(currentTomorrow.getDate() + 1);
              if(currentFound.getDate() != currentToday.getDate() || currentFound.getDate() != currentYesterday.getDate() || currentFound.getDate() != currentTomorrow.getDate()) {
                //console.log("found :"+currentFound);
              } else {
                currentTimeslots[i][2] = userName; //add user to this timeslot
                addToTimeslot++;
              }
            }

          } else { //no other timeslots associated with this user
            currentTimeslots[i][2] = userName; //add user to this timeslot
            addToTimeslot++;
          }
        }

      }

    }

  }

  var eventsData = []; //create json object
  var displayId = 0;

  //store event timeslots to display that have been allocated to users
  for(var i = 0; i < currentTimeslots.length; i++) {
    if(currentTimeslots[i][2]) {
      displayId++;
      var displayUser = currentTimeslots[i][2]+"'s turn to do support";
      var displayTime = currentTimeslots[i][1];
      startDate = new Date(displayTime);
      endDate = new Date(displayTime);
      endDate.setHours(endDate.getHours() + 4); //4 hours for support shift
      eventsData.push({
          id: displayId,
          title: displayUser,
          start: startDate.toISOString(),
          end: endDate.toISOString()
      });
    }
  }

  //console.log(eventsData);

  $('#calendar').fullCalendar({
    header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay'
		},
    weekends: false,
    firstDay: 1,
		defaultView: 'listMonth',
		events: eventsData //could have used a URL to PHP API which created the events data in JSON format but was quicker to do in Javascript
	});

  //binds button for switching calendar views
  $("#changeView").on("click", function() {
    var currentView = $('#calendar').fullCalendar('getView');
    if(currentView.type=='listMonth'){
      $('#calendar').fullCalendar('changeView', 'month');
    } else {
      $('#calendar').fullCalendar('changeView', 'listMonth');
    }
  });

});
