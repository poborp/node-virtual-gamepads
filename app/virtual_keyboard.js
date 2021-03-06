// Generated by CoffeeScript 1.10.0

/*
Created by roba91 on 15/08/2016
Virtual keyboard class
 */

(function() {
  var Struct, TimeStruct, config, fs, ioctl, uinput, virtual_keyboard;

  fs = require('fs');

  ioctl = require('ioctl');

  uinput = require('../lib/uinput');

  Struct = require('struct');

  config = require('../config.json');

  if (!config.x64) {
    TimeStruct = function() {
      return Struct().word32Sle('tv_sec').word32Sle('tv_usec');
    };
  } else {
    TimeStruct = function() {
      return Struct().word64Sle('tv_sec').word64Sle('tv_usec');
    };
  }

  virtual_keyboard = (function() {
    function virtual_keyboard() {}

    virtual_keyboard.prototype.connect = function(callback, error) {
      return fs.open('/dev/uinput', 'w+', (function(_this) {
        return function(err, fd) {
          var buffer, i, input_id, j, uidev, uinput_user_dev;
          if (err) {
            return error(err);
          } else {
            _this.fd = fd;
            ioctl(_this.fd, uinput.UI_SET_EVBIT, uinput.EV_KEY);
            for (i = j = 0; j <= 255; i = ++j) {
              ioctl(_this.fd, uinput.UI_SET_KEYBIT, i);
            }
            input_id = Struct().word16Sle('bustype').word16Sle('vendor').word16Sle('product').word16Sle('version');
            uinput_user_dev = Struct().chars('name', uinput.UINPUT_MAX_NAME_SIZE).struct('id', input_id).word32Sle('ff_effects_max').array('absmax', uinput.ABS_CNT, 'word32Sle').array('absmin', uinput.ABS_CNT, 'word32Sle').array('absfuzz', uinput.ABS_CNT, 'word32Sle').array('absflat', uinput.ABS_CNT, 'word32Sle');
            uinput_user_dev.allocate();
            buffer = uinput_user_dev.buffer();
            uidev = uinput_user_dev.fields;
            uidev.name = "Virtual keyboard";
            uidev.id.bustype = uinput.BUS_USB;
            uidev.id.vendor = 0x3;
            uidev.id.product = 0x4;
            uidev.id.version = 1;
            return fs.write(_this.fd, buffer, 0, buffer.length, null, function(err) {
              var error1;
              if (err) {
                console.error(err);
                return error(err);
              } else {
                try {
                  ioctl(_this.fd, uinput.UI_DEV_CREATE);
                  return callback();
                } catch (error1) {
                  error = error1;
                  console.error(error);
                  fs.close(_this.fd);
                  _this.fd = void 0;
                  return _this.connect(callback, error);
                }
              }
            });
          }
        };
      })(this));
    };

    virtual_keyboard.prototype.disconnect = function(callback) {
      if (this.fd) {
        ioctl(this.fd, uinput.UI_DEV_DESTROY);
        fs.close(this.fd);
        this.fd = void 0;
        return callback();
      }
    };

    virtual_keyboard.prototype.sendEvent = function(event) {
      var ev, ev_buffer, ev_end, ev_end_buffer, input_event, input_event_end;
      console.log(event);
      if (this.fd) {
        input_event = Struct().struct('time', TimeStruct()).word16Ule('type').word16Ule('code').word32Sle('value');
        input_event.allocate();
        ev_buffer = input_event.buffer();
        ev = input_event.fields;
        ev.type = event.type;
        ev.code = event.code;
        ev.value = event.value;
        ev.time.tv_sec = Math.round(Date.now() / 1000);
        ev.time.tv_usec = Math.round(Date.now() % 1000 * 1000);
        input_event_end = Struct().struct('time', TimeStruct()).word16Ule('type').word16Ule('code').word32Sle('value');
        input_event_end.allocate();
        ev_end_buffer = input_event_end.buffer();
        ev_end = input_event_end.fields;
        ev_end.type = 0;
        ev_end.code = 0;
        ev_end.value = 0;
        ev_end.time.tv_sec = Math.round(Date.now() / 1000);
        ev_end.time.tv_usec = Math.round(Date.now() % 1000 * 1000);
        fs.writeSync(this.fd, ev_buffer, 0, ev_buffer.length, null);
        return fs.writeSync(this.fd, ev_end_buffer, 0, ev_end_buffer.length, null);
      }
    };

    return virtual_keyboard;

  })();

  module.exports = virtual_keyboard;

}).call(this);
