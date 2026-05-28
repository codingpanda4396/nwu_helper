import cluster from "node:cluster";
import os from "node:os";

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  console.log(`Forking ${numCPUs} workers...`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died (code: ${code}, signal: ${signal})`);
    console.log("Starting a new worker...");
    cluster.fork();
  });
} else {
  await import("./server.js");
  console.log(`Worker ${process.pid} started`);
}
