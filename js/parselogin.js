Parse.initialize("b3RgrxIcSd3yugpd2Mc9kQqBE2796Qy6lBR8ril9", "nDjuXxxlKLmtZFNNJPfvF3vUuc6j5QeKL64vFdpZ");
var currentUser = Parse.User.current();
if (currentUser) {
    // you are already logged in
    alert("You are already logged in!");
    // alert("Your user name is: " + Parse.User.current().get("username"));
    window.location.replace("account.html");
} else {
    // please login
    // alert("Please login");
}

window.onload = function(){
    document.getElementById("log_in_button").onclick = login;
    document.getElementById("facebook").onclick = facebookLogin;
     
    $("#input-pw").keyup(function(event){
        if(event.keyCode == 13){
            login();
        }
    });
    $("#input-username").keyup(function(event){
        if(event.keyCode == 13){
            login();
        }
    });
     
    function login() {
        var email = document.forms["logInForm"]["email"].value;
        var pw = document.forms["logInForm"]["pwd"].value;
        Parse.User.logIn(email, pw, {
          success: function(user) {
            // Do stuff after successful login.
            window.location.replace("account.html");
          },
          error: function(user, error) {
            // The login failed. Check error to see why.
            alert("Your credentials are incorrect!");
          }
        });
    }
    
    function facebookLogin() {
        Parse.FacebookUtils.logIn("email", {
          success: function(user) {
            if (!user.existed()) {
                FB.api('/me', function(response) {
                    user.set("firstName",response.first_name);
                    user.set("lastName",response.last_name);
                    user.set("email",response.email);
                    user.save().then(function(user) {
                        window.location.replace("account.html");
                    }, function(error) {
                        alert("Error: " + error.code + " " + error.message);
                    });
                });
            } else {
                window.location.replace("account.html");
            }
          },
          error: function(user, error) {
            alert("User cancelled the Facebook login or did not fully authorize.");
          }
        });
    }
};