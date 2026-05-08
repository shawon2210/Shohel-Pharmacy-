module.exports = {
  apps: [{
    name: 'pharmacy-server',
    script: './server/index.js',
    cwd: '/mnt/d/all files/Project/Pharmacy',
    instances: 1,
    exec_mode: 'fork',
    
    // Environment
    env: {
      NODE_ENV: 'development',
      PORT: 5001,
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5001,
      NODE_OPTIONS: '--max-old-space-size=1024',
    },
    
    // Auto-restart
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    
    // Logs
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    merge_logs: true,
    
    // Node.js options
    node_args: ['-r', 'dotenv/config'],
  }],
  
  deploy: {
    production: {
      user: 'shawon',
      host: 'your-server.com',
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/pharmacy-management.git',
      path: '/var/www/pharmacy',
      'post-deploy': 'cd server && npm install && cd ../client && npm install && npm run build && pm2 reload ecosystem.config.js'
    }
  }
};