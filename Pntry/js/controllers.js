
angular.module('pntry.controllers',[])


.controller('AppCtrl', function($state, $scope, $rootScope,  $ionicModal, $ionicPopup,$ionicPlatform, $cordovaEmailComposer, 
                                 $ionicActionSheet, User, Food, Upload, ImageService, FileService,$cordovaDevice, $cordovaFile, $cordovaCamera, $cordovaFileTransfer) {
  // Form data for the login modal
    
  $scope.foodData = {
  	Name: null,
  	NumberInStock: 0
  };
    
  $scope.loginData = {
    username: null,
    password: null
  };

  $scope.registerData = {
    username: null,
    password: null,
    email: null,
    displayname: null,
    organizationname: null
  };


  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(loginmodal) {
    $scope.loginmodal = loginmodal;
  });

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/register.html', {
    scope: $scope
  }).then(function(registermodal) {
    $scope.registermodal = registermodal;
  });

  $scope.testLoginStatus = function() {     
     User.me().then(function(data){
		//alert(data.result.Email);
      //console.log(data)
      if(!data.result){
        $ionicPopup.alert({
            title: 'Your session has expired',
            template: 'Please login!'
          });
        //go home
        $state.go("app.home");          
        }
    });    
  };

  //open/close routines
  $scope.openLogin = function() {
    $scope.loginmodal.show();
  };
  $scope.closeLogin = function(){
    $scope.loginmodal.hide();
  };
  $scope.openRegister = function() {
    $scope.registermodal.show();
  };
  $scope.closeRegister = function(){
    $scope.registermodal.hide();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    User.login($scope.loginData).then(function(data){
      if(data.result){
        localStorage.setItem("token",data.result.access_token);
        $state.go("app.inventory");
        $scope.loginmodal.hide();
      }
      else{
        $ionicPopup.alert({
            title: data.message,
            template: 'Please try again!'
          });
        }
    });
  };

  // Perform the register action when the user submits the registration form
  $scope.doRegister = function() {

    User.register($scope.registerData).then(function(data){
      if(data.result){
        //log me in
        $scope.loginData.username = $scope.registerData.username;
        $scope.loginData.password = $scope.registerData.password;
        $scope.doLogin();
        $scope.closeRegister();
        $state.go("app.inventory");
    }
    else{
      $ionicPopup.alert({
        title: status.data.message,
        template: 'Please try again!'
        });
      }
    });
  };
    
    //get all the food items in Food data type
    $scope.getAllFood = function() {     
    Food.getAllFood().then(function(data){
          $scope.inventory = data.result;
          $scope.$apply();
        }); 
      };
    //add a new food item to the Food data type. Once added, the Id is returned. Send that Id back to the service and retrieve the food item, then update scope
    $scope.addFood = function(food){
        if(angular.isDefined(food) && angular.isDefined(food.Name)){
        Food.addFood(food).then(function(data){
          Food.getOneFood(data.result.Id).then(function(data){
            $scope.inventory.push(data.result);
            $scope.$apply();
          })
        })
      }
        else{
           $ionicPopup.alert({
              title: 'Food name is required',
              template: 'Please try again!'
            });
          }

      };

     //remove a food item
     $scope.removeFood = function(idx){
        var food_to_delete = $scope.inventory[idx];

          var confirmPopup = $ionicPopup.confirm({
             title: 'Delete?',
             template: 'Are you sure you want to delete this food item?'
           });
           confirmPopup.then(function(res) {
             if(res) {
                Food.removeFood(food_to_delete.Id).then(function(data){              
                  $scope.inventory.splice(idx,1);
                  $scope.$apply();     
                });
             } else {
               $ionicPopup.alert({
                  title: 'Sorry, there was a problem removing this item',
                  template: 'Please try again!'
                });
             }
           });
      };
    
   
    //update the quantity
    $scope.updateFood = function(idx){

        var food_to_update = $scope.inventory[idx];

          var confirmPopup = $ionicPopup.confirm({
             title: 'Update?',
             template: 'Are you sure you want to update this food item?'
           });
           confirmPopup.then(function(res) {
             if(res) {
                Food.updateFood(food_to_update).then(function(data){
                  $scope.$apply();     
                });
             } else {
               $ionicPopup.alert({
                  title: 'Sorry, there was a problem updating this item',
                  template: 'Please try again!'
                });
             }
           });
      };

  	 $scope.getNeededFoods = function() {    
      	Food.getNeededFoods().then(function(data){
   			$scope.neededfood = data.result;
    		$scope.$apply();
    	});
     };
    
	$scope.getSortedFoods = function() {    
  		Food.getSortedFoods().then(function(data){
    		$scope.sortedfood = data.result;
    		$scope.$apply();
        });
	};
    
    var selected = $scope.selected = [];
    //checking or unchecking a checkbox is tracked, and $scope.selected is incremented and decremented
    $scope.updateSelection = function(e,id){
       var checkbox = e.target;
       var action = (checkbox.checked ? 'add' : 'remove');
          if (action == 'add' & selected.indexOf(id) == -1) selected.push(id);
          if (action == 'remove' && selected.indexOf(id) != -1) selected.splice(selected.indexOf(id), 1);
    };

    //request a donation by sending in the selected Ids and return the number of records updated
    $scope.requestDonation = function() {    
      Food.requestDonation($scope.selected).then(function(data){
        $ionicPopup.alert({
           title: data.result + ' item(s) were requested',
               template: 'Track your requests on the donation requests screen.'
            });
      });
    };
    
    $scope.getAllRequests = function() {    
      Food.getAllRequests().then(function(data){
        $scope.requestedfood = (data.result);
        $scope.$apply();
      }); 
    };
    
    $scope.viewRequest = function(key){      
        Food.getRequestByDate(key).then(function(data){
          var list = ''; 
          for (i = 0; i < data.result.length; i++) {
              list = list + ' ' + data.result[i].Name
          }
           $ionicPopup.alert({
               title: 'You requested:',
               template: list
            });
      });
    };
   
    
       
    // open PhotoLibrary
    $scope.openPhotoLibrary = function() {
        
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };

        $cordovaCamera.getPicture(options).then(function(imageData) {
			var options = {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false
        };
            

            var server = "http://api.everlive.com/v1/JiHugAPcEgftCWfK/Files", filePath = imageData;
			
            var date = new Date();

            var options = {
                fileKey: "file",
                fileName: imageData.substr(imageData.lastIndexOf('/') + 1),
                chunkedMode: false,
                mimeType: "image/jpg"
            };
			alert("test123");
            $cordovaFileTransfer.upload(server, filePath, options).then(function(result) {
                console.log("SUCCESS: " + JSON.stringify(result.response));
                console.log('Result_' + result.response[0] + '_ending');
                alert("success");
                alert(JSON.stringify(result.response));

            }, function(err) {
                console.log("ERROR: " + JSON.stringify(err));
                alert(JSON.stringify(err));
            }, function (progress) {
                // constant progress updates
            });


        }, function(err) {
            // error
            console.log(err);
        });
    };
    
    
     
  
  
})



