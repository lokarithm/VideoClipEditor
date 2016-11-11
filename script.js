// Instantiate the app, the 'myApp' parameter must 
var myApp = angular.module('myApp', []);

// Create the controller
myApp.controller('mainCtrl', function ($sce, $scope) {
  var defaultVideoUrl='http://grochtdreis.de/fuer-jsfiddle/video/sintel_trailer-480.mp4';
  var video=$('video');
  var vm = this;
  vm.clips=[];  

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
   * Delete selected clip from vm.clips array
   * @param {Clip} clip
   */
  vm.DeleteClip = function(clip){
    angular.forEach(vm.clips, function(value, key) {
      if(value.$$hashKey===clip.$$hashKey){
        vm.clips.splice(key,1);
      }
    });
  }

  /**
   * Add new Clip to vm.clips array
   */
  vm.AddClip = function(){
    vm.clips.push(angular.copy(vm.newClip));
    delete vm.newClip;
    vm.newClip=new Clip();
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
  };

  /**
   * Play select clip's' fragment
   */
  Clip.prototype.Play = function(){
    vm.videoUrl=vm.formatUrl(defaultVideoUrl,this.startTime,this.endTime);
    video.load();
    video[0].play();
  }

  /**
   * Play select clip's' fragment by jump to the start time without reloading the video
   * TO-DO: fix bug of not able to play after playing a few clips back and forth
   */
  Clip.prototype.SmoothPlay = function(){
    video[0].currentTime=this.startTime;
    video[0].play();
    var pauseTime=this.endTime;
    var videoLength=Math.round(video[0].duration);

    if(pauseTime < videoLength){
      video[0].addEventListener("timeupdate", function(){
          if(this.currentTime >= pauseTime) {
              this.pause();
          }
      });
    }  
  }

  vm.newClip=new Clip();
  vm.defaultClip=new Clip('Full Video',0,52);

  var testClip1=new Clip('TestClip1',6,7);
  var testClip2=new Clip('TestClip2',40,41);
  var testClip2=new Clip('TestClip2',49,52);
  
  vm.videoUrl = vm.formatUrl(defaultVideoUrl,vm.defaultClip.startTime,vm.defaultClip.endTime);

  vm.trustAsResourceUrl = $sce.trustAsResourceUrl;
  vm.clips.push(testClip1);
  vm.clips.push(testClip2); 

});