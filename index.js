var _ = require('lodash');
var formG = require('html-form-generator');
var modelFormMaker = require(__dirname + '/lib/models');
var config = require(__dirname + '/config');
var Promise = require('bluebird');

module.exports = function(sails) {
    
    var all = {
        modelGetForm: modelFormMaker.modelForm,
        configure: function () {
        },
        initialize: function(cb) {
            return cb();
        },
        routes: {
            after: {
            }
        }
    };
    
    if(config.ajax && config.ajaxURL) {
        all.routes.after['GET ' + config.ajaxURL] = function(req, res, next) {
            return modelFormMaker.ajaxGetForm(req, res, next);
        };
    }
    // Grab all models that want to use form generator
    /*var modelsWithWebforms = _.filter(sails.models, function(m) {
        return typeof m.formGenerator != 'undefined' && m.formGenerator;
    });
    var modelsFormsPromises = [];
    _.forEach(modelsWithWebforms, function(model) {
        var modelCreatePromise = new Promise(function(resolve, reject) {
            modelFormMaker.modelForm(model, null, config.separator).then(function(str) {
                resolve(res.view('../node_modules/yuflowbancaire/views/admin/adminBankConfig',
                    {
                        layout: config.layout,
                        form: str
                    }
                ));
            });
        });
        modelsFormsPromises.push()
    });*/
    
    return all;
};