# node-milter

## Example

```javascript
var nodemilter = require('node-milter');

var milter = nodemilter.createMilter({
  name: 'test',
  flags: 0
});

milter.setCallback('negotiate', function(ctx, f1, f2, f3, f4, callback) {
  callback(nodemilter.SMFIS_ALL_OPTS);
});

milter.setCallback('envfrom', function(ctx, argv, callback) {
  callback(nodemilter.SMFIS_CONTINUE);
});

milter.listen(10025, function() {
  console.log('milter started on port 10025');
});

```

## Usage
### Constants
version
* __SMFI_VERSION__

return codes
* __MI_SUCCESS__
* __MI_FAILURE__
 
callbacks return codes
* __SMFIS_CONTINUE__
* __SMFIS_REJECT__
* __SMFIS_DISCARD__
* __SMFIS_ACCEPT__
* __SMFIS_TEMPFAIL__
* __SMFIS_ALL_OPTS__

options flag
* __SMFIF_ADDHDRS__
* __SMFIF_CHGHDRS__
* __SMFIF_CHGBODY__
* __SMFIF_ADDPRCT__
* __SMFIF_ADDRCPT_PAR__
* __SMFIF_DELRCPT__
* __SMFIF_QUARANTINE__
* __SMFIF_CHGFROM__
* __SMFIF_SETSYMLIST__

protocol stage
* __SMFIM_CONNECT__
* __SMFIM_HELO__
* __SMFIM_ENVFROM__
* __SMFIM_ENVRCPT__
* __SMFIM_DATA__
* __SMFIM_EOM__
* __SMFIM_EOH__

### new nodemilter.createMilter([options])
* __options__ Object
  * __name__ String Default='Unknown'
  * __version__ Number Default=SMFI_VERSION
  * __flag__ Number Default=0

### milter.listen(arguments)
arguments passthrough net.Server.listen

### Callbacks
#### milter.setCallback(name, callback)
* __name__ String
* __callback__ Function

|name|callback|
|----|--------|
|negotiate|function(ctx, f1, f2, f3, f4, callback)
|connect|function(ctx, hostname, address, port, callback)|
|helo|function(ctx, helohost, callback)|
|envfrom|function(ctx, argv, callback)|
|envrcpt|function(ctx, argv, callback)|
|data|function(ctx, callback)|
|header|function(ctx, field, value, callback)|
|eoh|function(ctx, callback)|
|body|function(ctx, data, callback)|
|eom|function(ctx, callback)|
|close|function(ctx, callback)|
|abort|function(ctx, callback)|
|unknown|function(ctx, data, callback)|

##### negoticate(ctx, f1, f2, f3, f4, callback)
* __ctx__ Object
* __f1__ Number
* __f2__ Number
* __f3__ Number
* __f4__ Number
* __callback__ Function

##### connect(ctx, hostname, address, port, callback)
* __ctx__ Object
* __hostname__ String
* __address__ String
* __port__ Number
* __callback__ Function

##### helo(ctx, helohost, callback)
* __ctx__ Object
* __helohost__ String
* __callback__ Function

##### envfrom(ctx, argv, callback)
* __ctx__ Object
* __argv__ Array(String)
* __callback__ Function

##### envrcpt(ctx, argv, callback)
* __ctx__ Object
* __argv__ Array(String)
* __callback__ Function

##### data(ctx, callback)
* __ctx__ Object
* __callback__ Function

##### header(ctx, field, value, callback)
* __ctx__ Object
* __field__ String
* __value__ String
* __callback__ Function
 
##### eoh(ctx, callback)
* __ctx__ Object
* __callback__ Function

##### body(ctx, data, callback)
* __ctx__ Object
* __data__ Buffer
* __callback__ Function

##### eom(ctx, callback)
* __ctx__ Object
* __callback__ Function

##### close(ctx, callback)
* __ctx__ Object
* __callback__ Function

##### abort(ctx, callback)
* __ctx__ Object
* __callback__ Function

##### unknown(ctx, data, callback)
* __ctx__ Object
* __data__ Buffer
* __callback__ Function

### Data Access Functions
#### milter.getpriv(ctx)
* __ctx__ Object
 
#### milter.setprive(ctx, data)
* __ctx__ Object
* __data__ 

#### milter.getsymval(ctx, symname)
* __ctx__ Object
* __symname__ String

#### milter.setreply(ctx, rcode, xcode)
#### milter.setmlreply(ctx, rcode, xcode...)
* __ctx__ Object
* __rcode__ String
* __xcode__ String

### Message Modification Functions
#### milter.addheader(ctx, field, value, callback)
* __ctx__ Object
* __field__ String
* __value__ String
* __callback__ Function

#### milter.chgheader(ctx, field, index, value, callback)
* __ctx__ Object
* __field__ String
* __index__ Number
* __value__ String
* __callback__ Function

#### milter.insheader(ctx, index, field, value, callback)
* __ctx__ Object
* __index__ Number
* __field__ String
* __value__ String
* __callback__ Function

#### milter.chgfrom(ctx, from[, args], callback)
* __ctx__ Object
* __from__ String
* __args__ String
* __callback__ Function

#### milter.addrcpt(ctx, rcpt, callback)
* __ctx__ Object
* __rcpt__ String
* __callback__ Function

#### milter.addrcpt_par(ctx, rcpt[, args], callback)
* __ctx__ Object
* __rcpt__ String
* __args__ String
* __callback__ Function

#### milter.delrcpt(ctx, rcpt, callback)
* __ctx__ Object
* __rcpt__ String
* __callback__ Function

#### milter.replacebody(ctx, body, callback)
* __ctx__ Object
* __body__ String | Buffer | Readable
* __callback__ Function

### Other Message Handling Functions
#### milter.progress(ctx, callback)
* __ctx__ Object
* __callback__ Function

#### milter.quarantine(ctx, reason, callback)
* __ctx__ Object
* __reason__ String
* __callback__ Function


### Miscellaneous
#### milter.setsymlist(ctx, where, macros)
* __ctx__ Object
* __where__ Number
* __macros__ Array(String)
