const https = require("https");
var config = require("./config");

// Dynatrace ENV Variables
var FROM_ENVIRONMENT_URL = config.from.environment_url;
var TO_ENVIRONMENT_URL = config.to.environment_url;
var FROM_TENANT = config.from.tenant;
var FROM_API_TOKEN = config.from.api_token; 
var TO_TENANT = config.to.tenant;
var TO_API_TOKEN = config.to.api_token;

async function CopyAllDashboards () {
    console.log("====== starting get request =======");
    return await https.get('https://' + FROM_ENVIRONMENT_URL +'/e/' + FROM_TENANT +'/api/config/v1/dashboards?Content-Type=application/json&api-token=' + FROM_API_TOKEN, (resp) => {
      var response = '';
      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        response += chunk;
      });    
      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        var allDashboards = JSON.parse(response).dashboards;
        if(allDashboards == undefined){
          return console.log("ERROR: Dashboards not found");
        }        
        allDashboards.forEach(async function(attribute){
          console.log(getSpecificTag(attribute['id']));
        });
        console.log("========= End of request ==========");
      });    
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
}
async function getSpecificTag (id) {
  return await https.get('https://' + FROM_ENVIRONMENT_URL + '/e/' + FROM_TENANT + '/api/config/v1/dashboards/' + id + '?api-token=' + FROM_API_TOKEN, (resp) => {
      console.log(" Starting to get Dashboard details");
      var response = '';
      // A chunk of data has been recieved.
      resp.on('data', (chunk) => {
        response += chunk;
      });    
      // The whole response has been received. Print out the result.
      resp.on('end', () => {
        var dashboard = JSON.parse(response);
        delete dashboard.dashboardMetadata.owner;
        delete dashboard.id;
        console.log("DASHBOARD AVAILABLE: " + dashboard.name);
        console.log(postTagToNewEnv(dashboard));
        console.log("========= End of Dashboard details ==========");
      });
  });
} 

function postTagToNewEnv(attribute){
    // Print event data
    console.log("SENDING POST: " + attribute.name);
    const data = JSON.stringify(attribute);

    return new Promise((resolve, reject) => {
      const options = {
          host: TO_ENVIRONMENT_URL,
          path: "/e/" + TO_TENANT + "/api/config/v1/dashboards",
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
CopyAllDashboards();
