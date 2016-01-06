var Keyboard = require('./lib/keyboard');

var k = new Keyboard('event4'); // 'event4' is the file corresponding to my keyboard in /dev/input/

// k.on('keyup', console.log);
// k.on('keydown', console.log);

k.on('keypress', console.log);

k.on('error', console.error); // Something wrent wrong, keyboard disconnected or something

console.log('ok');
