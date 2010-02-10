function AjaxTask(_options) {
  if(!_options.interval) _options.interval = 2000;
  
  if(_options.taskStatusDiv) addTaskDivContent();
  
  function addTaskDivContent() {
    var status = $("<div></div>").attr('class', 'taskStatus');
    _options.taskStatusDiv.append(status);
    _options.taskStatusDiv.hide();
  }
  
  this.start = function(params) {
    startLoading();
	  $.getJSON(_options.url, params, function(data) {
		  if(data.status == 'ok' && data.data) {
			  getTaskStatus(data.data);
		  }
		  else {
			  $(_options.handler).trigger('onTaskError', [data.data]);
		  }
	  });
  }
  
  function getTaskStatus(uuid) {
  	$.getJSON(_options.url, {uuid: uuid}, function(data) {
  		if(data.status == 'pending') {
  			$(_options.handler).trigger('onTaskPending', data.data);
  			setTimeout(function() {
  			  getTaskStatus(uuid);
  			}, _options.interval);
  		}
  		else if(data.status == 'done') {
  			$(_options.handler).trigger('onTaskFinished', [data.data]);
  			finishLoading();
  		}
  		else {
  			$(_options.handler).trigger('onTaskError', [data.data])
  			errorLoading();
  		}
  	});
  }
  
  function startLoading() {
  	if(_options.taskStatusDiv) {
  	  _options.taskStatusDiv.show();
  	  var status = _options.taskStatusDiv.find(".taskStatus");
  	  if(_options.taskStatusLoadingMsg) status.html(_options.taskStatusLoadingMsg);
  	  if(_options.taskStatusLoadingImg) status.append($("<img/>").attr('src', _options.taskStatusLoadingImg).css('margin-left', '5px'));
	  }
  }
  
  function finishLoading() {
  	if(_options.taskStatusDiv) {
  	  _options.taskStatusDiv.hide();
	  }
  }
  
  function errorLoading() {
    if(_options.taskStatusDiv) {
      var status = _options.taskStatusDiv.find(".taskStatus");
  	  if(_options.taskStatusErrorMsg) status.html(_options.taskStatusErrorMsg);
  	  else _options.taskStatusDiv.hide();
    }
  }
  
  
}