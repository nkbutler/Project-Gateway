"use strict";
(function(window, $) {
  if (!window || !$ || !window.forms) {
    if (!$) {
      console.log('ajaxform-bootstrap.js requires JQuery.');
    }
    if (!window.forms) {
      console.log('No ajaxform.js forms found.');
    }
    return;
  }

  var createAlert = function(msg, type) {
    if (typeof msg != 'string') { return ''; }
    if (!type) { type = 'alert-danger'; }
    var alertBox = $('<div class="alert ' + type + ' alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert"><span>&times;</span></button></div>');
    alertBox.append(msg);
    return alertBox
  }

  $('document').ready(function() {
    $.each(window.forms, function(formName, formObj) {
      $.each(formObj.fields, function(fieldName, fieldObj) {
        if (fieldName == '_csrf' || fieldObj.field.attr('type') == 'checkbox') {
          return;
        }
        fieldObj.onSuccess(function(){
          this.clear();
          this.parent.addClass('has-success has-feedback');
          if (this.field.prop('tagName') !== 'SELECT') {
            this.parent.append('<span class="glyphicon glyphicon-ok form-control-feedback"></span>');
          }
        });
        fieldObj.onError(function(err){
          this.clear();
          this.parent.addClass('has-error has-feedback');
          if (this.field.prop('tagName') !== 'SELECT') {
            this.parent.append('<span class="glyphicon glyphicon-remove form-control-feedback"></span>');
          }
          if (err) { this.parent.append(createAlert(err)); }
        });
        fieldObj.onClear(function(){
          this.parent.removeClass('has-success has-error has-feedback');
          if (this.field.prop('tagName') !== 'SELECT') {
            this.parent.find('>span').remove();
          }
          this.parent.find('div.alert').remove();
        });
      });
      formObj.onSuccess(function(res) {
        if (res.status == 1) {
          $.each(this.fields, function(name, fieldObj){
            if (res.errors[name]) {
              fieldObj.error(res.errors[name]);
              if (fieldObj.field.attr('type') == 'password') {
                fieldObj.field.val('');
              }
            } else {
              fieldObj.success();
            }
          });
        } else {
          $.each(this.fields, function(name, fieldObj){
            fieldObj.clear();
          });
        }
      });
      formObj.onError(function(err) {
        this.form.append(createAlert('There was an error processing your request. Please try again later.', 'alert-warning'));
      });
    });
  });
}(window, $));
