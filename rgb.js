var r=255,g=0,b=0;

setInterval(function(){
  if(r > 0 && b == 0){
    r--;
    g++;
  }
  if(g > 0 && r == 0){
    g--;
    b++;
  }
  if(b > 0 && g == 0){
    r++;
    b--;
  }
  $("#MS").text("I'm Live!");
  $("#MS").css("background-color","rgb("+r+","+g+","+b+")");
  $('#MS2').css("background-color","rgb("+r+","+g+","+b+")");
  },10);