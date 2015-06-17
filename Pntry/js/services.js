angular.module('pntry.services', [])


.factory('GetUU', function() {
	var uploadurl = "http://api.everlive.com/v1/JiHugAPcEgftCWfK/Files";
	return  {
    	query: function() {
		return uploadurl;
		}
	}
})
.factory('API', function() {

  var api_key = 'JiHugAPcEgftCWfK';

    return api_key;

})

.factory('User', function (API) {

var el = new Everlive({
        apiKey: API,
        scheme: 'http',
        token: localStorage.getItem('token')
    });
  return {
    register: function(registerData){          
        return el.Users.register(
            registerData.username, 
            registerData.password, 
              { 
                Email: registerData.email, 
                DisplayName: registerData.displayname,
                OrganizationName: registerData.organizationname
               })
            .then(function (data) {
                return data;
            },
            function(error) {
                return error;
            });               
    },
    login: function(loginData) {                
        return el.Users.login(
            loginData.username,
            loginData.password)
            .then(function (data) {
                return data;
            },
            function(error) {
                return error;
            });
    },
    me: function() {
        return el.Users.currentUser()
            .then(function (data) {
                return data;
            },
            function(error) {
                return error;
            });
    }
  }
})

.factory('Food', function(API) {
	var el = new Everlive({
        apiKey: API,
        scheme: 'http',
        token: localStorage.getItem('token')
    });
	var data = el.data('Food');
    var query = new Everlive.Query();

    return {
        getAllFood: function(){        
            return data.get()
                .then(function (data) {
                    return data;
                },
                function(error) {
                    return error;
                });               
        },
        //retrieve added item
        getOneFood: function(id){
            return data.getById(id)
                .then(function (data) {
                    return data;
                },
                function(error) {
                    return error;
                });     
        },
		//add item, setting requested date to null 
        addFood: function(foodData){
            return data.create({Name:foodData.Name,NumberInStock:parseInt(foodData.NumberInStock),RequestDate:null})
              .then(function (data) {
                    return data;
                },
                function(error) {
                    return error;
                });

          },
		  //remove an item
         removeFood: function(id){
             return data.destroySingle({Id:id})
              .then(function (data) {
                    return data;
                },
                function(error) {
                    return error;
                });

          },
          //update an item
          updateFood: function(foodData){
              return data.updateSingle({Id:foodData.Id,'NumberInStock':parseInt(foodData.NumberInStock)})
              .then(function (data) {
                    return data;
                },
                function(error) {
                    return error;
                });

          },
		   //get needed food
		  getNeededFoods: function(){
			query.where().lte('NumberInStock', 2);
			return data.get(query)
				.then(function (data) {
					return data;
				},
				function(error) {
				   return error;
			});               
		  },
        //get Sorted Foods
        getSortedFoods: function(){
            query.order('NumberInStock');
            return data.get(query)
                .then(function (data) {
                    return data;
                },
                function(error) {
                    return error;
                });               
        },
		
        requestDonation: function(foodData){
        	var now = new Date();       
			var model = {'RequestDate': now};
            query.where().isin("Id", foodData).done();
            return data.update(model, query)   
                 .then(function (data) {
                    return data;                      
                },
                function(error) {
                   return error;
                 });         
        },
        
        getAllRequests: function(){
          query.where().ne('RequestDate', null);
            return data.get(query)
                .then(function (data) {
                    return data;
                },
                function(error) {
                    return error;
                });               
        },
        
        getRequestByDate: function(key){
            
            var newkey = moment().format('MMMM Do YYYY, h:mm:ss');
            query.where().gte("RequestDate", newkey).lte("RequestDate", newkey).done();
            return data.get(query)
                .then(function (data) {
                    return data;                
                },
                function(error) {
                    return error;                
                });               
        },
        
    }
})


