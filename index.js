var url       = require('url');
var events    = require('events');

// Import Default Transport Modules
var axon      = require('./transports/axon');

// Configure Application Dependencies
var lib       = require('./lib');
var app = {}

app.Node      = lib.node      .forge(app);
app.Transport = lib.transport .forge(app);
app.Vertex    = lib.vertex    .forge(app);
app.Gateway   = lib.gateway   .forge(app);
app.Hub       = lib.hub       .forge(app);
app.Actor     = lib.actor     .forge(app);
app.Director  = lib.director  .forge(app);
app.Router    = lib.router    .forge(app);
app.Producer  = lib.producer  .forge(app);
app.Routes    = lib.routes    .forge(app);

function init(options){
  
  var outbox  = new events.EventEmitter();
  var inbox   = new events.EventEmitter();
  
  var hub     = app.Hub.NewWithEmitters(inbox,outbox);
  
  var gateway = hub.createGateway();
  var vertex  = hub.createVertex();
  
  // Create a Loopback Interface for Protocol-less Addresses
  var loopback = gateway.createTransport();
  loopback.enqueue = loopback.receive;
  
  // Configure Axon push/pull Transport
  var net_axon = gateway.createTransport('axon:');
  axon.setupAxonTransport(net_axon,options['axon']);
  
  // Configure Router
  var router   = app.Router.NewWithTable(options['table']);
  var local    = vertex.createNode('local');
  var producer = app.Producer.NewWithRouterAndNode(router,local);
  
  // Producer Contains all Relevant Sub-Systems
  return producer;

}

// Load Routing Table from Package `routes.json` File
var routes_file  = process.env.FED_ROUTES_FILE || __dirname + '/routes.json';
var routes_table = app.Routes.Load( routes_file );
var defaults = {
  axon      : {
    PORT: 8973
  },
  table     : routes_table
}

module.exports.defaults = defaults;
module.exports.init     = function(options){
  var opts = options || defaults;
  return init(opts);
}
