var _ = require('lodash');
var moment = require('moment');
var formG = require('html-form-generator');
var config = require(__dirname + '/../config');

module.exports = {
    modelForm: function(modelIdentity, entity, separator) {
        return new Promise(function(resolve, reject) {
            var fields = modelGetFormEmpty(modelIdentity);
            var getEntityPromise = entity && parseInt(entity) == entity ?
                sails.models[modelIdentity.toLowerCase()].findOne(entity) : new Promise(function(a) {return a(entity);});
            getEntityPromise.then(function(entity) {
                if(entity && (parseInt(entity) == entity || entity.id)) {
                    _.forEach(sails.models[modelIdentity.toLowerCase()].attributes, function(attribute, name) {
                        var fieldPosition = _.findIndex(fields, {'name': name});
                        if(fieldPosition >= 0) {
                            if(attribute.autoIncrement) {
                                fields[fieldPosition].disabled = true;
                            }
                            var value = entity[name];
                            if(typeof value == 'object' || typeof value == 'array') {
                                if(attribute.type == 'model' && value.id) {
                                    value = value.id;
                                } else if(attribute.type == 'array') {
                                    value = _.map(value).join(', ');
                                } else {
                                    value = JSON.stringify(value);
                                }
                            }
                            if(value && value != 'null')
                                fields[fieldPosition].defaultValue = "" + value;
                        }
                    });
                    if(config.ajax) {
                        fields.push({
                            type: 'submit',
                            name: 'Destroy',
                            attributes: {
                                onclick: 'event.preventDefault();'
                                    + 'io.socket.get("/' + modelIdentity.toLowerCase() + '/destroy/' + entity.id + '",'
                                    + ' function(destroyed) {if(destroyed && destroyed.id) {$("#sailsForm' + modelIdentity.toLowerCase() + '_' + entity.id + '").remove();} else {alert("An error occurred");}}'
                                    + ');'
                            },
                            suffix: '<br/>'
                        });
                        fields.push({
                            type: 'button',
                            name: 'Update',
                            attributes: {
                                onclick: 'event.preventDefault();'
                                    + 'io.socket.get("/' + modelIdentity.toLowerCase() + '/update/' + entity.id + '?" + $("#sailsForm' + modelIdentity.toLowerCase() + '_' + entity.id + '").serialize(),'
                                    + ' function(updated) {if(updated && updated.id) {} else {alert("An error occurred");}}'
                                    + ');'
                            }
                        });
                    } else {
                        fields.push({
                            type: 'submit',
                            name: 'Destroy',
                            attributes: {
                                formaction: "/" + modelIdentity.toLowerCase() + "/destroy/" + entity.id
                            },
                            suffix: '<br/>'
                        });
                        fields.push({
                            type: 'submit',
                            name: 'Update'
                        });
                    }
                } else { // Creation
                    _.forEach(sails.models[modelIdentity.toLowerCase()].attributes, function(attribute, name) {
                        if(name == 'id' && attribute.autoIncrement) {
                            var fieldPosition = _.findIndex(fields, {'name': name});
                            fields.splice(fieldPosition, 1);
                        }
                    });
                    if(config.ajax) {
                        var appendString = config.appendNew ?
                            '    io.socket.get("' + config.ajaxURL + '?modelIdentity=' + modelIdentity + '&separator=' + separator + '", function(str) {'
                            + '      $("#sailsForm' + modelIdentity.toLowerCase() + '_" + created.id).after("<br/>" + str);'
                            + '    });'
                            : '';
                        fields.push({
                            type: 'button',
                            name: 'Create',
                            attributes: {
                                onclick: 'event.preventDefault();'
                                    + 'io.socket.get("/' + modelIdentity.toLowerCase() + '/create?" + $("#sailsForm' + modelIdentity.toLowerCase() + '_new").serialize(),'
                                    + '  function(created) {if(created && created.id) {'
                                    + '    io.socket.get("' + config.ajaxURL + '?modelIdentity=' + modelIdentity + '&entity=" + created.id + "&separator=' + separator + '", function(str) {'
                                    + '      $("#sailsForm' + modelIdentity.toLowerCase() + '_new").replaceWith(str);'
                                    + appendString
                                    + '    });'
                                    + '  } else {alert("An error occurred");}}'
                                    + ');'
                            }
                        });
                    } else {
                        fields.push({
                            type: 'submit',
                            name: 'Create'
                        });
                    }
                }
                formG.generate(
                    fields,
                    separator,
                    'GET',
                    entity && entity.id ? "/" + modelIdentity.toLowerCase() + "/update/" + entity.id : "/" + modelIdentity.toLowerCase() + "/create",
                    entity && entity.id ? "sailsForm" + modelIdentity.toLowerCase() + "_" + entity.id : "sailsForm" + modelIdentity.toLowerCase() + "_new"
                ).then(function(str) {
                    resolve(str);
                }).catch(function(err) {
                    reject(err);
                });
            });
        });
    },
    ajaxGetForm: function(req, res, next) {
        return this.modelForm(req.query.modelIdentity, req.query.entity, req.query.separator).then(function(str) {
            return res.send(str);
        }).catch(function(err) {
            return res.serverError(err);
        });
    }
};

var modelGetFormEmpty = function(modelIdentity) {
    var attributes = sails.models[modelIdentity.toLowerCase()].attributes;
    var fields = [];
    _.forEach(attributes, function(attribute, name) {
        if(name !== 'createdAt' && name !== 'updatedAt') {
            var field = {
                name: name,
                label: name,
                type: typesConvertor[attribute.type]
            };
            if(attribute.hasOwnProperty("enum") && attribute.enum.length) {
                field.type = 'radios';
                field.options = {};
                _.forEach(attribute.enum, function(option) {
                    field.options[option] = "&nbsp;" + option;
                });
                field.defaultValue = attribute.enum[0];
            }
            if(attribute.type == 'boolean') {
                field.options = {"true": '', "false": ''};
            }
            if(attribute.hasOwnProperty("defaultsTo")) {
                field.defaultValue = attribute.defaultsTo;
            }
            fields.push(field);
        }
    });
    return fields;
};

var typesConvertor = {
    boolean: 'radios',
    integer: 'number',
    float: 'number',
    string: 'text',
    text: 'textarea',
    mediumtext: 'textarea',
    longtext: 'textarea',
    objectid: 'number',
    array: 'textarea',
    json: 'textarea',
    date: 'date',
    datetime: 'datetime',
    model: 'number',
    collection: 'number'
};