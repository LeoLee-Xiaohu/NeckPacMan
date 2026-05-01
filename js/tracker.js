const FACE_MESH = {
  noseTip: 1,
  leftEyeInner: 133,
  leftEyeOuter: 33,
  rightEyeInner: 362,
  rightEyeOuter: 263,
  mouthLeft: 61,
  mouthRight: 291,
};

export const DIRECTION_THRESHOLDS = {
  LEFT: -15,
  RIGHT: 15,
  UP: -10,
  DOWN: 10,
};

export const POSITION_THRESHOLDS = {
  LEFT: -0.12,
  RIGHT: 0.12,
  UP: -0.12,
  DOWN: 0.12,
};

function averagePoints(points) {
  const total = points.reduce(
    (result, point) => ({
      x: result.x + point.x,
      y: result.y + point.y,
    }),
    { x: 0, y: 0 },
  );

  return {
    x: total.x / points.length,
    y: total.y / points.length,
  };
}

function getLandmarkPoint(landmarks, index) {
  const point = landmarks[index];

  if (!point || typeof point.x !== "number" || typeof point.y !== "number") {
    throw new Error(`Missing or invalid face landmark at index ${index}.`);
  }

  return point;
}

function toDegrees(radians) {
  return (radians * 180) / Math.PI;
}

export function calculatePoseFromLandmarks(landmarks) {
  if (!Array.isArray(landmarks)) {
    throw new Error("Expected landmarks to be an array.");
  }

  const noseTip = getLandmarkPoint(landmarks, FACE_MESH.noseTip);
  const leftEye = averagePoints([
    getLandmarkPoint(landmarks, FACE_MESH.leftEyeInner),
    getLandmarkPoint(landmarks, FACE_MESH.leftEyeOuter),
  ]);
  const rightEye = averagePoints([
    getLandmarkPoint(landmarks, FACE_MESH.rightEyeInner),
    getLandmarkPoint(landmarks, FACE_MESH.rightEyeOuter),
  ]);
  const mouth = averagePoints([
    getLandmarkPoint(landmarks, FACE_MESH.mouthLeft),
    getLandmarkPoint(landmarks, FACE_MESH.mouthRight),
  ]);
  const eyeCenter = averagePoints([leftEye, rightEye]);
  const faceCenter = averagePoints([eyeCenter, mouth]);
  const eyeSpan = Math.max(Math.abs(rightEye.x - leftEye.x), 0.001);
  const faceHeight = Math.max(Math.abs(mouth.y - eyeCenter.y), 0.001);

  return {
    centerX: faceCenter.x,
    centerY: faceCenter.y,
    eyeSpan,
    faceHeight,
    yaw: toDegrees(Math.atan2(noseTip.x - faceCenter.x, eyeSpan / 2)),
    pitch: toDegrees(Math.atan2(noseTip.y - faceCenter.y, faceHeight / 2)),
  };
}

export function getDirectionFromPoseDelta(deltaPose) {
  const candidates = [
    {
      direction: "LEFT",
      active: deltaPose.offsetX < POSITION_THRESHOLDS.LEFT,
      score: Math.abs(deltaPose.offsetX / POSITION_THRESHOLDS.LEFT),
    },
    {
      direction: "RIGHT",
      active: deltaPose.offsetX > POSITION_THRESHOLDS.RIGHT,
      score: Math.abs(deltaPose.offsetX / POSITION_THRESHOLDS.RIGHT),
    },
    {
      direction: "UP",
      active: deltaPose.offsetY < POSITION_THRESHOLDS.UP,
      score: Math.abs(deltaPose.offsetY / POSITION_THRESHOLDS.UP),
    },
    {
      direction: "DOWN",
      active: deltaPose.offsetY > POSITION_THRESHOLDS.DOWN,
      score: Math.abs(deltaPose.offsetY / POSITION_THRESHOLDS.DOWN),
    },
    {
      direction: "LEFT",
      active: deltaPose.yaw < DIRECTION_THRESHOLDS.LEFT,
      score: Math.abs(deltaPose.yaw / DIRECTION_THRESHOLDS.LEFT),
    },
    {
      direction: "RIGHT",
      active: deltaPose.yaw > DIRECTION_THRESHOLDS.RIGHT,
      score: Math.abs(deltaPose.yaw / DIRECTION_THRESHOLDS.RIGHT),
    },
    {
      direction: "UP",
      active: deltaPose.pitch < DIRECTION_THRESHOLDS.UP,
      score: Math.abs(deltaPose.pitch / DIRECTION_THRESHOLDS.UP),
    },
    {
      direction: "DOWN",
      active: deltaPose.pitch > DIRECTION_THRESHOLDS.DOWN,
      score: Math.abs(deltaPose.pitch / DIRECTION_THRESHOLDS.DOWN),
    },
  ].filter((candidate) => candidate.active);

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((left, right) => right.score - left.score);
  return candidates[0].direction;
}

export class PoseTracker {
  constructor() {
    this.neutralPose = null;
    this.currentPose = null;
  }

  updateLandmarks(landmarks) {
    this.currentPose = calculatePoseFromLandmarks(landmarks);
    return this.currentPose;
  }

  calibrate(landmarks = null) {
    if (landmarks) {
      this.updateLandmarks(landmarks);
    }

    if (!this.currentPose) {
      throw new Error("Cannot calibrate without a current pose.");
    }

    this.neutralPose = { ...this.currentPose };
    return this.neutralPose;
  }

  getPoseDelta() {
    if (!this.currentPose || !this.neutralPose) {
      return null;
    }

    return {
      // Front-facing cameras report horizontal motion in camera space, which feels mirrored
      // to the player. Flip horizontal deltas so left/right match the player's own movement.
      offsetX:
        (this.neutralPose.centerX - this.currentPose.centerX) /
        Math.max((this.currentPose.eyeSpan + this.neutralPose.eyeSpan) / 2, 0.001),
      offsetY:
        (this.currentPose.centerY - this.neutralPose.centerY) /
        Math.max((this.currentPose.faceHeight + this.neutralPose.faceHeight) / 2, 0.001),
      yaw: this.neutralPose.yaw - this.currentPose.yaw,
      pitch: this.currentPose.pitch - this.neutralPose.pitch,
    };
  }

  getDirection() {
    const deltaPose = this.getPoseDelta();

    if (!deltaPose) {
      return null;
    }

    return getDirectionFromPoseDelta(deltaPose);
  }
}

export function createDebugLandmarks({ yaw = 0, pitch = 0 } = {}) {
  const landmarks = Array.from({ length: 468 }, () => ({ x: 0.5, y: 0.5 }));
  const yawOffset = Math.tan((yaw * Math.PI) / 180) * 0.08;
  const pitchOffset = Math.tan((pitch * Math.PI) / 180) * 0.11;

  landmarks[FACE_MESH.leftEyeOuter] = { x: 0.35, y: 0.4 };
  landmarks[FACE_MESH.leftEyeInner] = { x: 0.44, y: 0.4 };
  landmarks[FACE_MESH.rightEyeOuter] = { x: 0.65, y: 0.4 };
  landmarks[FACE_MESH.rightEyeInner] = { x: 0.56, y: 0.4 };
  landmarks[FACE_MESH.mouthLeft] = { x: 0.42, y: 0.68 };
  landmarks[FACE_MESH.mouthRight] = { x: 0.58, y: 0.68 };
  landmarks[FACE_MESH.noseTip] = {
    x: 0.5 + yawOffset,
    y: 0.54 + pitchOffset,
  };

  return landmarks;
}
