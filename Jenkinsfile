pipeline {
    agent any

    environment {
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Backend Install & Test') {
            steps {
                dir(env.BACKEND_DIR) {
                    script {
                        if (fileExists('package.json')) {
                            sh 'npm install'
                            // Uncomment if you have tests
                            // sh 'npm test'
                        }
                    }
                }
            }
        }
        stage('Frontend Install & Build') {
            steps {
                dir(env.FRONTEND_DIR) {
                    script {
                        if (fileExists('package.json')) {
                            sh 'npm install'
                            // Uncomment if you have tests
                            // sh 'npm test'
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
        stage('Docker Build & Compose') {
            steps {
                script {
                    if (fileExists('docker-compose.yml')) {
                        sh 'docker-compose build'
                        // Uncomment to run containers
                        // sh 'docker-compose up -d'
                    }
                }
            }
        }
    }
    post {
        always {
            cleanWs()
        }
    }
}
