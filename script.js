// Instantiate the app, the 'myApp' parameter must 
var myApp = angular.module('myApp', []);

// Create the controller
myApp.controller('mainCtrl', function ($sce, $scope) {
  var defaultVideoUrl='http://grochtdreis.de/fuer-jsfiddle/video/sintel_trailer-480.mp4';
  var video=$('video');
  var vm = this;
  vm.clips=[];
  vm.isEdit=false;

  /**
   * Concatenate the baseUrl with startTime and endTime.
   * @param {string} baseUrl
   * @param {Number} startTime
   * @param {Number} endTime
   * @return {string} formatedUrl
   */
  vm.formatUrl = function(baseUrl,startTime,endTime){
    return baseUrl+'#t='+startTime+','+endTime;
  } 

  /**
   * Edit selected clip from vm.clips array
   * @param {Clip} clip
   */
  vm.EditClip = function(clip){
    vm.isEdit=true;
    vm.EditingClip = angular.copy(clip);
    vm.EditingClip.$$hashKey = clip.$$hashKey;
  }

  /**
   * Cancel edit mode
   */
  vm.Cancel = function(){
    vm.isEdit=false;
    vm.ResetEditingClip();
  }

  vm.SaveClip = function(){
    if(vm.EditingClip.Validation()){
      angular.forEach(vm.clips, function(value, key) {
        if(value.$$hashKey == vm.EditingClip.$$hashKey){
          value.name = vm.EditingClip.name;
          value.startTime = vm.EditingClip.startTime;
          value.endTime = vm.EditingClip.endTime;
        }
      });
      vm.isEdit=false;
      vm.ResetEditingClip();
    }
  }

  /**
   * Delete selected clip from vm.clips array
   * @param {Clip} clip
   */
  vm.DeleteClip = function(clip){
    angular.forEach(vm.clips, function(value, key) {
      if(value.$$hashKey == clip.$$hashKey){
        vm.clips.splice(key,1);
      }
    });
  }

  /**
   * Add new Clip to vm.clips array
   */
  vm.AddClip = function(){
    if(vm.EditingClip.Validation()){
      vm.clips.push(angular.copy(vm.EditingClip));
      vm.ResetEditingClip();
    }    
  }

  vm.ResetEditingClip = function(){
    delete vm.EditingClip;
    vm.EditingClip=new Clip();
  }

  /**
   * Clip object definition
   * @param {string} name 
   * @param {Number} startTime
   * @param {Number} endTime
   */
  var Clip = function(name, startTime, endTime){
    this.name=name;
    this.startTime=startTime;
    this.endTime=endTime;
    this.errors=[];
  };

  /**
   * Play select clip's fragment
   */
  Clip.prototype.Play = function(){
    vm.videoUrl=vm.formatUrl(defaultVideoUrl,this.startTime,this.endTime);
    video.load();
    video[0].play();
  }

  /**
   * Validate all the inputs
   */
  Clip.prototype.Validation = function(){
    delete this.errors;
    this.errors = [];

    var videoDuration = video[0].duration;

    if(!this.name){
      this.errors.push('Clip name cannot be empty');
    }

    if(!this.startTime){
      this.errors.push('Start time cannot be empty');
    }
    else{
      if(!Number(this.startTime)){
        this.errors.push('Start time must be a numeric value');
      }
    }
    
    if(!this.endTime){
      this.errors.push('End time cannot be empty');
    }
    else{
      if(!Number(this.endTime)){
        this.errors.push('End time must be a numeric value');
      }
    }

    if(this.startTime && this.endTime){
      if(this.startTime == this.endTime){
        this.errors.push('Start time value cannot be equal to the end time');
      }

      if(this.startTime > this.endTime){
        this.errors.push('Start time value cannot be larger than the end time');
      }

      if(this.startTime > videoDuration){
        this.errors.push('Start time cannot be larger than the video duration');
      }

      if(this.endTime > videoDuration){
        this.errors.push('End time cannot be larger than the video duration');
      }
    }

    return this.errors.length == 0;
  }

  vm.EditingClip=new Clip();
  vm.defaultClip=new Clip('Full Video',0,52);

  var testClip1=new Clip('TestClip1',6,7);
  var testClip2=new Clip('TestClip2',40,41);
  var testClip2=new Clip('TestClip2',49,52);
  
  vm.videoUrl = vm.formatUrl(defaultVideoUrl,vm.defaultClip.startTime,vm.defaultClip.endTime);

  vm.trustAsResourceUrl = $sce.trustAsResourceUrl;
  vm.clips.push(testClip1);
  vm.clips.push(testClip2); 

});