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

const performInspection = async (mission, logCallback) => {
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
    const takeOffRes = await takeOff(mission.altitude);
    logCallback(takeOffRes);

    resArray.push("Setting Waypoint...");
    logCallback("Setting Waypoint...");
    const setWayPointRes = await setWayPoint(mission.waypoints);
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

const deleteCronJob = async (cronJobId) => {
  try {
    const res = await fetch(`https://api.cron-job.org/jobs/${cronJobId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${process.env.CRON_JOB_API_KEY}`,
      },
    });

    if (res.ok) {
      const responseData = await res.json();
      return responseData;
    } else {
      console.error("Failed to delete cron job:", res.status, res.statusText);
    }
  } catch (error) {
    console.error("Error deleting cron job:", error);
  }
};

module.exports = {
  performInspection,
  deleteCronJob,
};
