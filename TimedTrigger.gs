function createTimeDrivenTriggers(days) {
  deleteTriggers();
  if (days > 0){
    ScriptApp.newTrigger('runRefresh').timeBased().everyDays(days).create();
    setDayTriggerProperty(days);
  }
  return days;
}

function deleteTriggers() {
  var myTriggers = ScriptApp.getProjectTriggers();
  while ( myTriggers.length > 0) {
    ScriptApp.deleteTrigger(myTriggers[myTriggers.length-1]);
    myTriggers.pop();
  }
  setDayTriggerProperty(0);
}

function getTimeDrivenTriggersTime() {
  var myTriggers = ScriptApp.getProjectTriggers();
  var triggerPeriod = getDayTriggerProperty();
  if (myTriggers.length != 1 || myTriggers[0].getEventType() != ScriptApp.EventType.CLOCK){
    deleteTriggers();
    triggerPeriod = getDayTriggerProperty();
  }
  return triggerPeriod;
}

function setDayTriggerProperty(days){
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.setProperty("triggerPeriod", days+"");
}

function getDayTriggerProperty(){
  var documentProperties = PropertiesService.getDocumentProperties();
  var tps = documentProperties.getProperty("triggerPeriod");
  if (tps===null){
    documentProperties.setProperty("triggerPeriod", "0");
    tps="0";
  }
  var tp = parseInt(tps, 10);
  return tp;
}

function initTriggers(){
  var documentProperties = PropertiesService.getDocumentProperties();
  documentProperties.setProperty("triggerPeriod", "0");
}

function stopTimeTrigger() {
  deleteTriggers();
  return 0;
}

function kajeovo(){
  getDayTriggerProperty();
}