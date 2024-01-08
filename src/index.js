require("dotenv").config();
const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { performInspection } = require("../utils/api");

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.get("/api/inspection/:id", async (req, res) => {
  const params = req.params;
  const mission = await prisma.mission.findUnique({
    where: {
      id: params.id,
    },
  });

  if (!mission) {
    return res.json({ msg: "Mission Not Found" });
  }

  const checkInspectionLog = await prisma.inspectionLog.findFirst({
    where: {
      missionId: mission.id,
    },
  });

  if (checkInspectionLog) {
    return res.json({
      msg: `Inspection already perfomed for ${mission.name} `,
    });
  }

  const checkForInProgress = await prisma.mission.findFirst({
    where: {
      id: mission.id,
      status: "inprogress",
    },
  });

  if (checkForInProgress) {
    return res.json({
      msg: `Inspection already in progress for mission ${mission.id}`,
    });
  }

  await prisma.mission.update({
    where: {
      id: mission.id,
    },
    data: {
      status: "inprogress",
    },
  });

  const resArray = [];
  const result = await performInspection(mission.waypoints, async (log) => {
    resArray.push(log);
  });

  // Create inspection log
  const newInspection = await prisma.inspectionLog.create({
    data: {
      missionId: mission.id,
      data: resArray,
    },
  });

  // Update mission status to "completed"
  await prisma.mission.update({
    data: {
      status: "completed",
    },
    where: {
      id: mission.id,
    },
  });

  return res.json({
    msg: `Inspection completed for ${mission.name}`,
  });
});

const server = app.listen(3000, () =>
  console.log(`
🚀 Server ready at: http://localhost:3000
⭐️ See sample requests: http://pris.ly/e/js/rest-express#3-using-the-rest-api`)
);
