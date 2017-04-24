# sails-html-form-generator
**Generates HTML forms for models in SailsJS.**
Give it a model and (not necessarily) an entity, it gives you a form with all attributes of that model (model references and collections are for now handled as integer).

It is based on [Html form generator](https://www.npmjs.com/package/html-form-generator).

## Config
In **config.json**, you can manage a few options :
* **ajax** : wether you want the forms to be submitted via JS (_needs front-end jQuery_). If not, the form will be posted simply and the user will fall on the JSON output from Sails update / create / destroy operations.
  * default to _true_
* **ajaxURL** : when ajax is true and reloading a form on a page, JS needs to grab a brand-new form, so it needs an URL to generate and grab it.
  * default to _/sailshtmlformsubmit_
* **appendNew** : when ajax is true and a _create model_ form is submitted, and a new node created, tell the module to append a new empty _create model_ form or not.

## Main method : _modelGetForm_

### Arguments
* **modelIdentity** : a string indicating the model (required)
* **model** : an entity of this model to build this form for (_ID or loaded object_)
* **separator** : a string separating the form inputs

### Output
* The form as a string, with all attributes of the model 

## How-to

```javascript
var formGS = require('sails-html-form-generator')(sails);
formGS.modelGetForm("owner", owner, '<br/>').then(function(string) {
// Do what you want with the form
});
```

## Example

**Model**

```javascript
// Parrot.js
module.exports = {
  attributes: {
    // e.g., "Polly"
    name: {
      type: 'string'
    },

    // e.g., 3.26
    wingspan: {
      type: 'float',
      required: true
    },

    // e.g., "cm"
    wingspanUnits: {
      type: 'string',
      enum: ['cm', 'in', 'm', 'mm'],
      defaultsTo: 'cm'
    },
  }
};
```

If you use that module _modelGetForm_, presuming you have ajax set to TRUE
```javascript
var formGS = require('sails-html-form-generator')(sails);
formGS.modelGetForm("parrot", null, '<br/>').then(function(string) {
});
```

You will get HTML like this :
```html
<form method="GET" action="/parrot/create" id="sailsFormparrot_new">
<label>name
    <input class="" name="name" value="" type="text">
</label>
<br>
<label>wingspanUnits
        <input class="" name="wingspanUnits" value="cm" checked="checked" type="radio">&nbsp;cm
        <input class="" name="wingspanUnits" value="in" type="radio">&nbsp;in
        <input class="" name="wingspanUnits" value="m" type="radio">&nbsp;m
        <input class="" name="wingspanUnits" value="mm" type="radio">&nbsp;mm
</label>
<br>
    <button type="button" class="" value="" onclick="event.preventDefault();io.socket.get("/parrot/create?" + $("#sailsFormreduction_new").serialize(),  function(created) {if(created && created.id) {    io.socket.get("/sailshtmlformsubmit?modelIdentity=parrot&entity=" + created.id + "&separator=<br/>", function(str) {      $("#sailsFormreduction_new").replaceWith(str);    io.socket.get("/sailshtmlformsubmit?modelIdentity=parrot&separator=<br/>", function(str) {      $("#sailsFormparrot_" + created.id).after("<br/>" + str);    });    });  } else {alert("An error occurred");}});">
        Create
    </button>
</form>
```

Which is basically a form to create a new parrot. If you give an existing parrot (id or loaded object), the inputs will be filled with existing values and the _create_ button will be replaced by a _destroy_ button and a _update_ button.

## Notes on attributes

For now all attributes are handled, but the references models are used as integers, just specify the ID of the linked entity.
* All attributes with the **enum** property are managed with radio input
* The **boolean** attributes are managed with radio input (I didn't manage to make it work with a simple checkbox... help needed)
* The **array** and **json** attributes are for now managed with a _textarea_ input, I'll do better asap
* 

## TODO

* Make an interactive input for references attributes (_depends on [Html form generator](https://www.npmjs.com/package/html-form-generator) ongoing_)
* Make an interactive input for array and json attributes (_same problem_)
* Make a unique checkbox input for boolean attributes
* Add a criteria in Sails models to automatically build URLs with the form included
* Stop depending on JQuery