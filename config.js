var config = {};

config.from = {};
config.to = {};

config.environment_url = "<Environment Url>"
config.from.tenant = "<Origin Tenant>";
config.from.api_token = "<Origin API Token (with read privileges)>";
config.to.tenant = "<Target Tenant>";
config.to.api_token = "<Target API Token (with write privileges)>";

module.exports = config;