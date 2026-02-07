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

        stage('Sanity Start') {
            steps {
                sh 'timeout 5s npm start || true'
            }
        }
    }
}
