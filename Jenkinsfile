pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies (CI)') {
            steps {
                sh '''
                echo "=== Installing dependencies in Jenkins workspace ==="
                npm install
                '''
            }
        }

        stage('Run Tests') {
            steps {
                sh '''
                echo "=== Running tests ==="
                npm test
                '''
            }
        }

        stage('Sanity Start') {
            steps {
                sh '''
                echo "=== Sanity start (5 seconds) ==="
                timeout 5s npm start || true
                '''
            }
        }

        stage('Deploy to Server') {
            steps {
                sh '''
                echo "=== Syncing code to deploy directory ==="

                rsync -av --delete \
                  --exclude=node_modules \
                  --exclude=.git \
                  ./ /var/www/url-shortner-deploy/

                echo "=== Installing dependencies in deploy directory ==="
                cd /var/www/url-shortner-deploy
                npm install

                echo "=== Restarting application with PM2 ==="
                pm2 restart ecosystem.config.cjs || pm2 start ecosystem.config.cjs
                '''
            }
        }
    }
}
