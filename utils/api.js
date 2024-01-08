const {
  accessRequest,
  armDrone,
  takeOff,
  setWayPoint,
  executeWayPoints,
  setRTL,
  land,
  disarmDrone,
} = require("./FlytBaseAPIs/api");

const performInspection = async (position, logCallback) => {
  let resArray = [];
  try {
    resArray.push(" Access Request");
    logCallback(" Access Request...");
    const accessRequestRes = await accessRequest();
    logCallback(accessRequestRes);

    resArray.push("Starting Inspection...");
    logCallback("Starting Inspection...");
    const armDroneRes = await armDrone();
    logCallback(armDroneRes);

    resArray.push("Taking Off...");
    logCallback("Taking Off...");
    const takeOffRes = await takeOff();
    logCallback(takeOffRes);

    resArray.push("Setting Waypoint...");
    logCallback("Setting Waypoint...");
    const setWayPointRes = await setWayPoint(position);
    logCallback(setWayPointRes);

    resArray.push("Executing Waypoints...");
    logCallback("Executing Waypoints...");
    const executeWayPointsRes = await executeWayPoints();
    logCallback(executeWayPointsRes);

    resArray.push("Returning to Launch...");
    logCallback("Returning to Launch...");
    const setRTLRes = await setRTL();
    logCallback(setRTLRes);

    resArray.push("Landing...");
    logCallback("Landing...");
    const landRes = await land();
    logCallback(landRes);

    resArray.push("Disarming...");
    logCallback("Disarming...");
    const disarmDroneRes = await disarmDrone();
    logCallback(disarmDroneRes);

    return { result: "Inspection completed successfully", logs: resArray };
  } catch (error) {
    resArray.push(`Error: ${error}`);
    logCallback(`Error: ${error}`);
    throw error;
  }
};

module.exports = {
  performInspection,
};
