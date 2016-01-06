
var util = require('util'),
    fs = require('fs'),
    ref = require('ref'), // required for reading 64 bit integers
    EventEmitter = require('events'),
    keys = require('./keys');

var EV_KEY = 1,
    EVENT_TYPES = ['keyup','keypress','keydown'];


function Keyboard(dev) {
  var self = this;

  EventEmitter.call(self);

  self.fd = null;
  self.dev = dev;
  self.bufferSize = 24;
  self.buf = new Buffer(self.bufferSize);
  self.fileName = '/dev/input/' + self.dev;

  fs.open(self.fileName, 'r', function(err, fd) {

    if (err) {
      self.emit('error', err);
      return;
    }

    self.fd = fd;

    self.emit('opened', {filename: self.fileName});

    self.read();
  });
};

util.inherits(Keyboard, EventEmitter);


Keyboard.prototype.read = function() {

  var self = this;

  fs.read(self.fd, self.buf, 0, self.bufferSize, null, function(err, bytesRead, buffer) {

    if (err) {
      self.emit('error', err);
      return;
    }

    var event = parse(buffer);

    if (event) {
      event.dev = self.dev;
      self.emit(event.type, event);
    }

    if (self.fd) {
      self.read();
    }

  });
};

Keyboard.prototype.close = function(callback) {
  fs.close(this.fd, callback);
  this.fd = null;
};


/**
 * Parse Input data
 */

function parse(buffer) {

  var event, value;

  if ( buffer.readUInt16LE(16) === EV_KEY ) {

    event = {
      timeS: buffer.readUInt64LE(0),
      timeMS: buffer.readUInt64LE(8),
      keyCode: buffer.readUInt16LE(18)
    };

    event.keyId = keys.findKeyID(event.keyCode);
    event.type = EVENT_TYPES[ buffer.readUInt32LE(20) ];

  }

  return event;
};


module.exports = Keyboard;
