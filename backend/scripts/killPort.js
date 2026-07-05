const { exec } = require('child_process');

const port = process.env.PORT || 5000;

function log(msg) {
  console.log(`[killPort] ${msg}`);
}

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { windowsHide: true }, (err, stdout) => {
      if (err) {
        return reject(err);
      }
      resolve(stdout.trim());
    });
  });
}

async function findPid(port) {
  // Windows netstat output:  TCP    0.0.0.0:5000      0.0.0.0:0      LISTENING       12345
  const cmd = `netstat -ano | findstr :${port}`;
  const output = await run(cmd);
  if (!output) return null;

  const lines = output.split(/\r?\n/).filter(Boolean);
  for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    const pid = parts[parts.length - 1];
    if (pid && !isNaN(pid)) {
      return pid;
    }
  }
  return null;
}

async function killPort(port) {
  try {
    const pid = await findPid(port);
    if (!pid) {
      log(`No process found listening on port ${port}`);
      return;
    }

    log(`Killing process on port ${port} (PID ${pid})`);
    await run(`taskkill /PID ${pid} /F`);
    log(`Successfully killed PID ${pid}`);
  } catch (error) {
    log(`Error trying to free port ${port}: ${error.message}`);
  }
}

killPort(port).catch((err) => {
  log(`Unexpected error: ${err.message}`);
});
