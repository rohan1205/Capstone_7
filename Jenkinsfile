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
                            bat 'npm install'
                            // Uncomment if you have tests
                            // bat 'npm test'
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
                            bat 'npm install'
                            // Uncomment if you have tests
                            // bat 'npm test'
                            bat 'npm run build'
                        }
                    }
                }
            }
        }
        stage('Docker Build & Compose') {
            steps {
                script {
                    if (fileExists('docker-compose.yml')) {
                        bat 'docker-compose build'
                        // Uncomment to run containers
                        // bat 'docker-compose up -d'
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
