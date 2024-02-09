require("dotenv").config();

const express = require("express");
const { PrismaClient } = require("@prisma/client");
const { performInspection, deleteCronJob } = require("../utils/api");
const {
  saveVideoToStorage,
  analyzeVideo,
} = require("../utils/VideoIntelligenseAPIs/api");

const prisma = new PrismaClient();
const app = express();

const { sendEmail } = require("../utils/Resend/api");

app.use(express.json());

app.get("/", async (req, res) => {
  return res.json({ msg: "Welcome to Lukas Inspection Server API" });
});

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

  const token = req.headers.authorization;

  const checkToken = token === mission.cronJobToken;

  if (!checkToken) {
    return res.json({ msg: "Unauthorized" });
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
  const result = await performInspection(mission, async (log) => {
    resArray.push(log);
  });

  // temp data for the objectDetection, will be replaced with the actual data if someone wants to use it

  const videoURL = "https://www.youtube.com/watch?v=L0p5f3ITi10";
  const videoObjectDetectionData = [
    "person",
    "pants",
    "shoe",
    "person",
    "helmet",
    "pants",
    "person",
    "clothing",
    "t-shirt",
    "clothing",
    "skateboard",
    "person",
    "clothing",
    "top",
    "person",
    "person",
    "person",
    "pants",
    "top",
    "sneakers",
  ];

  // performing footage object detection

  const videoLink =
    "https://github.com/intel-iot-devkit/sample-videos/raw/master/face-demographics-walking.mp4";
  const bucketName = "lukas-demo-video";
  const destinationFileName = mission.id;

  const gsLink = await saveVideoToStorage(
    videoLink,
    bucketName,
    destinationFileName
  );

  const objectDetectionData = await analyzeVideo(gsLink);

  const personDetected = objectDetectionData.some((detectionResult) =>
    detectionResult.includes("person")
  );

  // if 'person' detected sending email for detection

  const user = await prisma.user.findUnique({
    where: {
      id: mission.userId,
    },
  });

  if (personDetected) {
    sendEmail(user.email, mission.name);
  }

  // Create inspection log
  const newInspection = await prisma.inspectionLog.create({
    data: {
      missionId: mission.id,
      data: resArray,
      videoURL: gsLink,
      videoObjectDetectionData: objectDetectionData,
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

  // delete the cron job

  await deleteCronJob(mission.cronJobId);

  // make the cronJobID field and cronToken Field null

  await prisma.mission.update({
    data: {
      cronJobId: null,
      cronJobToken: null,
    },
    where: {
      id: mission.id,
    },
  });

  return res.json({
    msg: `Inspection completed for ${mission.name}`,
  });
});

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    app.listen(port, console.log(`Server is listening at ${port}`));
  } catch (error) {
    console.log(error);
  }
};

start();
