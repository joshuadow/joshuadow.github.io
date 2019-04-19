function ifIAmLive(){
	console.log("hello")
	if(document.getElementById("logo").src.match("imgs/twitchON.PNG")){
	  document.getElementById("MS").style.visibility="visible";
	}
}