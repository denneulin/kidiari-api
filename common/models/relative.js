module.exports = function(Relative) {
  //relationType : parent or relative

  var isStatic = true;
  Relative.disableRemoteMethod('create', isStatic);
  Relative.disableRemoteMethod('upsert', isStatic);
  Relative.disableRemoteMethod('exists', isStatic);
  Relative.disableRemoteMethod('findById', isStatic);

  isStatic = false;
  Relative.disableRemoteMethod('__get__kid', isStatic);
  Relative.disableRemoteMethod('__get__member', isStatic);
};
