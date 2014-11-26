Parse.initialize("b3RgrxIcSd3yugpd2Mc9kQqBE2796Qy6lBR8ril9", "nDjuXxxlKLmtZFNNJPfvF3vUuc6j5QeKL64vFdpZ");
var currentUser = Parse.User.current();
if (!currentUser) {
    // show the signup or login page
    window.location.replace("login.html");
}
var courseCode = window.location.search.match(/code=([^&]*)/);
if (!courseCode) { 
    window.location.replace("account.html");
}

window.onload = function(){
    document.getElementById("save-button").onclick = save;
    document.getElementById("cancel-button").onclick = cancel;
    $('#editor').wysiwyg();
    
    var currentUser = Parse.User.current();
    if (currentUser) {
        // do stuff with the user
        $("#faq-tab").after("<li id='logout-tab'>Log Out</li>");
        document.getElementById("logout-tab").onclick = logout;
        
        var courseCode = window.location.search.match(/code=([^&]*)/);
        
        var CourseInstance = Parse.Object.extend("CourseInstance");
        var Snapshot = Parse.Object.extend("Snapshot");
        
        var querySS = new Parse.Query(Snapshot);
        var ci = new CourseInstance();
        ci.id = courseCode[1];
        querySS.equalTo("courseInstanceID", ci);
        querySS.equalTo("isLatestSnapshot", true);
        querySS.include("courseInstanceID");
        
        querySS.find({
          success: function(snaps) {
            if (snaps.length == 0) {
                // error, go back to account page
                alert("No snapshots found!");
                window.location.replace("account.html");
            } else {
                var snapshot = snaps[0];
                
                var CIid = snapshot.get("courseInstanceID");
                if (!CIid.get("isLatestCourseInstance")) {
                    // you can't edit an archived course instance!
                    window.location.replace("account.html");
                }
                $("#course-title").html(CIid.get("courseName") + " with " + CIid.get("lecturerName"));
                
                
                // ajax request for course contents
                var xmlhttp;
                if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
                    xmlhttp = new XMLHttpRequest();
                } else {// code for IE6, IE5
                    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
                }
                xmlhttp.onreadystatechange = function() {
                    if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                        lectureNotes = xmlhttp.responseText;
                        if (lectureNotes) {
                            $("#editor").html( lectureNotes );
                        } else {
                            $("#editor").html("There are no notes yet...");
                        }
                        
                        var seconds_left = 60;
                        var interval = setInterval(function() {
                            document.getElementById('timer_div').innerHTML = --seconds_left;

                            if (seconds_left <= 0) {
                                // save here
                                clearInterval(interval);
                                save();
                            }
                        }, 1000);
                    }
                }
                xmlhttp.open("GET",snapshot.get("contents").url(),true);
                xmlhttp.send();
            }
          },
          error: function(error) {
            alert("Error: " + error.code + " " + error.message);
            window.location.replace("account.html");
          }
        });
    }
    
    function logout() {
        if (confirm('Are you sure you want to log out?')){
           Parse.User.logOut();
           location.reload();
        }
    }
    
    function cancel() {
        if (confirm('Are you sure you want to cancel? Your changes will not be saved.')){
            var courseCode = window.location.search.match(/code=([^&]*)/);
            window.location.replace("course.html?code=" + courseCode[1] + "");
        }
    }
    
    function save() {
        $("#main").after("<div id='loading'><img id='loading-image' src='http://s.gif-war.com/gifs/loading4.gif' alt='Loading...' /></div>");
        var courseCode = window.location.search.match(/code=([^&]*)/);
        var Snapshot = Parse.Object.extend("Snapshot");
        // set isCurrentSnapshot to false
        var querySnaps = new Parse.Query(Snapshot);
        var ci = new CourseInstance();
        ci.id = courseCode[1];
        querySnaps.equalTo("courseInstanceID", ci);
        querySnaps.equalTo("isLatestSnapshot", true);
        querySnaps.include("courseInstanceID");
        
        querySnaps.find({
          success: function(snaps) {
            if (snaps.length == 0) {
                // error, go back to account page
                alert("course code: " + courseCode[1]);
                window.location.replace("account.html");
            } else {
                var snapshot = snaps[0];
                snapshot.set("isLatestSnapshot", false);
                snapshot.save(null, {
                  success: function(snapshot) {
                    // create new object and save
                    var text = $('#editor').cleanHtml();
                    var Snapshot = Parse.Object.extend("Snapshot");
                    var ss = new Snapshot();
                    
                    ss.set("userID", Parse.User.current());
                    var base64 = btoa(text);
                    var file = new Parse.File("contents.txt", { base64: base64 });
                    ss.set("contents", file);
                    ss.set("courseInstanceID", snapshot.get("courseInstanceID"));
                    ss.set("isLatestSnapshot", true);
                    ss.save().then(function(ss) {
                        // go back to course page
                        var courseCode = window.location.search.match(/code=([^&]*)/);
                        window.location.replace("course.html?code=" + courseCode[1] + "");
                    }, function(error) {
                          alert("Error: " + error.code + " " + error.message);
                    });
                  },
                  error: function(snapshot, error) {
                    // The save failed.
                    // error is a Parse.Error with an error code and description.
                    alert("the save failed for some reason");
                  }
                });
            }
          },
          error: function(error) {
            alert("Error: " + error.code + " " + error.message);
            window.location.replace("account.html");
          }
        });
    }
};