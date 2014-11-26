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
    var currentUser = Parse.User.current();
    if (currentUser) {
        // do stuff with the user
        $("#faq-tab").after("<li id='logout-tab'>Log Out</li>");
        document.getElementById("logout-tab").onclick = logout;
        
        // get course code
        var courseCode = window.location.search.match(/code=([^&]*)/);
        if (courseCode) {
            var CourseInstance = Parse.Object.extend("CourseInstance");
            var Snapshot = Parse.Object.extend("Snapshot");
            var query = new Parse.Query(Snapshot);
            var ci = new CourseInstance();
            ci.id = courseCode[1];
            query.equalTo("courseInstanceID", ci);
            query.equalTo("isLatestSnapshot", true);
            query.include("courseInstanceID");
            
            query.find({
              success: function(results) {
                if (results.length == 0) {
                    // we couldn't find any snapshots under this course instance id!
                    window.location.replace("account.html");
                } else {
                    var snapshot = results[0];
                    
                    var courseInst = snapshot.get("courseInstanceID");
                    $("#course-title").html(courseInst.get("courseName") + " with " + courseInst.get("lecturerName"));
                    
                    if (courseInst.get("isLatestCourseInstance")) {
                        $("#edit-link").html("<a href='edit.html?code=" + courseCode[1] + "'>[edit]</a>");
                    }
                    
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
                                $("#course-data").html(lectureNotes);
                            } else {
                                $("#course-data").html("There are no notes yet...");
                            }
                        }
                    }
                    xmlhttp.open("GET",snapshot.get("contents").url(),true);
                    xmlhttp.send();
                    
                    // get archives!
                    var queryCI = new Parse.Query(CourseInstance);
                    queryCI.equalTo("courseGroupID", courseInst.get("courseGroupID"));
                    queryCI.equalTo("isLatestCourseInstance", false);
                    queryCI.limit(5);
                    queryCI.find({
                      success: function(res) {
                        if (res.length == 0) {
                            $("#archives").after("<p>There are no archives for this course.</p>");
                        } else {
                            for (var i = 0; i < res.length; i++) {
                                var CI = res[i];
                                $("#archives").after("<p><a href='course.html?code=" + CI.id + "'>" + CI.get("courseName") + "</a></p>");
                            }
                        }
                      },
                      error: function(error) {
                        alert("Error: " + error.code + " " + error.message);
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
    }
    
    function logout() {
        if (confirm('Are you sure you want to log out?')){
           Parse.User.logOut();
           location.reload();
        }
    }
    
};