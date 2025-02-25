import Log from "../../shared/log/Log";
import { DSEventsReader } from "./dslog/DSEventsReader";
import { DSLogReader } from "./dslog/DSLogReader";

self.onmessage = (event) => {
  // WORKER SETUP
  let { id, payload } = event.data;
  function resolve(result: any) {
    self.postMessage({ id: id, payload: result });
  }
  function reject() {
    self.postMessage({ id: id });
  }

  // MAIN LOGIC

  // Run worker
  let log = new Log();
  if (payload[0] !== null) {
    let dsLog = new DSLogReader(payload[0]);
    if (!dsLog.isSupportedVersion()) {
      reject();
      return;
    }
    dsLog.forEach((entry) => {
      log.putNumber("/DSLog/TripTimeMS", entry.timestamp, entry.tripTimeMs);
      log.putNumber("/DSLog/PacketLoss", entry.timestamp, entry.packetLoss);
      log.putNumber("/DSLog/BatteryVoltage", entry.timestamp, entry.batteryVolts);
      log.putNumber("/DSLog/RioCPUUtilization", entry.timestamp, entry.rioCpuUtilization);
      log.putBoolean("/DSLog/Status/Brownout", entry.timestamp, entry.brownout);
      log.putBoolean("/DSLog/Status/Watchdog", entry.timestamp, entry.watchdog);
      log.putBoolean("/DSLog/Status/DSTeleop", entry.timestamp, entry.dsTeleop);
      log.putBoolean("/DSLog/Status/DSDisabled", entry.timestamp, entry.dsDisabled);
      log.putBoolean("/DSLog/Status/RobotTeleop", entry.timestamp, entry.robotTeleop);
      log.putBoolean("/DSLog/Status/RobotAuto", entry.timestamp, entry.robotAuto);
      log.putBoolean("/DSLog/Status/RobotDisabled", entry.timestamp, entry.robotDisabled);
      log.putNumber("/DSLog/CANUtilization", entry.timestamp, entry.canUtilization);
      log.putNumber("/DSLog/WifiDb", entry.timestamp, entry.wifiDb);
      log.putNumber("/DSLog/WifiMb", entry.timestamp, entry.wifiMb);
      log.putNumberArray("/DSLog/PowerDistributionCurrents", entry.timestamp, entry.powerDistributionCurrents);
    });
  }
  if (payload[1] !== null) {
    let dsEvents = new DSEventsReader(payload[1]);
    if (!dsEvents.isSupportedVersion()) {
      reject();
      return;
    }
    dsEvents.forEach((entry) => {
      log.putString("/DSEvents", entry.timestamp, entry.text);
    });
  }
  resolve(log.toSerialized());
};