.factory('Upload', function($q, $cordovaCamera, $cordovaFile,$cordovaFileTransfer, API) {
 	
    
     /*var el = new Everlive({
        apiKey: API,
        scheme: 'http',
        token: localStorage.getItem('token')
    });
    */
 	//var serverURL = el.Files.getUploadUrl();
   // console.log(serverURL);
    return {
 
        fileTo: function(serverURL) {
 
        	var deferred = $q.defer();
 
			if (ionic.Platform.isWebView()) {
 
				var options =   {
				    quality: 100
				    , destinationType : Camera.DestinationType.DATA_URL //destinationType: Camera.DestinationType.FILE_URI
				    , sourceType: Camera.PictureSourceType.PHOTOLIBRARY
				    , encodingType: Camera.EncodingType.JPEG
				}
 
				$cordovaCamera.getPicture(options).then(
 
					function(fileURL) {
                        var uploadOptions = new FileUploadOptions();
						uploadOptions.fileKey = "photoPath";
						uploadOptions.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
						uploadOptions.mimeType = "image/jpeg";
						uploadOptions.chunkedMode = false;
                        uploadOptions.headers = {Connection: "close"};
 						$cordovaFileTransfer.upload(serverURL, fileURL, uploadOptions).then( 
							function(result) {
                                console.log('lucky');
								deferred.resolve(result);
							}, function(err) {
                                console.log('failed');
                                console.log(err);
								deferred.reject(err);
						});
						/*$cordovaFile.uploadFile(serverURL, fileURL, uploadOptions).then(
 							function(result) {
								deferred.resolve(result);
							}, function(err) {
								deferred.reject(err);
							})
                            */
                        
 						/*alert(fileURL);
						var uploadOptions = new FileUploadOptions();
						uploadOptions.fileKey = "post";
						uploadOptions.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
						uploadOptions.mimeType = "image/jpeg";
						uploadOptions.chunkedMode = false;
 						$cordovaFileTransfer.upload(serverURL, fileURL, uploadOptions).then( 
							function(result) {
								deferred.resolve(result);
							}, function(err) {
								deferred.reject(err);
						});
                        */
                        
						/*
                        $cordovaFileTransfer.upload(serverURL, fileURL, uploadOptions).then(
 						function(result) {
								deferred.resolve(result);
							}, function(err) {
								deferred.reject(err);
						});
                        
                        */
 
					}, function(err){
                        console.log('failed root');
						deferred.reject(err);
					})
 
				;
 
			}
			else {
				deferred.reject('Uploading not supported in browser');
			}
 
			return deferred.promise;
 
        }
 
    }
 
})



.factory('FileService', function() {
  var images;
  var IMAGE_STORAGE_KEY = 'images';
 
  function getImages() {
    var img = window.localStorage.getItem(IMAGE_STORAGE_KEY);
    if (img) {
      images = JSON.parse(img);
    } else {
      images = [];
    }
    return images;
  };
 
  function addImage(img) {
    images.push(img);
    window.localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
  };
 
  return {
    storeImage: addImage,
    images: getImages
  }
})

.factory('ImageService', function($cordovaCamera, FileService, $q, $cordovaFile) {
 	
  function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 
    for (var i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
 
  function optionsForType(type) {
    var source;
    switch (type) {
      case 0:
        source = Camera.PictureSourceType.CAMERA;
        break;
      case 1:
        source = Camera.PictureSourceType.PHOTOLIBRARY;
        break;
    }
    return {
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: source,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };
  }
 
  function saveMedia(type) {
     var deferred = $q.defer();
    return $q(function(resolve, reject) {
        var deferred = $q.defer();
      var options = optionsForType(type);
 	
      $cordovaCamera.getPicture(options).then(function(imageUrl) {
        var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
        var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
        var newName = makeid() + name;
        $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, newName)
          .then(function(info) {
            //FileService.storeImage(newName);
            alert("FileService Called");
            deferred.resolve(info);
          }, function(e) {
            //reject();
            deferred.reject(e);
          });
      });
        //return deferred.promise;
    })
  }
  return {
      //var deferred = $q.defer();
    handleMediaDialog: saveMedia
  }
});