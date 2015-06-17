
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
      console.log(data)
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
    


    
    
    $scope.urlForImage = function(imageName) {
    	var trueOrigin = cordova.file.dataDirectory + imageName;
    	return trueOrigin;
  	};
 
    $scope.addMedia = function() {
        $scope.hideSheet = $ionicActionSheet.show({
          buttons: [
            { text: 'Take photo' },
            { text: 'Photo from library' }
          ],
          titleText: 'Add images',
          cancelText: 'Cancel',
          buttonClicked: function(index) {
           	 //$scope.addImage(index);
              //$scope.uploadFile(index);
              //$scope.openPhotoLibrary(index);
          }
        });
    };
    
    $scope.uploadFile = function() {
         $scope.hideSheet();
 		Upload.fileTo('http://api.everlive.com/v1/JiHugAPcEgftCWfK/Files').then(
			function(res) {
                 $scope.$apply();
				alert('Success');
			}, function(err) {
                console.log(err);
				//alert('error');
			})
		;
 	};
    
    $scope.addImage = function(type) {
        $scope.hideSheet();
        ImageService.handleMediaDialog(type).then(function() {
          $scope.$apply();
        });
   };
  
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
  	};
 
  	$scope.openMailComposer = function(attachments) {
        var bodyText = '<html><h2>My Images</h2></html>';
        var email = {
            to: 'some@email.com',
            attachments: attachments,
            subject: 'Devdactic Images',
            body: bodyText,
            isHtml: true
          };

        $cordovaEmailComposer.open(email).then(null, function() {
          for (var i = 0; i < attachments.length; i++) {
            var name = attachments[i].substr(attachments[i].lastIndexOf('/') + 1);
            $cordovaFile.removeFile(cordova.file.externalRootDirectory, name);
          }
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



.controller('CamCtrl', ['$scope', '$location', 'GetUU',
	function($scope, $location, GetUU) {

	// init variables
	$scope.data = {};
	$scope.obj;
	var pictureSource;   // picture source
	var destinationType; // sets the format of returned value
	var url;
	
	// on DeviceReady check if already logged in (in our case CODE saved)
	ionic.Platform.ready(function() {
		console.log("ready get camera types");
		if (!navigator.camera)
			{
			// error handling
			return;
			}
		//pictureSource=navigator.camera.PictureSourceType.PHOTOLIBRARY;
		pictureSource=navigator.camera.PictureSourceType.CAMERA;
		destinationType=navigator.camera.DestinationType.FILE_URI;
		});
	
	// get upload URL for FORM
	GetUU.query(function(response) {
		$scope.data = response;
		console.log("got upload url ", $scope.data.uploadurl);
		});
	
      
     
     
	// take picture
	$scope.takePicture = function() {
		//console.log("got camera button click");
		var options =   {
			quality: 50,
			destinationType: destinationType,
			sourceType: pictureSource,
			encodingType: 0
			};
		if (!navigator.camera)
			{
			// error handling
			return;
			}
		navigator.camera.getPicture(
			function (imageURI) {
				console.log("got camera success ", imageURI);
				$scope.mypicture = imageURI;
				},
			function (err) {
				console.log("got camera error ", err);
				// error handling camera plugin
				},
			options);
		};

	// do POST on upload url form by http / html form    
	$scope.update = function(obj) {
		if (!$scope.data.uploadurl)
			{
			// error handling no upload url
			return;
			}
		if (!$scope.mypicture)
			{
			// error handling no picture given
			return;
			}
		var options = new FileUploadOptions();
		options.fileKey="ffile";
		options.fileName=$scope.mypicture.substr($scope.mypicture.lastIndexOf('/')+1);
		options.mimeType="image/jpeg";
		var params = {};
		params.other = obj.text; // some other POST fields
		options.params = params;
		alert("test");
		//console.log("new imp: prepare upload now");
		var ft = new FileTransfer();
		ft.upload($scope.mypicture, encodeURI($scope.data.uploadurl), uploadSuccess, uploadError, options);
		function uploadSuccess(r) {
			// handle success like a message to the user
			}
		function uploadError(error) {
			//console.log("upload error source " + error.source);
			//console.log("upload error target " + error.target);
			}
		};
    $scope.takePic = function() {
        var options =   {
            quality: 50,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
            encodingType: 0     // 0=JPG 1=PNG
        }
        navigator.camera.getPicture(onSuccess,onFail,options);
    };
        var onSuccess = function(FILE_URI) {
        console.log(FILE_URI);
        $scope.picData = FILE_URI;
        $scope.$apply();
    };
    var onFail = function(e) {
        console.log("On fail " + e);
        console.log("upload error source " + e.source);
		console.log("upload error target " + e.target);
    };
    $scope.send = function() {   
        var myImg = $scope.picData;
        var options = new FileUploadOptions();
        options.fileKey="post";
        options.chunkedMode = false;
        var params = {};
        params.user_token = localStorage.getItem('auth_token');
        params.user_email = localStorage.getItem('email');
        //options.params = params;
        var ft = new FileTransfer();
        ft.upload(myImg, encodeURI("http://api.everlive.com/v1/JiHugAPcEgftCWfK/Files"), onSuccess, onFail, options);
    };
}])


.controller('newPostCtrl', function($scope, $cordovaFile, $cordovaCamera) {
    // 1
	$scope.images = [];
    var theImage;
    $scope.addImage = function() {
        // 2
        var options = {
            destinationType : Camera.DestinationType.FILE_URI,
            sourceType : Camera.PictureSourceType.CAMERA, // Camera.PictureSourceType.PHOTOLIBRARY
            allowEdit : false,
            encodingType: Camera.EncodingType.JPEG,
            popoverOptions: CameraPopoverOptions,
        };

        // 3
        $cordovaCamera.getPicture(options).then(function(imageData) {
			
            console.log(imageData);
            
            // 4
            onImageSuccess(imageData);

            function onImageSuccess(fileURI) {
                createFileEntry(fileURI);
            }

            function createFileEntry(fileURI) {
                 console.log("entered - createFileEntry :"+fileURI);
                //window.resolveLocalFileSystemURL(fileURI, copyFile, fail);
                
                
                // resolve filename and set global filename variable
			window.resolveLocalFileSystemURL(fileURI, function(fileEntry) {
				fileName = fileEntry.name;
				
				var options = new FileUploadOptions();
				options.fileKey = "file";
				options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
			
				/*if (cordova.platformId == "android") {
				options.fileName += ".jpg" 
				}*/
			
				options.params = {text : "text"}; // if we need to send parameters to the server request 
				options.headers = {
					'Authorization': "token"
				};
            
				//set up the Backend for the file upload 
				var el = new Everlive('JiHugAPcEgftCWfK');
				var uploadUrl = el.Files.getUploadUrl();
				console.log("uploadUrl:"+uploadUrl);
				var ft = new FileTransfer();
				ft.upload(
					fileURI,
					uploadUrl,
					onFileUploadSuccess,
					onFileTransferFail,
					options);
			}, function(error) {
				console.log('about to resolve this files errors');
				console.log(error.code);
			});
            
                
            }
			function onFileUploadSuccess (result) {
				console.log("FileTransfer.upload");
				console.log("Code = " + result.responseCode);
				console.log("Response = " + result.response);
				console.log("Sent = " + result.bytesSent);
				var res = JSON.parse(result.response);
				var uploadedFileUri = res.Result[0].Uri;
				console.log("Link to uploaded file:" + uploadedFileUri);
				
			}
            function onFileTransferFail (error) {
				console.log("FileTransfer Error:");
				console.log("Code: " + error.code);
				console.log("Source: " + error.source);
				console.log("Target: " + error.target);
			}
            // 5
            function copyFile(fileEntry) {
               
                var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
                var newName = makeid() + name;
				console.log("newName="+newName);
                window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
                    fileEntry.copyTo(
                        fileSystem2,
                        newName,
                        onCopySuccess,
                        fail
                    );
                },
                fail);
            }

            // 6
            function onCopySuccess(entry) {
                $scope.$apply(function () {
                    $scope.images.push(entry.nativeURL);
                });
            }

            function fail(error) {
                console.log("fail: " + error.code);
            }

            function makeid() {
                var text = "";
                var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

                for (var i=0; i < 5; i++) {
                    text += possible.charAt(Math.floor(Math.random() * possible.length));
                }
                return text;
            }

        }, function(err) {
            console.log(err);
        });
    }
	
    $scope.urlForImage = function(imageName) {
        var name = imageName.substr(imageName.lastIndexOf('/') + 1);
        var trueOrigin = cordova.file.dataDirectory + name;
        return trueOrigin;
    }
    
    $scope.sendEmail = function() {
        // 1
        var bodyText = "<h2>Look at this images!</h2>";
        if (null != $scope.images) {
            var images = [];
            var savedImages = $scope.images;
            for (var i = 0; i < savedImages.length; i++) {
                // 2
                images.push("" + $scope.urlForImage(savedImages[i]));
                // 3
                images[i] = images[i].replace('file://', '');
            }

            // 4
            window.plugin.email.open({
                to:          ["siva@akikodesign.com"], // email addresses for TO field
                cc:          Array, // email addresses for CC field
                bcc:         Array, // email addresses for BCC field
                attachments: images, // file paths or base64 data streams
                subject:    "Just some images", // subject of the email
                body:       bodyText, // email body (for HTML, set isHtml to true)
                isHtml:    true, // indicats if the body is HTML or plain text
            }, function () {
                console.log('email view dismissed');
            },
            this);
        }
    }
})

.controller('FileUploadCtrl', function($scope, Upload){
 
	$scope.uploadFile = function() {
 		var el = new Everlive('JiHugAPcEgftCWfK');
				var uploadUrl = el.Files.getUploadUrl();
				console.log("uploadUrl:"+uploadUrl);
		Upload.fileTo(uploadUrl).then(
			function(res) {
				console.log('success');
			}, function(err) {
				// Error
                console.log('error');
			});
 
	};
 
});


