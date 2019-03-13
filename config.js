var config = {};

config.from = {};
config.to = {};

config.from.environment_url = "<Origin Environment URL>";
config.from.tenant = "<Origin Tenant>";
config.from.api_token = "<Origin API Token (with read privileges)>";
config.to.environment_url = "<Target Environment URL>";
config.to.tenant = "<Target Tenant>";
config.to.api_token = "<Target API Token (with write privileges)>";

module.exports = config;