.controller ('ImageCtrl', function ($scope, $cordovaDevice, $cordovaFile, $ionicPlatform, $cordovaEmailComposer, $ionicActionSheet, ImageService, FileService, AppFileService,FileAPI){
    this.items = []

   	$scope.getAllImages = function() {    
      FileAPI.getAllFiles().then(function(data){
        $scope.allimages = (data.result);
        $scope.$apply();
      }); 
    };
    
	$ionicPlatform.ready(function(){
        //alert('platform ready');
           FileAPI.getAllFiles().then(function(data){
        $scope.allimages = (data.result);
        $scope.$apply();
      }); 

	});
    
 	$scope.getImagegallery = function() { 
        alert('getImagegallery');
      FileService.images().then(function(data){
        $scope.images = (data.result);
        $scope.$apply();
      }); 
    };
    
    $scope.getImagegallery1 = function() {    
  		//$scope.images = FileService.images();
        $scope.$apply();
	};
    
	$scope.urlForImage = function(imageName){
		var trueOrigin = imageName;//cordova.file.dataDirectory + imageName;
    return trueOrigin;
	}

	$scope.addMedia = function(){
		$scope.hideSheet = $ionicActionSheet.show({
			buttons:[
				{text: 'Take photo'},
				{text: 'Photo from library'}
			],
			titleText: 'Add Images',
			cancelText: 'Cancel',
			buttonClicked: function(index){
				$scope.addImage(index);
			}
		});
	}


  $scope.addImage = function(type) {
    $scope.hideSheet();
    ImageService.handleMediaDialog(type).then(function() {
      $scope.$apply();
    });
  }


	$scope.sendEmail = function() {
    if ($scope.images != null && $scope.images.length > 0) {
      var mailImages = [];
      var savedImages = $scope.images;
      if ($cordovaDevice.getPlatform() == 'Android') {
        // Currently only working for one image..
        var imageUrl = $scope.urlForImage(savedImages[0]);
        var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
        var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
        $cordovaFile.copyFile(namePath, name, cordova.file.externalRootDirectory, name)
        .then(function(info) {
          mailImages.push('' + cordova.file.externalRootDirectory + name);
          $scope.openMailComposer(mailImages);
        }, function(e) {
          reject();
        });
      } else {
        for (var i = 0; i < savedImages.length; i++) {
          mailImages.push('' + $scope.urlForImage(savedImages[i]));
        }
        $scope.openMailComposer(mailImages);
      }
    }
  }

  $scope.openMailComposer = function(attachments) {
    var bodyText = '<html><h2>My Images</h2></html>';
    var email = {
        to: 'siva@akikodesign.com',
        attachments: attachments,
        subject: 'Akiko Images',
        body: bodyText,
        isHtml: true
      };
 
    $cordovaEmailComposer.open(email).then(null, function() {
      for (var i = 0; i < attachments.length; i++) {
        var name = attachments[i].substr(attachments[i].lastIndexOf('/') + 1);
        $cordovaFile.removeFile(cordova.file.externalRootDirectory, name);
      }
    });
  }
});
