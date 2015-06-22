angular.module('pntry.services', [])


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
                //console.log(data);
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

.factory('FileAPI', function(API) {
	var el = new Everlive({
        apiKey: API,
        scheme: 'http',
        token: localStorage.getItem('token')
    });
	//var data = el.Files().get();
    var data = new Everlive(API);
    var query = new Everlive.Query();

    return {
        getAllFiles: function(){        
            return data.Files.get(query) 
                .then(function (data) {
                //console.log(data);
                    return data;
                },
                function(error) {
                    return error;
                });               
        },
        
    }
})

.factory('AppFileService', function(API) {
    
	var el = new Everlive({
        apiKey: API,
        scheme: 'http',
        token: localStorage.getItem('token')
    });
	var data = el.data('Food');
    var query = new Everlive.Query();
	query.where().gt('Length', 50000);
    return {
        getImagegallery: function(){
            alert("test123");
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

.factory('FileService', function(API,AppFileService,$q) {
 var images;
  var IMAGE_STORAGE_KEY = 'images';
  var imageresults;
  var sliderimages = [];

  
  function getImages() {
         
	var el = new Everlive(API);
	var query = new Everlive.Query();
	//query.where().eq('ContentType','image/jpg').done();
	el.Files.get(query) // filter
        .then(function(data){
        //console.log(data);
        /*var itemcount=data.result.length;
        	 for (var i = itemcount - 1; i >= 0; i--) {
                 sliderimages.push({Filename : data.result[i].Filename , Uri : data.result[i].Uri})
            }
        	
          //imageresults =  JSON.stringify(data.result);
          */
        images= data;
          console.log(data); 
        },
    function(error){
        alert(JSON.stringify(error));
    });
    
    //images =imageresults;//JSON.stringify(images);// [{"Filename":"cdv_photo_002.jpg","Uri":"http://bs1.cdn.telerik.com/v1/JiHugAPcEgftCWfK/97c20e20-1512-11e5-8cfb-75aec785d73a"},{"Filename":"cdv_photo_003.jpg","Uri":"http://bs1.cdn.telerik.com/v1/JiHugAPcEgftCWfK/bef9ba60-1512-11e5-8cfb-75aec785d73a"}];
    //alert(images)  
    //return images;
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



.factory('ImageService', function($q, $timeout,$cordovaCamera, $cordovaFile,$cordovaFileTransfer,FileService,API) {

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
 
  var saveimageonapi = function(type) {
    var deferred = $q.defer();
	
    $timeout(function() {
        var options = optionsForType(type);
        $cordovaCamera.getPicture(options).then(function(imageUrl) {
            var el = new Everlive({
            apiKey: API,
            scheme: 'http',
            token: localStorage.getItem('token')
            });
            var apiRemoteUrl = el.Files.getUploadUrl(), filePath = imageUrl;
            var options = {
                fileKey: "file",
                fileName: imageUrl.substr(imageUrl.lastIndexOf('/') + 1),
                chunkedMode: false,
                mimeType: "image/jpg"
            };
			//alert(apiRemoteUrl);
            $cordovaFileTransfer.upload(apiRemoteUrl, filePath, options).then(function(result) {
                //console.log("SUCCESS: " + JSON.stringify(result.response));
                //console.log('Result_' + result.response[0] + '_ending');
                alert("success");
                //alert(JSON.stringify(result.response));
                deferred.resolve(result);

            }, function(err) {
                console.log("ERROR: " + JSON.stringify(err));
                alert(JSON.stringify(err));
                deferred.reject(err);
            }, function (progress) {
                // constant progress updates
            });
            
        });
    }, 1000);

    return deferred.promise;
  };

  return {
    handleMediaDialog: saveimageonapi
  };

});