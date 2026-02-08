pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Sanity Start') {
            steps {
                sh 'timeout 5s npm start || true'
            }
        }

        stage('Deploy with PM2') {
            steps {
                sh '''
                pm2 describe url-shortner >/dev/null 2>&1 || \
                pm2 start index.js --name url-shortner

                pm2 restart url-shortner
                '''
            }
        }
    }
}
