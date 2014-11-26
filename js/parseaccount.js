Parse.initialize("b3RgrxIcSd3yugpd2Mc9kQqBE2796Qy6lBR8ril9", "nDjuXxxlKLmtZFNNJPfvF3vUuc6j5QeKL64vFdpZ");
var currentUser = Parse.User.current();
if (!currentUser) {
    // show the signup or login page
    window.location.replace("login.html");
}

window.onload = function(){
    document.getElementById("add-course-button").onclick = addCourse;
    
    var currentUser = Parse.User.current();
    if (currentUser) {
        // do stuff with the user
        $("#faq-tab").after("<li id='logout-tab'>Log Out</li>");
        document.getElementById("logout-tab").onclick = logout;
        
        // set name and email address
        var fullname = currentUser.get("firstName") + " " + currentUser.get("lastName");
        var email = currentUser.get("email");
        
        $("#userfullname").html(fullname);
        $("#useremail").html(email);
        
        // set "current courses"
        
        var CourseGroup = Parse.Object.extend("CourseGroup");
        var Subscription = Parse.Object.extend("Subscription");
        var CourseInstance = Parse.Object.extend("CourseInstance");
        var Snapshot = Parse.Object.extend("Snapshot");
        var query = new Parse.Query(Subscription);
        query.equalTo("userID", currentUser);
        query.include("courseGroupID");
        query.find({
          success: function(results) {
            if (results.length == 0) {
                // you have no subscriptions
                $("#current-courses").append("<p>You have no subscriptions.</p>");
            } else {
                for (var i = 0; i < results.length; i++) { 
                // for each course group, get the latest snapshot
                    var currentCG = results[i].get("courseGroupID");
                    
                    // get latest id of snapshot and place link
                    var queryCI = new Parse.Query(CourseInstance);
                    queryCI.equalTo("courseGroupID", currentCG);
                    queryCI.equalTo("isLatestCourseInstance", true);
                    queryCI.limit(1);
                    queryCI.find({
                      success: function(res) {
                        if (res.length == 0) {
                            // there's no course instances for the first group id, tell admin!
                        } else {
                            var CIid = res[0];
                            $("#current-courses").after("<p><a href='course.html?code=" + CIid.id + "'>" + CIid.get("courseName") + "</a></p>");
                        }
                      },
                      error: function(error) {
                        // alert("Error: " + error.code + " " + error.message);
                      }
                    });
                }
            }
          },
          error: function(error) {
            //alert("Error: " + error.code + " " + error.message);
          }
        });
        
        
        // the next query will get the courseGroups that the user is NOT subscribed to, and add it to #dropdown
        var queryCG = new Parse.Query(CourseGroup);
        queryCG.find({
        success: function(courseGroups) {
            if (courseGroups.length == 0) {
                // you have all the subscriptions
            } else {
                for (var i = 0; i < courseGroups.length; i++) { 
                    var currCG = courseGroups[i];
                    // append to "current-courses"
                    checkSubscription(currCG, currCG.id, function(exists, currCG) {
                        if (!exists) {
                            $("#dropdown").append("<option id='" + currCG.id + "'>" + currCG.get("CourseCode") + ": " + currCG.get("CourseGroupName") + "</option>");
                        }
                    });
                }
            }
        }
        });
    }
    
    function checkSubscription(currCG, findCourseGroupID, callback) {
        var Subscription = Parse.Object.extend("Subscription");
        var querySub = new Parse.Query(Subscription);
        querySub.equalTo("userID", Parse.User.current());
        var cg = new CourseGroup();
        cg.id = findCourseGroupID;
        querySub.equalTo("courseGroupID", cg);
        querySub.find({
            success: function(subs) {
                if (subs.length != 0) {
                    callback(true, currCG);
                } else {
                    callback(false, currCG);
                }
            },
            error: function(error) {
                //alert("Error: " + error.code + " " + error.message);
            }
        });
    }
    
    function logout() {
        if (confirm('Are you sure you want to log out?')){
           Parse.User.logOut();
           location.reload();
        }
    }
    
    function addCourse() {
        var courseToAddID = $("#dropdown").children(":selected").attr("id");
        if (courseToAddID) {
            var CourseInstance = Parse.Object.extend("CourseInstance");
            var query = new Parse.Query(CourseInstance);
            var searchCG = new CourseGroup();
            searchCG.id = courseToAddID;
            query.include("courseGroupID");
            query.equalTo("courseGroupID", searchCG);
            query.find({
                success: function(courseInstanceOfChoice) {
                    var newSub = new Subscription();
                    newSub.set("userID", currentUser);
                    newSub.set("courseGroupID", courseInstanceOfChoice[0].get("courseGroupID"));
                    newSub.set("expired", false);
                    newSub.save().then(function(newSub) {
                        location.reload();
                    }, function(error) {
                          //alert("Error: " + error.code + " " + error.message);
                    });
                }
            });
        } else {
            alert("Please select a valid option");
        }
    }
};