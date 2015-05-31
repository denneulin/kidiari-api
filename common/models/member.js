module.exports = function(Member) {
  Member.validatesLengthOf('username', {min: 3, message: {min: 'username is too short (min 3 characters)'}});
  Member.validatesUniquenessOf('phoneNumber', {message: 'is already in use'});

  //TODO add remoteMethod confirmPhone
};
