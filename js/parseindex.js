window.onload = function(){ 
    Parse.initialize("b3RgrxIcSd3yugpd2Mc9kQqBE2796Qy6lBR8ril9", "nDjuXxxlKLmtZFNNJPfvF3vUuc6j5QeKL64vFdpZ");
    var currentUser = Parse.User.current();
    
    if (currentUser) {
        $(".welcome").hide();
        // you are already logged in
        $("#content_right").hide();
        $("#content_left").hide();
        
        $("#faq-tab").after("<li id='logout-tab'>Log Out</li>");
        document.getElementById("logout-tab").onclick = logout;
    } else {
        // please login
        $(".welcome").hide();
        $("#content_right").html("<button id='facebook'>Sign-up with Facebook</button>");
        $("#content_left").html("<h2 style='padding: 0 0 0 90px;'>Create Account</h2><form name='signUpForm'>First name: <input type='text' name='firstname'>Last name: <input type='text' name='lastname'><br>Email: <input type='text' name='email'><br>Password: <input type='password' name='pwd'>Confirm Password: <input type='password' name='confirmpwd'><p><input id='sign_up_button' class='button' name='signup' type='button' value='Sign-Up' /></p></form> ");
        document.getElementById("sign_up_button").onclick = signUp;
        document.getElementById("facebook").onclick = facebookLogin;
        
        $("#faq-tab").after("<li id='signin-tab'><a href='login.html'>Sign In</a></li>");
    }
    
    $('.jcarousel').jcarousel();

    $('.jcarousel-control-prev')
        .on('jcarouselcontrol:active', function() {
            $(this).removeClass('inactive');
        })
        .on('jcarouselcontrol:inactive', function() {
            $(this).addClass('inactive');
        })
        .jcarouselControl({
            target: '-=1'
        });

    $('.jcarousel-control-next')
        .on('jcarouselcontrol:active', function() {
            $(this).removeClass('inactive');
        })
        .on('jcarouselcontrol:inactive', function() {
            $(this).addClass('inactive');
        })
        .jcarouselControl({
            target: '+=1'
        });

    $('.jcarousel-pagination')
        .on('jcarouselpagination:active', 'a', function() {
            $(this).addClass('active');
        })
        .on('jcarouselpagination:inactive', 'a', function() {
            $(this).removeClass('active');
        })
        .jcarouselPagination();
    
    function signUp() {
        var fname = document.forms["signUpForm"]["firstname"].value;
        var lname = document.forms["signUpForm"]["lastname"].value;
        var email = document.forms["signUpForm"]["email"].value;
        var pw = document.forms["signUpForm"]["pwd"].value;
        var confpw = document.forms["signUpForm"]["confirmpwd"].value;
        
        var errors = validateSignUpForm(fname, lname, email, pw, confpw);
        if (errors == "") {
            parseSignUp(fname, lname, email, pw);
        } else {
            alert(errors);
        }
    }
    
    function logout() {
        if (confirm('Are you sure you want to log out?')){
           Parse.User.logOut();
           location.reload();
        }
    }
    
    function parseSignUp(fname, lname, email, pw) {
        // parse user:
        var user = new Parse.User();
        user.set("username", email);
        user.set("firstName", fname);
        user.set("lastName", lname);
        user.set("email", email);
        user.set("password", pw);
          
        user.signUp(null, {
          success: function(user) {
            $(".welcome").html("<h3 style='text-align: center;'> Welcome to UNIte! The wiki for UNSW students!</h3> <h2 style='text-align: center;'> Please <a href='login.html'>login</a> now.<h2>");
            $("#content_right").hide();
            $("#content_left").hide();
            
            Parse.User.logOut();
          },
          error: function(user, error) {
            // Show the error message somewhere and let the user try again.
            alert("Error: " + error.code + " " + error.message);
          }
        });
    }
    
    
    function validateSignUpForm(fname, lname, email, pw, confpw) {
        var returnValue = "";
        
        if (pw != confpw) {
            returnValue = returnValue.concat("Passwords do not match!\n");
        }
        if (pw.length < 8) {
            returnValue = returnValue.concat("Password must be longer than 8 characters\n");
        }
        if (fname == "") {
            returnValue = returnValue.concat("First name cannot be blank\n");
        }
        if (lname == "") {
            returnValue = returnValue.concat("Last name cannot be blank\n");
        }
        if (email == "") {
            returnValue = returnValue.concat("Email cannot be blank\n");
        }
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!re.test(email)) {
            returnValue = returnValue.concat("Please enter a valid email address\n");
        }
        
        return returnValue;
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
                        location.reload();
                    }, function(error) {
                        alert("Error: " + error.code + " " + error.message);
                    });
                });
            } else {
                location.reload();
            }
          },
          error: function(user, error) {
            alert("User cancelled the Facebook login or did not fully authorize.");
          }
        });
    }
};