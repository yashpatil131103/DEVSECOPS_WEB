pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = "react_frontend"
        BACKEND_IMAGE = "node_backend"
    }

    stages {

        stage('Git Clone') {
            steps {
                echo "📦 Cloning repository..."
                git url: 'https://github.com/yashpatil131103/DEVSECOPS_WEB.git', branch: 'main'
            }
        }

        stage('Cleanup Old Containers & Images') {
            steps {
                echo "🧹 Cleaning up old containers and images if they exist..."
                sh '''
                echo "Stopping and removing old containers..."
                docker ps -a --filter "name=${FRONTEND_IMAGE}" --format "{{.ID}}" | xargs -r docker stop
                docker ps -a --filter "name=${BACKEND_IMAGE}" --format "{{.ID}}" | xargs -r docker stop
                docker ps -a --filter "name=${FRONTEND_IMAGE}" --format "{{.ID}}" | xargs -r docker rm
                docker ps -a --filter "name=${BACKEND_IMAGE}" --format "{{.ID}}" | xargs -r docker rm

                echo "Removing old images..."
                docker images -q ${FRONTEND_IMAGE} | xargs -r docker rmi -f
                docker images -q ${BACKEND_IMAGE} | xargs -r docker rmi -f
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "⚙️ Building new Docker images using docker-compose..."
                sh '''
                docker-compose down --rmi all || true
                docker-compose build --no-cache
                '''
            }
        }

        stage('Run Containers') {
            steps {
                echo "🚀 Running new containers..."
                sh '''
                docker-compose up -d
                docker ps
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                echo "✅ Checking container status..."
                sh '''
                docker ps | grep ${FRONTEND_IMAGE} || echo "Frontend container not found!"
                docker ps | grep ${BACKEND_IMAGE} || echo "Backend container not found!"
                '''
            }
        }
    }

    post {
        always {
            echo "🏁 Pipeline finished — cleaning workspace..."
        }
        success {
            echo "✅ Docker images built and containers running successfully!"
        }
        failure {
            echo "❌ Pipeline failed. Check Jenkins logs for errors."
        }
    }
}
