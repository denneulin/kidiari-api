module.exports = function(Kid) {

  var isStatic = true;
  Kid.disableRemoteMethod('create', isStatic);
};
