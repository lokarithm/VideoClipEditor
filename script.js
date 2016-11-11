// Instantiate the app, the 'myApp' parameter must 
var myApp = angular.module('myApp', []);

// Create the controller
myApp.controller('mainCtrl', function ($sce, $scope,$timeout) {
  var defaultVideoUrl='http://grochtdreis.de/fuer-jsfiddle/video/sintel_trailer-480.mp4';
  var video=$('video');
  var vm = this;
  vm.trustAsResourceUrl = $sce.trustAsResourceUrl;
  vm.clips=[];
  vm.isEdit=false;
  vm.tickInterval = 1000;
  vm.EditModeOn = true;

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
    vm.EditingClip.id = clip.id;
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
        if(value.id == vm.EditingClip.id){
          value.name = vm.EditingClip.name;
          value.startTime = vm.EditingClip.startTime;
          value.endTime = vm.EditingClip.endTime;
        }
      });
      vm.isEdit=false;
      vm.ResetEditingClip();
      vm.SaveDataToLocalStorage();
    }
  }

  /**
   * Delete selected clip from vm.clips array
   * @param {Clip} clip
   */
  vm.DeleteClip = function(clip){
    angular.forEach(vm.clips, function(value, key) {
      if(value.id == clip.id){
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
      var clipsCount = vm.clips.length;
      
      if(vm.clips && clipsCount == 1){
        vm.defaultClip.nextClip = vm.clips[clipsCount-1]
      }
      else{
        vm.clips[clipsCount-2].nextClip = vm.clips[clipsCount-1];
      }

      vm.ResetEditingClip();
      vm.SaveDataToLocalStorage();
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
    this.id=vm.clips.length+1;
    this.name=name;
    this.startTime=startTime;
    this.endTime=endTime;
    this.nextClip=null;
    this.errors=[];
  };

  vm.SaveDataToLocalStorage = function(){
    localStorage.setItem("myData", JSON.stringify(vm.clips));
  }

  /**
   * Play select clip's fragment
   */
  Clip.prototype.Play = function(){
    var me = this;
    console.log('me',me);
    vm.videoUrl=vm.formatUrl(defaultVideoUrl,me.startTime,me.endTime);
    video.load();

    var p = new Promise(function(resolve, reject) {
        video[0].play();
        resolve();
    });
    
    p.then(function(){
      
      if(me.nextClip != null){
        var playTime = $timeout(function () {
            me.nextClip.Play();
            clearInterval(playTime);
        },((me.endTime-me.startTime)*1000)+3000);

        $timeout(playTime, vm.tickInterval);
      }
    });
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
  vm.videoUrl = vm.formatUrl(defaultVideoUrl,vm.defaultClip.startTime,vm.defaultClip.endTime);

  // var testClip1=new Clip('TestClip1',6,7);
  // var testClip2=new Clip('TestClip2',40,41);

  // vm.defaultClip.nextClip=testClip1;
  // testClip1.nextClip = testClip2;
  
  // vm.clips.push(testClip1);
  // vm.clips.push(testClip2); 
  
  if (typeof(Storage) !== "undefined") {
      var initData = $.parseJSON(localStorage.getItem("myData"));
      if(initData && initData.length > 0){
        
        angular.forEach(initData,function(value, index){
          var tempClip = new Clip(value.name,value.startTime,value.endTime);
          tempClip.id = value.id;
          
          vm.clips.push(tempClip);
          if(vm.clips.length > 1){
            vm.clips[index-1].nextClip = vm.clips[index];
          }
          
        });
        vm.defaultClip.nextClip = vm.clips[0];
      }
      else{
        vm.clips = [];
      }
  } else {
      // Sorry! No Web Storage support..
      alert('Sorry, localStorage is not supported in your browser.');
  }

});