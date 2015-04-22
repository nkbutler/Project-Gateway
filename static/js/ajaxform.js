"use strict";
(function(window, $) {
  if (!window || !$) {
    if (!$) {
      console.log('ajaxform.js requires JQuery.');
    }
    return;
  }

  var createHandler = function(cls, handlerName) {
    var eventName = 'on' + handlerName.substring(0,1).toUpperCase() + handlerName.substring(1);
    // event()
    cls.prototype[handlerName] = function(err) {
      this.handlers[handlerName] = this.handlers[handlerName] || [];
      for (var i in this.handlers[handlerName]) {
        this.handlers[handlerName][i].call(this, err);
      }
    };
    // onEvent()
    cls.prototype[eventName] = function(func) {
      this.handlers[handlerName] = this.handlers[handlerName] || [];
      if (typeof func != 'function') { this.handlers[handlerName] = []; }
      this.handlers[handlerName].push(func);
    };
  }

  var DOMObj = function(obj) {
    this.obj = $(obj);
    this.name = this.obj.attr('name') || this.obj.attr('id') || '';
    this.parent = this.obj.parent();
    this.handlers = {};
  };

  createHandler(DOMObj, 'error');
  createHandler(DOMObj, 'success');
  createHandler(DOMObj, 'clear');

  var Field = function(field) {
    DOMObj.call(this, field);
    this.field = this.obj;
  };
  Field.prototype = Object.create(DOMObj.prototype);
  Field.prototype.constructor = Field;

  var AjaxField = function(field) {
    Field.call(this, field);
    this.src  = this.field.attr('src') || '';
    this.onGetSuccess(function(res) {
      // by default, populate options with the attribute of the result objects
      // matching this field's value name.
      this.reset();
      for (var i in res) {
        var row = res[i], option = $('<option></option>');
        option.append(row[this.name]);
        this.field.append(option);
      }
    });
    this.onGetError(function(res) {
      this.reset();
      this.error('Failed to load data.');
    });
    if (this.src) {
      this.load();
    }
  };
  AjaxField.prototype = Object.create(Field.prototype);
  AjaxField.prototype.constructor = AjaxField;

  createHandler(AjaxField, 'getSuccess');
  createHandler(AjaxField, 'getError');

  AjaxField.prototype.reset = function() {
    this.field.find('option').remove();
    this.field.append('<option>------</option>');
    this.field.val('');
  };

  AjaxField.prototype.load = function() {
    var params = {
      url : this.src,
      dataType : "json",
    };
    var fieldObj = this;
    params.success = function(res) { fieldObj.getSuccess(res) };
    params.error   = function(res) { fieldObj.getError(res) };
    $.ajax(params);
  };

  var Form = function(form) {
    DOMObj.call(this, form);
    this.form = this.obj;
    this.fields = {};
    this.addFields(this.obj);
    this.url = this.form.attr('action') || '';

    var formObj = this;
    this.form.submit(function(event) {
      event.preventDefault();
      if (formObj.submit(event) !== false) {
        formObj.POST();
      }
    });
  };
  Form.prototype = Object.create(DOMObj.prototype);
  Form.prototype.constructor = Form;

  createHandler(Form, 'submit');

  Form.prototype.package = function() {
    var obj = {}, formFields = {}
    obj[this.form.attr('id')] = formFields;
    $.each(this.fields, function(name, fieldObj) {
      var val;
      if (fieldObj.field.attr('type') == 'checkbox') {
        val = fieldObj.field.is(':checked') ? true : false;
      } else {
        val = fieldObj.field.val();
      }
      if (name == '_csrf') {
        obj[name] = val;
      } else {
        formFields[name] = val;
      }
    });
    return obj;
  };

  Form.prototype.POST = function(obj) {
    if (!obj) {
      obj = this.package();
    }
    var params = {
      url: this.url,
      type: 'POST',
      contentType: 'application/json',
      processData: false,
      data: JSON.stringify(obj)
    };
    var formObj = this;
    params.success = function(res) { formObj.success(res) };
    params.error   = function(res) { formObj.error(res) };
    $.ajax(params, 'json');
  };

  Form.prototype.addFields = function(html) {
    var jq = $(html);
    var formObj = this;
    jq.find('input, select').each(function(i, domobj) {
      var field;
      if (domobj.tagName === 'INPUT') {
        field = new Field(domobj);
      } else {
        field = new AjaxField(domobj);
      }
      field.name = field.name || 'field' + i;
      formObj.fields[field.name] = field;
    });
  }

  window.forms = {};
  $('document').ready(function() {
    $('form').each(function(i, form) {
      var formObj = new Form(form);
      var formName = formObj.name || 'form' + i;
      window.forms[formName] = formObj;
    });
  });
}(window, $));
