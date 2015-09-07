function arrayObjectIndexOf(myArray, searchTerm) {
  'use strict';
  var i = 0;
  for(i = 0; i < myArray.length; i++) {
        if (myArray[i] === searchTerm) return i;
    }
    return -1;
}

function kajeovovoaosjd(){
  SendDiff("wass is das");
}

function addRemoveEmail(email, adds) {
  var documentProperties = PropertiesService.getDocumentProperties();
  var emailList = documentProperties.getProperty('emailList');
  var emailArray;
  if (emailList == null){
    emailList="";
  }
  emailArray = emailList.split(';');
  if (adds) {
    if (arrayObjectIndexOf(emailArray, email) > -1){
      return false;
    }
    if (emailList.length > 0) {
      emailList = emailList + ';' + email;
    } else {
      emailList = email;
    }
  } else {
      var index = arrayObjectIndexOf(emailArray, email);
      if (index > -1) {
       emailArray.splice(index, 1);
      } else {
        return false;
      }
      emailList = emailArray.join(';');
    }
  documentProperties.setProperty('emailList', emailList);
  return true;
}

function getAllEmails(){
  var documentProperties = PropertiesService.getDocumentProperties();
  var emailList = documentProperties.getProperty('emailList');
  return emailList;
}

function SendDiff(diffMessage){
  var documentProperties = PropertiesService.getDocumentProperties();
  var emailList = documentProperties.getProperty('emailList');
  var emailArray = emailList.split(';');
  for (var i=0;i<emailArray.length;i++){
    if (ValidateEmail(emailArray[i])){
      MailApp.sendEmail(emailArray[i], "OSM Garden ("+DocumentApp.getActiveDocument().getName()+")", diffMessage);
    }
  }
}

function ValidateEmail(inputText)
{
  var mailformat = '/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/';
  if(inputText.match(mailformat))
  {
    return true;
  }
  else
  {
    return false;
  }
}