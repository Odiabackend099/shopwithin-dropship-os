import { startWorker } from "./workers/processor.js";

const worker = await startWorker();
worker.on("completed", (job) => worker.opts.connection && console.log(`completed ${job.name}:${job.id}`));
worker.on("failed", (job, error) => console.error(`failed ${job?.name}:${job?.id}`, error));
