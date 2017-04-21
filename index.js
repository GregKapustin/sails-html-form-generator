var _ = require('lodash');
var formG = require('html-form-generator');

module.exports = function(sails) {
    return {
        configure: function () {
        },
        initialize: function(cb) {
            sails.on('hook:orm:loaded', function() {
                // Grab all models that want to use form generator
                var modelsWithWebforms = _.filter(sails.models, function(m) {
                    return m.hasOwnProperty("formGenerator") && m.formGenerator;
                });
                _.forEach(modelsWithWebforms, function(model) {
                    sails.log.info(model.identity);
                    sails.log.info(model.attributes);
                });
                return cb();
            });
        }
    };
};