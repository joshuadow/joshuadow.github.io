function ifIAmLive(){
	console.log("hello")
	if(document.getElementById("logo").src.match("imgs/twitchON.PNG")){
	  document.getElementById("MS").style.visibility="visible";
	  document.getElementById("MS2").style.visibility="visible";
  	  document.getElementById("MS").style.display="block";
	  document.getElementById("MS2").style.display="block";
	}
}