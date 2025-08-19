module.exports = {
  apps: [{
    name: 'adaso-backend',
    script: 'src/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 7000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 7000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads'],
    merge_logs: true,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    deploy: {
      production: {
        user: 'node',
        host: 'localhost',
        ref: 'origin/main',
        repo: 'git@github.com:username/adaso-backend.git',
        path: '/var/www/adaso-backend',
        'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production'
      }
    }
  }]
};