const https = require("https");
var config = require("./config");

// Dynatrace ENV Variables
var ENVIRONMENT_URL = config.environment_url;
var FROM_TENANT = config.from.tenant;
var FROM_API_TOKEN = config.from.api_token; 
var TO_TENANT = config.to.tenant;
var TO_API_TOKEN = config.to.api_token;

async function CopyAllRequestAttributes () {
    console.log("====== starting get request =======");
    return await https.get('https://' + ENVIRONMENT_URL +'/e/' + FROM_TENANT +'/api/config/v1/requestAttributes?Api-Token=' + FROM_API_TOKEN, (resp) => {
      var response = '';
      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        response += chunk;
      });    
      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        var allRequestAttributes = JSON.parse(response).values;
        if(allRequestAttributes[0] == undefined){
          return console.log("ERROR: Request Attributes not Found");
        }
        allRequestAttributes.forEach(async function(attribute){
          console.log(getSpecificAttribute(attribute['id']));
        }); 
        console.log("========= End of request ==========");
      });    
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
}
async function getSpecificAttribute (id) {
  return await https.get('https://' + ENVIRONMENT_URL + '/e/' + FROM_TENANT + '/api/config/v1/requestAttributes/' + id + '?includeProcessGroupReferences=false&Api-Token=' + FROM_API_TOKEN, (resp) => {
      console.log(" Starting to get Request Attribute details");
      var response = '';
      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        response += chunk;
      });    
      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        var requestAttribute = JSON.parse(response);
        delete requestAttribute.metadata;
        delete requestAttribute.id;
        console.log("REQUEST ATTRIBUTE AVAILABLE: " + requestAttribute.name);
        console.log(postAttributeToNewEnv(requestAttribute));
        console.log("========= End of request attribute details ==========");
      });
  });
} 

function postAttributeToNewEnv(attribute){
    // Print event data
    console.log("SENDING POST: " + attribute.name);
    const data = JSON.stringify(attribute);

    return new Promise((resolve, reject) => {
      const options = {
          host: ENVIRONMENT_URL,
          path: "/e/" + TO_TENANT + "/api/config/v1/requestAttributes",
          method: 'POST',
          headers : {
              "Authorization" : "Api-Token " + TO_API_TOKEN,
              'Content-Type': 'application/json'
          }
      };
      var post_request = https.request(options, function(res) {
          var body = '';
          res.on('data', function(chunk)  {
              body += chunk;
          });
          res.on('end', function() {
              console.log(body);
          });
          res.on('error', function(e) {
              console.log('error:' + e.message);
          });
      });                
      // post the data
      post_request.write(data);
      post_request.end();
    });
 }
CopyAllRequestAttributes();
