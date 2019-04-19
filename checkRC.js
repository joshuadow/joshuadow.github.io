function checkRecaptcha() {
  var response = grecaptcha.getResponse();
  if(response.length == 0) { 
    //reCaptcha not verified
    alert("Not correct"); 
  }
  else { 
    //reCaptch verified
    document.getElementById("ac-wrapper").style.display = "none";
  }
}