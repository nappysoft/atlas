"use strict";

var graphics = (function () {
	var objects = {};
	var buffer = undefined,
		bufferContext = undefined,
		bufferWidth = 0,
		bufferHeight = 0,
		bufferRect = undefined;

	function copy(canvas,rect){
	
	};

	function paste(canvas,x,y){
	
	};

	function clear(canvas,rect){

	};

	function transfer(){};

	function init() {
		buffer = document.createElement('canvas');
		bufferContext = buffer.getContext('2d');
		bufferRect = Object.create(objects.rect);
	};

	objects.rect = {
		top : 0,
		left : 0,
		right : 0,
		bottom : 0,
		width : 0,
		height : 0,
		centerX : 0,
		centerY : 0
	};

	objects.rgb = {
		r:0,
		g:0,
		b:0
	};
	objects.rgba = {
		r:0,
		g:0,
		b:0,
		a:0
	};

	objects.point = {
		x : 0,
		y : 0
	};

	objects.lineSegment = {
		x1:0,
		x2:0,
		y1:0,
		y2:0
	};

	objects.line = {
		start:null,
		end:null,
		segments:[]
	};

	objects.triangle = {
		a:null,
		b:null,
		c:null
	};

	objects.circle = {
		center:null,
		radius:0
	};

	return {
		objects:objects,
		init:init,
		copy:copy,
		paste:paste,
		clear:clear,
		transfer:transfer
	};
}());

var display = (function () {
	var that = this,
		canvas = undefined,
		buffer = undefined,
		buffers = [],
		activeBuffer = 0,
		containerElement = undefined;

	function getActiveBuffer () {
		return buffers[activeBuffer];
	};
	function getActiveBufferContext () {
		return getActiveBuffer().getContext('2d');
	};
	function setActiveBuffer (bufferID) {
		activeBuffer = bufferID;
		buffer = buffers[activeBuffer];
	};
	function selectBuffer (bufferID) {
		return buffers[bufferID];
	};
	function clearBuffer () {
		var currentBuffer = getActiveBuffer(),
			btx = currentBuffer.getContext('2d');
		btx.clearRect(0,0,currentBuffer.width,currentBuffer.height);
	};
	function writeBuffer () {
		var currentBuffer = getActiveBuffer(),
			ctx = canvas.getContext('2d');
		ctx.drawImage(currentBuffer,0,0);
	};

	function init (container,width,height,bufferCount) {
		if (!container) {
			throw new Error('display.init() : function needs a container name passed');
			return;
		}
		bufferCount = (bufferCount !== 0) ? bufferCount : 1 || 1;
		width = width || 1;
		height = height || 1;

		containerElement = document.getElementById(container);
		if (!containerElement) {
			throw new Error('display.init() : could not find the container ['+container+']');
			return;
		}
		canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		for (var itr = 1,buff; itr <= bufferCount; itr += 1) {
			buff = document.createElement('canvas')
			buff.width = width;
			buff.height = height;
			buffers.push(buff);
		}	
		containerElement.appendChild(canvas);
		//console.log(buffers);

		return;
	};

	return {
		init:init,
		writeBuffer:writeBuffer,
		clearBuffer:clearBuffer,
		getActiveBuffer:getActiveBuffer,
		getActiveBufferContext:getActiveBufferContext,
		setActiveBuffer:setActiveBuffer,
		selectBuffer:selectBuffer
	};

}());
var atlas = (function () {
	var that = this;

	function loadAtlasXHRSync (uri,texturePath,data,images) {
		var xhrObject,atlasFile,atlasData,textureImage;
		xhrObject = new XMLHttpRequest;
		xhrObject.open('GET',uri,false);
		xhrObject.send();
		if (xhrObject.status !== 200) {
			throw new Error('network_error: loadAtlas() : could not load the requested uri. ['+uri+']');
			return;
		}
		atlasFile = xhrObject.response;
		//console.log(atlasFile);
		try {atlasData = JSON.parse(atlasFile);} catch (e) {
			throw new Error('json_parse_error: loadAtlas() : could not parse the atlas file.');
			return;
		}
		if (!atlasData.meta.image) {
			throw new Error('atlas_parse_error: loadAtlas() : could not find the "meta.image" key in the atlas data.');
			return;
		}
		data[uri] = atlasData;
		textureImage = new Image();
		textureImage.onload = function () {
			images[uri] = textureImage;
		};
		textureImage.onerror = function () {
			images[uri] = undefined;
		}
		textureImage.src = texturePath + '/'+ atlasData.meta.image;

		return;
	};

	return {
		loadAtlasXHRSync: loadAtlasXHRSync
	};
}());

window.addEventListener('load',function loader () {
	var data = {},images = {};
	var interval = 100,
		numTicks = 10,
		currentTick = 0,
		timer = undefined;

	var resolvedPath = './',
		texturePath = resolvedPath + 'img',
		atlasUri = texturePath + '/sphere.texturepacker';

	display.init('divMain',400,400,2);

	atlas.loadAtlasXHRSync(atlasUri,texturePath,data,images);

	timer = setInterval(function () {
		currentTick += 1;
		if (currentTick >= numTicks) {
			clearInterval(timer);
		}
		//console.log(data[atlasUri].meta.image);
		//console.log(images[atlasUri])
		display.clearBuffer();
		display.getActiveBufferContext().drawImage(images[atlasUri],0,0);
		display.writeBuffer();
	},interval);
});