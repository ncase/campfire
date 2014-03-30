// DOM PARTS
var sceneDOM = document.getElementById("scene");
var passageDOM = document.getElementById("passage");
var editorTextDOM = document.getElementById("editor_text");
var gameStateDOM = document.getElementById("game_state");

// PLAYER DATA
var my = {};

// RENDER SCENE
var currentScene = "Start";
var markdownConverter = new Showdown.converter();
var renderScene = function(name){

	var scene = Game.scenes[name];

	// If no scene, create a new one.
	if(!scene){
		alert("No scene by the name '"+name+"' exists! Creating new scene...");
		Game.scenes[name] = {
			markdown: name
		};
		renderScene(name);
		return;
	}

	// Save the current game state, though
	savedMy = JSON.parse(JSON.stringify(my));

	// This is the current scene, now.
	currentScene = name;

	// First, run the scripting logic on the world data
	var md = _.template(scene.markdown)();

	// Markdown, editing links & image links
	md = md.replace(/\]\(\'([^\/^\)]*)\'\)/g,"](#SceneLink '$1')"); // As long as it's not an ACTUAL link, replace it
	md = md.replace(/\]\(\"([^\/^\)]*)\"\)/g,"](#SceneLink '$1')"); // Other quotes work, too

	// Replace all links with Render Scene redirects
	passageDOM.innerHTML = markdownConverter.makeHtml(md);
	var links = document.querySelectorAll("#passage a");
	for(var i=0;i<links.length;i++){
		var link = links[i];
		// If it's a fake link
		if(link.href==location.href+"#SceneLink"){
			var sceneName = link.title;
			link.removeAttribute("href");
			link.removeAttribute("title");
			(function(sceneName){
				link.onclick = function(){
					renderScene(sceneName);
				};
			})(sceneName);
		}else{
			link.target="_blank";
		}
	}

};

var savedMy = null;
var startEdit = function(){
	sceneDOM.setAttribute("edit","yes");
	editorTextDOM.value = Game.scenes[currentScene].markdown;
	editorTextDOM.focus();
	gameStateDOM.innerHTML="EDITING";
};
var saveScene = function(){
	Game.scenes[currentScene].markdown = editorTextDOM.value;
};
var stopEdit = function(){
	my = JSON.parse(JSON.stringify(savedMy));
	sceneDOM.setAttribute("edit","no");
	renderScene(currentScene);
	gameStateDOM.innerHTML="PLAYING";
};
var showSource = function(){
	sceneDOM.setAttribute("export","yes");
	editorTextDOM.value = JSON.stringify(Game,null,4);
	editorTextDOM.focus();
	gameStateDOM.innerHTML="EXPORT/IMPORT";
}
var restartStory = function(){
	my = {};
	renderScene('Start');
};
var backToStory = function(){
	try{
		var json = JSON.parse(editorTextDOM.value);
		Game = json;
		sceneDOM.setAttribute('edit','no');
		sceneDOM.setAttribute('export','no');
		restartStory();
		gameStateDOM.innerHTML="PLAYING";
	}catch(e){
		alert("Error parsing Story File!");
	}
};

renderScene("Start");