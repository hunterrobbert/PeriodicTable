define(function(require, exports, module) {
	var Engine  = require('famous/core/Engine');
	var AppView = require('views/AppView');

	var appView = new AppView();

	var mainContext = Engine.createContext();
	mainContext.setPerspective(1000);

	mainContext.add(appView);
});
