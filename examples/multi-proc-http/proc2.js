// The Setup
var fed   = require('../../index');

fed.defaults.table_file = __dirname + '/routes.json';
fed.defaults.transports.http = {PORT_BIND: 5011};
delete fed.defaults.transports['axon'];

var dir = fed.init().director;

// The Actor Magic
var bob = dir.createActor('bob');

function send(){
  setTimeout(function(){
    bob.tell('tom','PING: Hello From Bob');
  },1000)
}

bob.onMessage = function(message){
  console.log('Bob Received Message: %s',message);
  send();
}

send();
