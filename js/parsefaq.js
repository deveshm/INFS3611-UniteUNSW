Parse.initialize("b3RgrxIcSd3yugpd2Mc9kQqBE2796Qy6lBR8ril9", "nDjuXxxlKLmtZFNNJPfvF3vUuc6j5QeKL64vFdpZ");
var currentUser = Parse.User.current();

window.onload = function(){
    
    var currentUser = Parse.User.current();
    if (currentUser) {
        // do stuff with the user
        $("#faq-tab").after("<li id='logout-tab'>Log Out</li>");
        document.getElementById("logout-tab").onclick = logout;
    } else {
        $("#faq-tab").after("<li id='signin-tab'><a href='login.html'>Sign In</a></li>");
    }
    
    function logout() {
        if (confirm('Are you sure you want to log out?')){
           Parse.User.logOut();
           location.reload();
        }
    }
};