'use strict';

var openedFileName;
var activeBind;
var activeModel;

// Setup Material select
$(document).ready(function() {
	$('select').material_select();
});

function openOpenDialog(callback, accept) {
	var fileSelector = $('<input type="file">');
	if (accept) fileSelector.attr('accept', accept);
	fileSelector.change(function() {
		var files = fileSelector[0].files;
		if (files.length) {
			callback(files[0]);
		} else {
			callback(null);
		}
	});
	fileSelector.click();
}

$('#button-upload').click(function() {
	openOpenDialog(function(file) {
		if (file) {
			var reader = new FileReader();
			reader.onload = function() {
				try {
					loadJSON(parseSaveData(reader.result));
				} catch (e) {
					alert('不是有效的CM3D2存档');
				}
				openedFileName = file.name.replace(/\.[^.]+$/, '');
			}
			reader.readAsArrayBuffer(file);
		}
	}, '.save');
});

$('#button-loadjson').click(function() {
	openOpenDialog(function(file) {
		if (file) {
			var reader = new FileReader();
			reader.onload = function() {
				try {
					loadJSON(JSON.parse(reader.result));
				} catch (e) {
					alert('不是有效的JSON');
				}
				openedFileName = file.name.replace(/\.[^.]+$/, '');
			}
			reader.readAsText(file);
		}
	}, '.json');
});

$('#button-download').click(function() {
	if (!activeModel) {
		alert('你还没有加载任何文件');
		return;
	}
	saveAs(new Blob([new Uint8Array(writeSaveData(activeModel))]), openedFileName + '.save');
});

$('#button-savejson').click(function() {
	if (!activeModel) {
		alert('你还没有加载任何文件');
		return;
	}
	saveTextAs(JSON.stringify(activeModel, null, 2), openedFileName + '.json');
});

function loadJSON(model) {
	if (activeModel) {
		activeModel.version = model.version;
		activeModel.header = model.header;
		activeModel.chrMgr = model.chrMgr;
		activeModel.script = model.script;
	} else {
		activeModel = model;
		activeBind = rivets.bind($('body'), activeModel);
	}

	$("input").change();
	$("textarea").change().keydown();
	$('select').material_select('update');
	$("select").closest('.input-field').children('span.caret').remove();
	$('.collapsible').collapsible();
}

rivets.formatters.int32 = {
	read: function(value) {
		return value;
	},
	publish: function(value) {
		return parseInt(value);
	}
};

rivets.formatters.int64 = {
	read: function(value) {
		return new Long(value[0], value[1]).toString();
	},
	publish: function(value) {
		try {
			var long = Long.fromString(value);
		} catch (e) {
			return [0, 0];
		}
		return [long.low_, long.high_];
	}
};

rivets.formatters.image = function(base64) {
	return 'data:image/png;base64,' + base64;
}

rivets.formatters.format = function(data, string) {
	return string.replace('$0', data);
};

$(function() {
	var templates = $('script[type="text/template"]');
	for (var i = 0; i < templates.length; i++) {
		var t = $(templates[i]);
		t.before(t.text()).remove();
	}
});