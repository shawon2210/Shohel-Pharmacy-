const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Shohel Pharmacy Management System...\n');

// Start server
const server = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});
// Wait for backend to be healthy before starting the client
const http = require('http');
const BACKEND_PORT = 5001;
const HEALTH_PATH = '/api/health';

function waitForBackend(host = 'localhost', port = BACKEND_PORT, path = HEALTH_PATH, timeoutMs = 30000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    (function poll() {
      const req = http.get({ hostname: host, port, path, timeout: 2000 }, (res) => {
        if (res.statusCode === 200) {
          resolve(true);
        } else {
          res.resume();
          if (Date.now() - start > timeoutMs) return reject(new Error('timeout'));
          setTimeout(poll, 500);
        }
      });
      req.on('error', () => {
        if (Date.now() - start > timeoutMs) return reject(new Error('timeout'));
        setTimeout(poll, 500);
      });
    })();
  });
}

// Kill any existing processes on port 5001
function killExistingProcess() {
  const { execSync } = require('child_process');
  try {
    const result = execSync('netstat -ano | findstr :5001', { encoding: 'utf8' });
    if (result) {
      const lines = result.split('\n').filter(line => line.includes('LISTENING'));
      lines.forEach(line => {
        const pid = line.trim().split(/\s+/).pop();
        if (pid && !isNaN(pid)) {
          try {
            execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
            console.log(`✅ Killed existing process on port 5001 (PID: ${pid})`);
          } catch (e) {
            // Process might already be dead
          }
        }
      });
    }
  } catch (e) {
    // No process found on port 5001
  }
}

killExistingProcess();

waitForBackend().then(() => {
  console.log('✅ Backend is healthy — starting frontend...');
  const client = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
    shell: true
  });

  client.on('error', (error) => {
    console.error('❌ Client error:', error);
  });
}).catch((err) => {
  console.warn('⚠️ Backend did not become healthy in time, starting frontend anyway:', err.message);
  const client = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
    shell: true
  });
  client.on('error', (error) => {
    console.error('❌ Client error:', error);
  });
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
});

server.on('close', () => {
  console.log('🔄 Server process closed');
});

console.log('📝 Login credentials:');
console.log('   Username: admin');
console.log('   Password: admin123');
console.log('\n🌐 Application will be available at:');
console.log('   Frontend: http://localhost:3000');
console.log('   Backend:  http://localhost:5001');
console.log('\n⚠️  If you see port conflicts, wait a moment and try again.');

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down...');
  server.kill('SIGTERM');
  process.exit(0);
});